# Hand-Markdown-AI Excalidraw 处理功能分析

## 一、当前系统处理 Markdown 内图片的完整流程

### 1. 入口点分析

#### 1.1 文件转换入口
- **主要入口**：`main.ts` 中的 `handleConvertFile()` 方法
- **功能**：判断当前上下文，决定是在编辑器中插入还是创建新文件

```typescript
// 流程：
1. 检查光标位置是否在图片/文件链接上
2. 如果在链接上 → convertLinkInEditor() - 在编辑器内插入转换结果
3. 如果不在链接上 → convertFile() - 创建新的输出文件
```

#### 1.2 Markdown 内链接提取
- **方法**：`extractImageAtCursor()` 和 `convertLinkInEditor()`
- **支持的链接格式**：
  - Wiki 链接：`![[image.png]]`
  - Markdown 链接：`![alt](image.png)`
  - 普通链接：`[[file.pdf]]`、`[title](file.pdf)`

---

### 2. 文件处理阶段

#### 2.1 文件类型检测和验证
**关键类**：`FileProcessor`

```typescript
// 位置：file-processor.ts
FileProcessor.getFileMimeType(filePath) 
  → 根据扩展名确定 MIME 类型

// 支持的类型（defaults.ts）
SUPPORTED_FILE_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf'
}
```

#### 2.2 单文件处理流程
**方法**：`FileProcessor.processFile()`

```typescript
流程：
1. 获取文件扩展名
2. 验证文件类型（检查 SUPPORTED_FILE_TYPES）
3. 使用 app.vault.readBinary() 读取文件
4. 验证文件大小（不超过 MAX_FILE_SIZE）
5. 转换为 Base64 编码
6. 返回 FileData 对象
   {
     path: string,
     base64: string,      // Base64 编码的文件内容
     mimeType: string,    // 文件 MIME 类型
     size: number,        // 文件字节大小
     name: string        // 文件名
   }
```

---

### 3. AI 转换阶段

#### 3.1 单张图片转换
**方法**：`AIService.convertFile()`

```typescript
流程：
1. 获取当前模型配置
2. 验证模型是否支持图片识别（VISION 或 MULTIMODAL）
3. 构建 AI API 请求：
   {
     model: string,
     messages: [
       {
         role: "system",
         content: 转换提示词
       },
       {
         role: "user",
         content: [
           { type: "text", text: "请将图片转换为Markdown" },
           { type: "image_url", image_url: { url: base64_data } }
         ]
       }
     ],
     temperature: 0.3,
     max_tokens: 4096
   }
4. 发送请求到 AI 服务
5. 解析响应，提取 Markdown 内容
6. 返回 ConversionResult
   {
     markdown: string,      // 转换后的 Markdown 内容
     sourcePath: string,    // 源文件路径
     outputPath: string,    // 输出文件路径
     provider: string,      // AI 供应商
     duration: number,      // 转换耗时
     success: boolean,
     error?: string
   }
```

#### 3.2 批量图片转换
**方法**：`AIService.convertImageBatch()`

```typescript
功能：在单次请求中提交多张图片
流程：
1. 将多张 FileData 转换为 image_url 数组
2. 在单个请求中发送所有图片
3. AI 按顺序转换所有图片
4. 返回合并后的 Markdown 结果

优势：
- 减少 API 调用次数
- 提高处理效率
- 适合 PDF 多页转换
```

---

### 4. PDF 特殊处理流程

#### 4.1 PDF 检测和流式处理
**位置**：`conversion-service.ts` 中的 `convertPdfStream()`

```typescript
检测流程：
if (mimeType === "application/pdf") {
  → convertPdfStream()  // PDF 专用流式处理
} else {
  → convertSingleImage() // 单张图片处理
}
```

#### 4.2 PDF 转图片
**工具类**：`PDFProcessor`

```typescript
关键方法：
1. PDFProcessor.getPdfInfo(buffer)
   → 获取 PDF 总页数等信息

2. PDFProcessor.streamConvertPdfToImages(
     buffer,
     onPageConverted,  // 页面渲染完成回调
     onProgress,       // 进度回调
     options
   )
   → 逐页将 PDF 转换为 JPEG Base64

转换参数：
{
  scale: 1.5,          // 图像缩放比例
  quality: 0.8,        // JPEG 质量 (0-1)
  format: 'jpeg',      // 输出格式
  timeoutPerPage: 30000 // 单页超时时间
}
```

#### 4.3 PDF 流式转换的关键特性
```typescript
流程：
1. 立即创建输出文件
2. 立即打开输出文件（实时查看进度）
3. 并发处理多个页面批次（CONCURRENCY_LIMIT）
4. 实时将转换结果写入输出文件
5. 支持失败页重试
6. 记录失败页元数据（JSON 注释）
```

---

### 5. 输出和保存阶段

