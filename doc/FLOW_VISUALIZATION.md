# 转换流程可视化图表

## 1. 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Obsidian 插件                             │
│                   Ink2Vault Plugin                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              入口点 (main.ts)                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. 右键菜单监听                                            │  │
│  │ 2. 配置验证                                                │  │
│  │ 3. 上下文检查 (编辑器链接 vs 新文件)                        │  │
│  │ 4. 调用 convertFile()                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ↓                         ↓
      ┌──────────────────┐      ┌──────────────────┐
      │   PDF 文件       │      │    图片文件       │
      │  (convertPdf     │      │ (convertSingle   │
      │   Stream)        │      │  Image)          │
      └──────────────────┘      └──────────────────┘
             │                         │
             └────────────┬────────────┘
                          ↓
          ┌───────────────────────────┐
          │   ConversionService       │
          │   (转换服务核心)           │
          └───────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
    ┌──────────┐   ┌──────────┐   ┌──────────────┐
    │FileProc  │   │AIService │   │PDFProcessor  │
    │ essor    │   │(API调用) │   │(页面渲染)    │
    └──────────┘   └──────────┘   └──────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ↓
          ┌───────────────────────────┐
          │  输出文件 (Markdown)       │
          │  • 标题                    │
          │  • 自定义内容              │
          │  • AI 转换结果             │
          │  • 元数据注释              │
          └───────────────────────────┘
```

---

## 2. PDF 转换详细流程

```
PDF 文件
   │
   ├─ readBinary()
   │  └─> ArrayBuffer (二进制内容)
   │
   ├─ getPdfInfo()
   │  └─> { numPages: 100 }
   │
   ├─ createOutputFile()
   │  └─> # PDF文件名
   │      [可选自定义内容]
   │      (待填充)
   │
   ├─ openLinkText()
   │  └─> 在编辑器中打开文件
   │
   ├─ streamConvertPdfToImages()
   │  ├─ Page 1 ──> renderPage() ──> Base64 (JPEG)
   │  │                              │
   │  │                              ├─> batchImages[1]
   │  │                              │
   │  │                              └─> updateRenderProgress(1)
   │  │
   │  ├─ Page 2 ──> renderPage() ──> Base64 (JPEG)
   │  │                              │
   │  │                              ├─> batchImages[2]
   │  │                              │
   │  │                              └─> updateRenderProgress(2)
   │  │
   │  └─ ... (100 页)
   │
   ├─ 批量收集 (batchSize=1)
   │  ├─ [Page1] → 创建 Batch Job 1
   │  ├─ [Page2] → 创建 Batch Job 2
   │  └─ ... → 创建 Batch Job 100
   │
   ├─ 并发处理 (concurrencyLimit=2)
   │  │
   │  ├─ Job 1: convertImageBatch([Page1])
   │  │         │
   │  │         ├─> API Call (OpenAI / Gemini)
   │  │         ├─> Markdown 结果
   │  │         └─> 写入到文件 (无分隔)
   │  │
   │  ├─ Job 2: convertImageBatch([Page2])
   │  │         │
   │  │         ├─> API Call
   │  │         ├─> Markdown 结果
   │  │         └─> 写入到文件 (\n\n---\n\n)
   │  │
   │  └─ Job 3: convertImageBatch([Page3])
   │           │
   │           ├─> API Call (同时运行)
   │           ├─> Markdown 结果
   │           └─> 等待 Job 1, 2 完成后按顺序写入
   │
   ├─ 重试机制 (如果失败)
   │  └─ retryConvertImageBatch()
   │     ├─ attempt 0: 立即重试
   │     ├─ attempt 1: 等待 1.2s 后重试
   │     ├─ attempt 2: 等待 2.4s 后重试
   │     └─ max 2: 放弃，写入错误块
   │
   ├─ 有序写入
   │  ├─ 等待 Job 1 完成 → 立即写入
   │  ├─ 等待 Job 2 完成 → 添加分隔符后写入
   │  ├─ 等待 Job 3 完成 → 添加分隔符后写入
   │  └─ ... (保证顺序)
   │
   ├─ 进度更新
   │  ├─ updateRenderProgress() → 页面渲染进度条
   │  ├─ updateAIProgress() → AI 转换进度条
   │  └─ setStatus() → 实时状态文本
   │
   ├─ 完成处理
   │  ├─ 添加元数据注释 (失败页记录)
   │  │  └─ <!-- HandMarkdownAI: {"sourcePath", "totalPages", "failedPages"} -->
   │  │
   │  ├─ 如果有失败页
   │  │  └─> 显示重试选项
   │  │     ├─ 重试所有失败页
   │  │     └─ 重试指定页
   │  │
   │  └─ 如果全部成功
   │     └─> 关闭进度模态
   │
   └─> 返回 ConversionResult
      ├─ markdown: "" (已保存到文件)
      ├─ outputPath: "Handwriting Converted/XXX.md"
      ├─ success: true/false
      ├─ duration: ms
      └─ tokensUsed: number
