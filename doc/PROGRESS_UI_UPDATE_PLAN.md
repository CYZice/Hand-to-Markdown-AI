# Progress UI Update Plan

## 目标

统一并增强 Ink2Vault 的转 Markdown 进度体验，让用户在单图、PDF、批量和失败重试场景中都能清楚知道：当前处理到哪一步、还剩多少、是否失败、失败原因是什么、能否重试。

本计划只覆盖进度 UI 与进度事件设计，不改变现有入口、输出文件策略或 AI 转换核心逻辑。

## 当前问题

1. **PDF 进度信息不够完整**
   - 现有 `ProgressModal` 只有“PDF 渲染进度”和“AI 转换进度”两条进度条。
   - 用户看不到每个批次处于排队、请求、重试、写入还是失败状态。
   - 失败页虽然可重试，但失败原因和重试进展不够集中。

2. **批量转换进度过粗**
   - `BatchProgressModal` 只显示文件级 `n/total`。
   - 无法区分读取文件、PDF 渲染、AI 请求、保存文件等阶段。
   - 多文件失败时没有结构化失败列表。

3. **单张图片转换缺少进度窗口**
   - 单图转换目前主要依赖 `Notice`。
   - 用户无法判断请求是否仍在进行、是否卡在 API 响应、是否正在保存文件。

4. **取消、最小化和完成态反馈不统一**
   - PDF 支持取消和最小化，批量与单图体验不一致。
   - 完成后缺少统一摘要，例如成功数、失败数、失败项、重试入口。

## 目标体验

### 统一任务状态

所有转换任务使用同一组状态描述：

- `pending`：等待开始
- `reading`：读取源文件
- `rendering`：PDF 页面渲染
- `queued`：等待 AI 请求
- `requesting`：正在请求 AI
- `retrying`：正在重试
- `writing`：写入 Markdown
- `done`：完成
- `failed`：失败
- `cancelled`：已取消

### 统一进度摘要

进度面板至少展示：

- 当前文件或当前页
- 总文件数、已完成文件数
- PDF 总页数、已渲染页数
- AI 总批次数、已完成批次数
- 成功数、失败数
- 当前阶段说明
- 失败项列表和错误原因

### 不同场景的展示方式

1. **单图转换**
   - 使用轻量进度面板。
   - 显示读取、请求 AI、写入、完成或失败。

2. **单个 PDF 转换**
   - 保留两条主进度：PDF 渲染、AI 转换。
   - 增加批次状态列表，展示排队、请求、重试、完成、失败。
   - 失败页展示页码、错误原因和重试按钮。

3. **批量文件转换**
   - 展示文件列表，每个文件有独立状态。
   - 当前文件为 PDF 时，可展开显示页级进度。
   - 一个文件失败不阻塞后续文件。

4. **失败重试**
   - 重试失败页或失败文件时复用同一进度面板。
   - 展示重试项总数、当前重试项、成功/失败结果。

## 实现方案

### 1. 定义统一进度类型

在 `src/types.ts` 中新增内部类型：

```ts
export type ConversionTaskStatus =
    | "pending"
    | "reading"
    | "rendering"
    | "queued"
    | "requesting"
    | "retrying"
    | "writing"
    | "done"
    | "failed"
    | "cancelled";

export interface ConversionProgressEvent {
    status: ConversionTaskStatus;
    message: string;
    filePath?: string;
    fileName?: string;
    pageNum?: number;
    batchId?: number;
    totalFiles?: number;
    completedFiles?: number;
    totalPages?: number;
    renderedPages?: number;
    totalBatches?: number;
    completedBatches?: number;
    successCount?: number;
    failureCount?: number;
    error?: string;
}

export type ConversionProgressReporter = (event: ConversionProgressEvent) => void;
```

### 2. 让转换服务统一上报进度

调整 `ConversionService` 的单图、PDF、批量和重试流程：

- 单图：在读取、请求 AI、写入、完成、失败时上报事件。
- PDF：在页面渲染、批次入队、请求 AI、重试、写入、失败页记录时上报事件。
- 批量：每个文件开始和结束时上报文件级状态。
- 重试：复用 PDF 页级事件，标记 `retrying`。

保持现有返回值 `ConversionResult` 不变，避免影响调用方。

### 3. 重构进度 UI

优先扩展现有 `ProgressModal`，将其作为统一进度面板：

- 支持单图、PDF、批量三种模式。
- 保留 PDF 双进度条。
- 增加任务列表区域，显示文件或批次状态。
- 增加失败列表区域，显示失败项、错误原因和重试入口。
- 保留最小化、还原、取消能力。

`BatchProgressModal` 可逐步退役，批量转换改用统一 `ProgressModal`。

### 4. 完成态与失败操作

完成后显示统一摘要：

- 成功文件数
- 失败文件数
- 成功页数
- 失败页数
- 输出文件路径
- 耗时

失败时提供：

- 重试全部失败项
- 重试指定页
- 复制错误详情
- 关闭

### 5. 确认页联动

确认页的“预计消耗 AI 请求”应与实际进度算法一致：

- 使用 `imagesPerRequest` 计算预计批次数。
- 单个 PDF 能读取页数时显示准确页数。
- 多个 PDF 页数未知时明确标注“转换开始后统计”。
- 显示当前并发数和重试次数，避免用户误解速度和费用。

## 验收标准

### 单图转换

- 转换开始后出现进度面板。
- 面板依次显示读取、请求 AI、写入和完成。
- API 失败时显示失败原因。

### PDF 转换

- 显示总页数、已渲染页数、总批次数、已完成批次数。
- 批次请求失败时显示重试中。
- 部分页失败时保留输出文件，并列出失败页。
- 点击重试失败页后能看到重试进度。

### 批量转换

- 每个文件都有状态行。
- 当前文件失败后继续处理后续文件。
- 完成后显示成功/失败摘要。

### 取消与最小化

- 点击取消后停止继续提交新任务。
- 已完成内容不丢失。
- 最小化后仍显示核心进度。
- 还原后进度不重置。

## 实施顺序

1. 新增统一进度类型。
2. 扩展 `ProgressModal` 为统一进度面板。
3. 接入单图转换进度。
4. 接入 PDF 转换页级和批次级进度。
5. 接入批量转换文件级进度，并替换 `BatchProgressModal`。
6. 接入失败重试进度。
7. 更新确认页预估信息。
8. 执行手动测试并修正文案。

## 风险与注意事项

- 不要在进度 UI 修复中改动 AI 请求格式，避免引入模型兼容性问题。
- PDF 并发写入仍需保持顺序，不能因为 UI 状态列表而改变输出顺序。
- 取消操作只能保证停止后续任务，已经发出的 AI 请求可能无法中断。
- 错误详情要避免展示 API Key、请求头或完整请求体。
- 大批量任务的任务列表需要限制 DOM 更新频率，避免 Obsidian UI 卡顿。