#### 5.1 单图片输出
**方法**：`ConversionService.saveConversionResult()`

```typescript
流程：
1. 确定输出目录
   - 从 settings.outputSettings.outputDir 读取
2. 确定输出文件名
   - 如果 keepOriginalName: 保留原文件名 + 输出扩展名
   - 如果提供 suggestedFilename: 使用 Markdown 中提取的标题
   - 否则: 使用时间戳 (converted-{timestamp}.md)
3. 生成文件内容
   # {文件名}
   {contentAfterTitle}
   {markdown转换结果}
4. 创建或覆盖输出文件
5. 可选：自动打开输出文件
```

#### 5.2 PDF 输出
**方法**：`ConversionService.convertPdfStream()`

```typescript
流程：
1. 立即创建输出文件（含标题）
2. 立即打开文件（readonly 状态）
3. 逐页转换并实时追加内容
   - 成功页：追加 Markdown + 分隔符
   - 失败页：追加错误块 > [!ERROR]
4. 最终追加元数据注释（JSON）
   <!-- HandMarkdownAI: {sourcePath, totalPages, failedPages} -->

文件结构：
# {PDF文件名}

{contentAfterTitle}

--- 

## Page 1 转换结果

---

## Page 2 转换结果

---

> [!ERROR] 第 5 页渲染失败: ...

<!-- HandMarkdownAI: {...} -->
```

#### 5.3 在编辑器中插入
**方法**：`main.ts` 中的 `convertLinkInEditor()`

```typescript
流程：
1. 解析链接指向的文件路径
2. 读取并转换该文件
3. 在编辑器中的链接下方插入转换结果
   editor.replaceRange(
     insertText,
     { line: insertLine, ch: 0 }
   )
```

---

### 6. 设置配置

**关键配置项**（`types.ts` 和 `defaults.ts`）：

```typescript
interface OutputSettings {
  outputDir: string;              // 输出目录
  outputExtension: string;        // 输出扩展名（默认 'md'）
  keepOriginalName: boolean;      // 是否保留原文件名
  contentAfterTitle?: string;     // 标题后的自定义内容
  autoOpen: boolean;              // 是否自动打开输出文件
}

interface AdvancedSettings {
  imagesPerRequest: number;       // 单次请求的图片数（批量处理）
  pdfScale: number;               // PDF 渲染缩放
  pdfQuality: number;             // JPEG 质量
  timeout: number;                // 页面转换超时
  concurrencyLimit: number;       // 并发处理数
  retryAttempts: number;          // 失败重试次数
}
```

---

## 二、Excalidraw 集成方案

### 1. 检测 Excalidraw 文件

**扩展支持的文件类型**：
```typescript
// 在 defaults.ts 中添加
SUPPORTED_FILE_TYPES 中添加：
'.excalidraw': 'application/json'  // Excalidraw JSON 格式

// 在 file-processor.ts 中添加检测
```

### 2. Excalidraw 转 PNG 流程

**新增 ExcalidrawProcessor 类**：

```typescript
// 位置：src/utils/excalidraw-processor.ts

class ExcalidrawProcessor {
  /**
   * 将 Excalidraw JSON 转换为 PNG
   */
  static async convertExcalidrawToPng(
    jsonData: string,        // Excalidraw JSON 内容
    filePath: string,        // 源文件路径
    options?: {
      scale?: number;        // 缩放因子
      quality?: number;      // 质量
    }
  ): Promise<FileData> {
    // 1. 解析 Excalidraw JSON
    const excalidrawData = JSON.parse(jsonData);
    
    // 2. 调用 Excalidraw 渲染库生成 PNG
    // 方案 A：使用 excalidraw-app 的离线渲染
    // 方案 B：使用 canvas 或 SVG 转换库
    
    // 3. 返回 PNG 的 FileData
    return {
      path: filePath,
      base64: pngBase64,
      mimeType: 'image/png',
      size: pngBase64.length,
      name: getFileName(filePath)
    };
  }
  
  /**
   * 批量转换 Excalidraw 文件
   */
  static async convertExcalidrawFiles(
    filePaths: string[],
    app: App
  ): Promise<FileData[]> {
    // 逐文件转换
  }
}
```

### 3. 集成流程修改

**修改位置**：`conversion-service.ts` 和 `file-processor.ts`