```

---

## 3. 单张图片转换详细流程

```
图片文件 (.png, .jpg, etc.)
   │
   ├─ processFile()
   │  ├─ readFile() ────> ArrayBuffer
   │  ├─ 验证大小 (< 5MB)
   │  ├─ arrayBufferToBase64() ──> Base64 字符串
   │  └─> FileData {
   │         path, base64, mimeType, size, name
   │      }
   │
   ├─ convertFile()
   │  ├─ 获取当前 API 配置
   │  ├─ 验证模型支持 Vision
   │  ├─ 构建请求
   │  │  ├─ system: conversionPrompt
   │  │  └─ user: [text + image_url]
   │  │
   │  ├─> API Call (OpenAI / Gemini)
   │  │   POST /chat/completions
   │  │   {
   │  │     model: "gpt-4-vision",
   │  │     messages: [...],
   │  │     temperature: 0.3,
   │  │     max_tokens: 4096
   │  │   }
   │  │
   │  ├─> API Response
   │  │   {
   │  │     choices: [{
   │  │       message: {
   │  │         content: "# Heading\n\n..."
   │  │       }
   │  │     }],
   │  │     usage: { total_tokens: 1234 }
   │  │   }
   │  │
   │  └─> Markdown 内容
   │
   ├─ saveConversionResult()
   │  ├─ 确定输出目录
   │  │  └─ "Handwriting Converted" (可配置)
   │  │
   │  ├─ 确定输出文件名
   │  │  ├─ 保留原始名称: "photo.md"
   │  │  ├─ 使用建议名称: AI 从内容提取
   │  │  └─ 使用时间戳: "converted-2025-01-17-101530.md"
   │  │
   │  ├─ 生成完整内容
   │  │  ├─ # 图片文件名
   │  │  │
   │  │  ├─ [自定义内容 (可选)]
   │  │  │
   │  │  └─ [AI 转换结果]
   │  │
   │  ├─ 创建/覆盖文件
   │  │  ├─ 检查是否已存在
   │  │  └─ vault.create() 或 vault.modify()
   │  │
   │  ├─ 自动打开 (可配置)
   │  │  └─ workspace.openLinkText()
   │  │
   │  └─> outputPath
   │
   └─> 返回 ConversionResult
      ├─ markdown: "# 标题\n\n..."
      ├─ outputPath: "Handwriting Converted/photo.md"
      ├─ success: true
      ├─ duration: 3500ms
      └─ tokensUsed: 856
```

---

## 4. 并发批处理架构

```
5 个批次 (假设 imagesPerRequest=1, totalPages=5)

时间轴:
T0  T1  T2  T3  T4  T5  T6  T7  T8  T9  T10
|   |   |   |   |   |   |   |   |   |   |
│   │   │   │   │   │   │   │   │   │   │
Job1: |--API1--|
│   │   │   │   │   │   │   │   │   │   │
Job2:       |--API2--|
│   │   │   │   │   │   │   │   │   │   │
Job3:               |--API3--|
│   │   │   │   │   │   │   │   │   │   │
Job4:                       |--API4--|
│   │   │   │   │   │   │   │   │   │   │
Job5:                           |--API5--|
│   │   │   │   │   │   │   │   │   │   │