```typescript
// 在 convertFile() 中添加：
const mimeType = FileProcessor.getFileMimeType(filePath);

if (mimeType === "application/pdf") {
  return await this.convertPdfStream(filePath, startTime);
} else if (mimeType === "application/json" && filePath.endsWith('.excalidraw')) {
  // Excalidraw 处理
  return await this.convertExcalidraw(filePath, startTime);
} else {
  return await this.convertSingleImage(filePath, startTime);
}

// 新增方法：
private async convertExcalidraw(filePath: string, startTime: number): Promise<ConversionResult> {
  try {
    // 1. 读取 Excalidraw 文件
    const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
    const jsonContent = await this.app.vault.read(file);
    
    // 2. 转换为 PNG（转为 FileData）
    const pngFileData = await ExcalidrawProcessor.convertExcalidrawToPng(
      jsonContent,
      filePath
    );
    
    // 3. 使用现有的图片处理流程
    const prompt = this.getConversionPrompt();
    const conversionResult = await this.aiService.convertFile(pngFileData, prompt);
    
    // 4. 保存输出
    const outputPath = await this.saveConversionResult(
      pngFileData,
      conversionResult.markdown,
      this.extractSuggestedFilename(conversionResult.markdown)
    );
    
    // 5. 返回结果
    return {
      ...conversionResult,
      outputPath,
      sourcePath: filePath,
      success: true
    };
    
  } catch (error) {
    // 错误处理
    return {
      markdown: "",
      sourcePath: filePath,
      outputPath: "",
      provider: this.settings.currentModel || "unknown",
      duration: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
```

### 4. Markdown 内 Excalidraw 链接处理

**流程**：与处理图片链接一致

```typescript
// 支持的 Markdown 链接格式：
![[drawing.excalidraw]]        // Wiki 嵌入
![diagram](drawing.excalidraw) // Markdown 图片链接
[[drawing.excalidraw]]         // Wiki 链接

// convertLinkInEditor() 会自动支持，流程：
1. 检测 .excalidraw 文件链接
2. 调用 convertExcalidraw()
3. 在编辑器中插入转换后的 Markdown
```

---

## 三、关键技术决策

### 1. Excalidraw 转 PNG 的方案选择

**方案对比**：

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| excalidraw-utils | 官方库，准确 | 可能需要浏览器环境 | ✓ |
| Canvas/OffscreenCanvas | 无依赖，轻量 | 需要自己实现渲染 | |
| SVG 转换 | 向量格式 | 需要转换工具 | |
| API 调用 | 完全准确 | 需要网络、成本 | |

**推荐方案**：使用 Excalidraw 官方库（如果支持）或社区库

### 2. 与现有 PDF 流程的一致性

```
PDF 流程 → 转为图片 → 调用 convertImageBatch()
Excalidraw → 转为 PNG → 调用 convertFile() 或 convertImageBatch()

一致性保证：
- 都经过图片处理流程
- 都支持批量处理（如果有多个 Excalidraw 文件）
- 都使用同样的 AI 转换 Prompt
- 都支持在 Markdown 内插入结果
```

### 3. 输出文件格式

```
与处理普通图片一致：
# {Excalidraw 文件名}

{contentAfterTitle}

{AI 转换的 Markdown 内容}
```

---

## 四、实现清单

- [ ] 1. 在 `SUPPORTED_FILE_TYPES` 中添加 `.excalidraw` 支持
- [ ] 2. 创建 `ExcalidrawProcessor` 工具类
- [ ] 3. 实现 Excalidraw → PNG 转换函数
- [ ] 4. 在 `ConversionService.convertFile()` 中添加 Excalidraw 分支
- [ ] 5. 在 `file-processor.ts` 中添加 Excalidraw 文件验证
- [ ] 6. 更新 UI（如需要支持 Excalidraw 文件选择）
- [ ] 7. 测试：单个 Excalidraw 文件转换
- [ ] 8. 测试：Markdown 内 Excalidraw 链接处理
- [ ] 9. 测试：错误处理（无效的 Excalidraw 文件）
- [ ] 10. 添加进度提示

---

## 五、代码注意事项

### 1. 文件读取
```typescript
// Obsidian 环境中正确的读取方式
const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
const content = await this.app.vault.read(file);  // 文本文件
const binary = await this.app.vault.readBinary(file);  // 二进制文件
```

### 2. Base64 编码
```typescript
// 确保返回格式与其他图片处理一致
// 对于图片：data:image/png;base64,...
// 确保 AIService.convertFile() 能正确识别
```

### 3. 错误处理
```typescript
// 遵循现有的错误处理模式
try {
  // 转换逻辑
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  new Notice(`Excalidraw 转换失败: ${errorMessage}`, 5000);
  // 返回失败的 ConversionResult
}
```

### 4. 配置和设置
```typescript
// 如果 Excalidraw 转换需要特殊参数，添加到 PluginSettings
interface PluginSettings {
  // 现有配置...
  excalidrawSettings?: {
    scale?: number;
    quality?: number;
    format?: 'png' | 'svg';
  };
}
```

---

## 六、后续优化方向

1. **批量 Excalidraw 处理**：支持文件夹内多个 Excalidraw 文件
2. **格式选择**：支持输出 SVG 格式（矢量，可编辑）
3. **智能识别**：自动识别图表类型（流程图、思维导图等）
4. **图层处理**：如果需要，可逐层转换
5. **性能优化**：缓存转换结果