写入顺序:
T2  └─> 写入 Job1 (无分隔)
T4  └─> 等待中...
T4+ └─> 写入 Job2 (分隔符 + 内容)
T6  └─> 等待中...
T6+ └─> 写入 Job3 (分隔符 + 内容)
T8  └─> 等待中...
T8+ └─> 写入 Job4 (分隔符 + 内容)
T10 └─> 等待中...
T10+└─> 写入 Job5 (分隔符 + 内容)

关键点:
• 并发限制 = 2 (同时最多 2 个 API 调用)
• 顺序写入 (即使 Job3 先完成，也要等 Job2 写入)
• 分隔符 (--- 区分不同批次)
```

---

## 5. 重试机制流程

```
API Call
   │
   ├─ 成功 (200)
   │  └─> 返回结果
   │
   └─ 失败
      │
      ├─ 429 (Rate Limit)
      │  └─> 进入重试
      │
      ├─ Network Error
      │  └─> 进入重试
      │
      └─ 其他错误
         └─> 直接失败

重试策略 (最多 2 次):

attempt 0:
├─ 立即执行
├─ 如果失败 → 进入 attempt 1
└─ 如果成功 → 返回

attempt 1:
├─ 等待 1200ms (RETRY_BASE_DELAY_MS)
├─ 重新 API Call
├─ 如果失败 → 进入 attempt 2
└─ 如果成功 → 返回

attempt 2:
├─ 等待 2400ms (1200 * 2)
├─ 重新 API Call
├─ 无论结果 → 返回
└─ 失败则写入错误块

指数退避计算:
延迟 = RETRY_BASE_DELAY_MS * 2^attempt
attempt 0: 0ms (立即)
attempt 1: 1.2s
attempt 2: 2.4s

最小化对 API 的冲击，同时快速恢复
```

---

## 6. 进度显示界面

```
┌─────────────────────────────────────────┐
│  正在转换 PDF → Markdown (模态窗口)      │
├─────────────────────────────────────────┤
│                                          │
│  PDF 渲染进度                            │
│  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░]  │
│  已渲染 45/100 页                        │
│                                          │
│  AI 转换进度                             │
│  [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] │
│  已完成批次 9/50                         │
│                                          │
│  状态:                                   │
│  已完成批次 9/50，已处理 45/100 页      │
│  （成功 45 页）                          │
│                                          │
├─────────────────────────────────────────┤
│  [取消]  [最小化]                       │
└─────────────────────────────────────────┘

最小化后:
┌─────────────────────────┐
│ PDF → Markdown 进度      │
├─────────────────────────┤
│ 渲染:                   │
│ [████████░░░░░░░░░░░░] │
│                         │
│ AI:                     │
│ [██████░░░░░░░░░░░░░░] │
│                         │
│ 已完成批次 9/50...      │
├─────────────────────────┤
│  [取消]  [还原]        │
└─────────────────────────┘
(浮动在右下角)
```

---

## 7. 文件输出结构

```
Obsidian Vault
│
├─ Handwriting Converted/  (输出目录)
│  │
│  ├─ Paper001.md  (PDF 转换结果)
│  │  ├─ # Paper001
│  │  │
│  │  ├─ > 来自手写笔记的自动转换内容
│  │  │
│  │  ├─ ---
│  │  │ # Chapter 1
│  │  │ 内容...
│  │  │
│  │  ├─ ---
│  │  │ # Chapter 2
│  │  │ 内容...
│  │  │
│  │  └─ <!-- HandMarkdownAI: {...} -->
│  │
│  ├─ photo001.md  (图片转换结果)
│  │  ├─ # photo001
│  │  │
│  │  ├─ [自定义内容]
│  │  │
│  │  └─ # 识别的标题
│  │     内容...
│  │
│  └─ ...
│
└─ (其他文件夹)
```

---

## 8. 配置参数影响

```
PDF 处理参数:

pdfScale (缩放比例):
  1.0 ──> 原始大小 (快速，可能不清晰)
  1.5 ──> 1.5x 放大 (平衡，推荐)
  2.0 ──> 2x 放大 (慢速，高精度)

pdfQuality (图片质量):
  0.5 ──> 低质量 (快速，文件小)
  0.8 ──> 中等质量 (平衡，推荐)
  1.0 ──> 高质量 (慢速，文件大)

imagesPerRequest (每次请求页数):
  1 ──> 单页处理 (准确，慢速)
  2 ──> 双页合并 (快速，略低准确)
  5 ──> 多页合并 (最快，成本最低)

concurrencyLimit (并发限制):
  1 ──> 串行处理 (最稳定，最慢)
  2 ──> 双并发 (平衡，推荐)
  5+ ──> 高并发 (风险高，易超限)

retryAttempts (重试次数):
  1 ──> 最少重试 (快速放弃)
  2 ──> 标准重试 (推荐)
  3+ ──> 多次重试 (稳定但慢)

timeout (超时时间):
  10s ──> 快速超时 (不推荐)
  30s ──> 标准超时 (推荐)
  60s ──> 宽松超时 (网络差)
```

---

## 9. 错误处理流程

```
发生错误
   │
   ├─ 配置错误 (API Key 缺失)
   │  └─> "请先在设置中配置AI提供商" → 跳转设置
   │
   ├─ 文件错误
   │  ├─ 文件不存在
   │  │  └─> "文件不存在: XXX"
   │  ├─ 文件格式不支持
   │  │  └─> "不支持的文件类型: .xyz"
   │  └─ 文件过大
   │     └─> "文件过大: 6MB (最大支持 5MB)"
   │
   ├─ API 错误
   │  ├─ 401 Unauthorized
   │  │  └─> "API 密钥无效，请检查配置。"
   │  ├─ 429 Rate Limited
   │  │  ├─ quota
   │  │  │  └─> "API配额已用完，请检查账户余额。"
   │  │  └─ rate limit
   │  │     └─> "API请求频率过高，请稍后再试。"
   │  │        (自动重试 + 指数退避)
   │  └─ 其他错误
   │     └─> "API请求失败: 500 Internal Server Error"
   │
   ├─ 批次错误 (PDF)
   │  ├─ 单个批次失败
   │  │  └─> 写入 > [!ERROR] 错误块
   │  │     部分页面失败
   │  │     ├─> 显示完成后操作
   │  │     │  ├─ 重试失败页
   │  │     │  ├─ 重试指定页
   │  │     │  └─ 关闭进度
   │  │     └─> 记录到元数据注释
   │  │
   │  └─ 全部失败
   │     └─> "转换失败: 错误信息"
   │
   └─ 页面渲染错误 (PDF)
      └─> 单页渲染失败
         ├─> 立即写入 > [!ERROR] 块
         └─> 记录该页为失败
```

---

## 10. 数据转换管道

```
输入 (File)
   │
   ├─> FileProcessor.processFile()
   │   ├─ readFile() → ArrayBuffer
   │   ├─ arrayBufferToBase64() → Base64 String
   │   └─ return FileData { base64, mimeType, ... }
   │
   ├─> AIService.convertFile/convertImageBatch()
   │   ├─ buildApiUrl()
   │   ├─ getCurrentModelConfig() → { apiKey, model }
   │   ├─ 构建请求 { messages: [system, user+image] }
   │   ├─ requestUrl() → HTTP POST
   │   └─ 解析响应 → markdown string
   │
   ├─> ConversionService.saveConversionResult()
   │   ├─ 组装完整内容
   │   │  ├─ # 文件名
   │   │  ├─ [自定义内容]
   │   │  └─ [markdown]
   │   ├─ vault.create/modify()
   │   └─ workspace.openLinkText()
   │
   └─> 输出 (File)
       ├─ outputPath: string
       ├─ markdown: string
       └─ success: boolean
```

---

这份可视化文档详细展示了整个转换流程的各个方面，包括架构、数据流、并发处理、错误处理等关键环节。

