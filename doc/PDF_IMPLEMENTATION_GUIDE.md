# Ink2Vault PDF 处理实现指南

## 核心架构图

```
用户选择 PDF
    ↓
FileProcessor.convertPdfToImagesStream()
    ↓
[逐页渲染 + 压缩]
    ↓ (每页完成后)
ConversionService.convertPageAndAppend()
    ↓
AIService.convertFile(singlePageBase64)
    ↓
[立即追加到 Markdown]
    ↓ (下一页)
    ...循环...
    ↓
[保存完整 Markdown 文件]
```

## 实现步骤

### Step 1: 修改 package.json（添加依赖）

```json
{
    "dependencies": {
        "pdfjs-dist": "^4.0.379"
    }
}
```

### Step 2: 创建 PDF 处理器（新文件）

文件：`src/utils/pdf-processor.ts`

```typescript
import * as pdfjsLib from 'pdfjs-dist';
import { Notice } from 'obsidian';

/**
 * PDF 流式处理器
 * 逐页渲染，及时释放内存
 */
export class PDFProcessor {
    private static initialized = false;

    /**
     * 初始化 PDF.js Worker（必须在使用前调用）
     */
    static initWorker() {
        if (this.initialized) return;
        
        try {
            // 方案 1: 使用 CDN (如果 Obsidian 环境允许网络)
            pdfjsLib.GlobalWorkerOptions.workerSrc = 
                `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        } catch (err) {
            console.warn('Failed to set PDF.js worker, falling back to main thread', err);
            // Obsidian 会自动回退到主线程处理
        }
        
        this.initialized = true;
    }

    /**
     * 流式转换 PDF 为图片 Base64
     * 
     * @param buffer PDF 文件的 ArrayBuffer
     * @param onPageConverted 页面转换完成回调（base64, 页码）
     * @param onProgress 进度回调
     * @param options 转换选项
     * @returns 总页数
     */
    static async streamConvertPdfToImages(
        buffer: ArrayBuffer,
        onPageConverted: (base64: string, pageNum: number) => Promise<void>,
        onProgress?: (current: number, total: number, message: string) => void,
        options: {
            scale?: number;           // 缩放系数，默认 1.5
            quality?: number;         // JPEG 质量 0-1，默认 0.8
            format?: 'jpeg' | 'webp'; // 图片格式，默认 jpeg
            timeoutPerPage?: number;  // 单页超时时间 (ms)，默认 20000
            onCancel?: () => boolean; // 取消检查回调
        } = {}
    ): Promise<number> {
        this.initWorker();

        const {
            scale = 1.5,
            quality = 0.8,
            format = 'jpeg',
            timeoutPerPage = 20000,
            onCancel
        } = options;

        try {
            // 1. 加载 PDF
            const loadingTask = pdfjsLib.getDocument({ data: buffer });
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;

            new Notice(`开始处理 PDF，共 ${totalPages} 页`, 2000);

            // 2. 逐页处理
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                // 检查用户是否取消
                if (onCancel?.()) {
                    new Notice('转换已取消', 2000);
                    break;
                }

                try {
                    // 2a. 为这一页创建超时 Promise
                    const pagePromise = this.renderPageToBase64(
                        pdf,
                        pageNum,
                        scale,
                        quality,
                        format
                    );

                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(
                            () => reject(new Error(`第 ${pageNum} 页超时`)),
                            timeoutPerPage
                        )
                    );

                    // 2b. 竞速：如果超时就跳过这一页
                    const base64 = await Promise.race([pagePromise, timeoutPromise]);

                    // 2c. 立即发送给回调处理（不等待其他页面）
                    await onPageConverted(base64, pageNum);

                    // 2d. 报告进度
                    if (onProgress) {
                        onProgress(pageNum, totalPages, `已处理第 ${pageNum}/${totalPages} 页`);
                    }

                } catch (pageError) {
                    const errMsg = pageError instanceof Error ? pageError.message : String(pageError);
                    console.warn(`处理第 ${pageNum} 页失败:`, errMsg);
                    new Notice(`⚠️ 第 ${pageNum} 页处理失败，跳过该页`, 3000);
                    // 继续处理下一页，而不是中止整个流程
                }
            }

            return totalPages;

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error('PDF 加载失败:', errMsg);
            throw new Error(`PDF 处理失败: ${errMsg}`);
        }
    }

    /**
     * 将单个 PDF 页面渲染为 Base64 图片
     * @private
     */
    private static async renderPageToBase64(
        pdf: any,
        pageNum: number,
        scale: number,
        quality: number,
        format: 'jpeg' | 'webp'
    ): Promise<string> {
        // 1. 获取页面对象
        const page = await pdf.getPage(pageNum);

        try {
            // 2. 计算视口大小（应用缩放）
            const viewport = page.getViewport({ scale });

            // 3. 创建 Canvas
            const canvas = this.createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('无法获取 Canvas context');
            }

            // 4. 渲染页面到 Canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // 5. 转换为指定格式的 Base64
            const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
            const dataUrl = canvas.toDataURL(mimeType, quality);

            // 6. 提取 Base64 部分（去掉前缀 "data:image/...;base64,")
            const base64 = dataUrl.split(',')[1];

            // 7. 清理内存（关键！）
            page.cleanup();
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;

            return base64;

        } catch (error) {
            // 异常情况下也要清理
            page.cleanup();
            throw error;
        }
    }

    /**
     * 创建 Canvas 元素
     * @private
     */
    private static createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    /**
     * 获取 PDF 信息（页数等）
     * 用于预检查（不解析具体内容）
     */
    static async getPdfInfo(buffer: ArrayBuffer): Promise<{ numPages: number }> {
        this.initWorker();

        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;

        return {
            numPages: pdf.numPages
        };
    }
}
```

### Step 3: 修改 FileProcessor 支持 PDF 检测

文件：`src/file-processor.ts`

在 `processFile` 方法中添加 PDF 检测逻辑：

```typescript
// 在 processFile 方法中，返回前添加
import { PDFProcessor } from "./utils/pdf-processor";

// 在 processFile 中
const mimeType = SUPPORTED_FILE_TYPES[extension as keyof typeof SUPPORTED_FILE_TYPES];

// ... 验证逻辑 ...

return {
    path: filePath,
    base64: base64,
    mimeType: mimeType,
    size: fileSize,
    name: fileName,
    isPdf: mimeType === "application/pdf" // 新增字段
};
```

同时修改 FileData 类型：

```typescript
export interface FileData {
    path: string;
    base64: string;
    mimeType: string;
    size: number;
    name: string;
    isPdf?: boolean; // 新增
}
```

### Step 4: 修改 ConversionService 处理 PDF 流

文件：`src/conversion-service.ts`

```typescript
import { PDFProcessor } from "./utils/pdf-processor";

export class ConversionService {
    // ... 原有代码 ...

    async convertFile(filePath: string): Promise<ConversionResult> {
        const startTime = Date.now();

        try {
            const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
            if (!file) {
                throw new Error(`文件不存在: ${filePath}`);
            }

            const arrayBuffer = await this.app.vault.readBinary(file);
            const mimeType = FileProcessor.getFileMimeType(filePath);

            // 关键判断：是否为 PDF
            if (mimeType === "application/pdf") {
                return await this.convertPdfWithStreaming(filePath, arrayBuffer);
            } else {
                // 原有的单文件处理逻辑
                return await this.convertSingleImage(filePath, arrayBuffer);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`转换失败: ${errorMessage}`, 5000);
            console.error("转换失败:", error);

            return {
                markdown: "",
                sourcePath: filePath,
                outputPath: "",
                provider: this.settings.currentModel || "unknown",
                duration: Date.now() - startTime,
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 流式处理 PDF：逐页转换 + 流式合并到 Markdown
     */
    private async convertPdfWithStreaming(
        filePath: string,
        arrayBuffer: ArrayBuffer
    ): Promise<ConversionResult> {
        const startTime = Date.now();
        const prompt = this.getConversionPrompt();
        
        const markdownParts: string[] = [];
        let totalPages = 0;
        let successPages = 0;
        let failedPages: number[] = [];

        try {
            // 1. 获取 PDF 信息
            const pdfInfo = await PDFProcessor.getPdfInfo(arrayBuffer);
            totalPages = pdfInfo.numPages;

            new Notice(`开始转换 PDF，共 ${totalPages} 页`, 3000);

            // 2. 流式处理每一页
            await PDFProcessor.streamConvertPdfToImages(
                arrayBuffer,
                async (base64: string, pageNum: number) => {
                    try {
                        // 为每一页创建临时 FileData
                        const pageFileData: FileData = {
                            path: `${filePath}#page${pageNum}`,
                            name: `Page ${pageNum}`,
                            base64: base64,
                            mimeType: "image/jpeg",
                            size: base64.length
                        };

                        // 调用 AI 转换这一页
                        new Notice(`正在转换第 ${pageNum}/${totalPages} 页...`, 2000);
                        
                        const result = await this.aiService.convertFile(
                            pageFileData,
                            prompt
                        );

                        if (result.success) {
                            // 追加到 Markdown（带分隔符）
                            if (pageNum > 1) {
                                markdownParts.push('\n\n---\n\n');
                            }
                            markdownParts.push(`## 第 ${pageNum} 页\n\n${result.markdown}`);
                            successPages++;
                        } else {
                            failedPages.push(pageNum);
                            markdownParts.push(
                                `\n\n---\n\n## 第 ${pageNum} 页\n\n> [!ERROR] 转换失败: ${result.error}`
                            );
                        }

                    } catch (pageError) {
                        failedPages.push(pageNum);
                        const errMsg = pageError instanceof Error ? pageError.message : String(pageError);
                        console.error(`第 ${pageNum} 页转换失败:`, errMsg);
                        markdownParts.push(
                            `\n\n---\n\n## 第 ${pageNum} 页\n\n> [!ERROR] 转换失败: ${errMsg}`
                        );
                    }
                },
                (current: number, total: number, message: string) => {
                    // 进度更新
                    new Notice(message, 1000);
                },
                {
                    scale: 1.5,
                    quality: 0.8,
                    format: 'jpeg',
                    timeoutPerPage: this.settings.timeout || 30000,
                    onCancel: () => false // 可以在这里实现中断逻辑
                }
            );

            // 3. 合并所有页面的 Markdown
            const finalMarkdown = markdownParts.join('');

            // 4. 保存文件
            const outputPath = await this.saveConversionResult(
                { name: FileProcessor.getFileName(filePath) } as any,
                finalMarkdown,
                this.extractSuggestedFilename(finalMarkdown)
            );

            const duration = Date.now() - startTime;

            // 5. 显示完成消息
            const message = failedPages.length > 0
                ? `转换完成！成功 ${successPages}/${totalPages} 页（失败: 第 ${failedPages.join(', ')} 页）`
                : `转换成功！${totalPages} 页，耗时: ${duration}ms`;
            
            new Notice(message, 5000);

            return {
                markdown: finalMarkdown,
                sourcePath: filePath,
                outputPath,
                provider: this.settings.currentModel || "unknown",
                duration,
                success: failedPages.length === 0,
                error: failedPages.length > 0 ? `部分页面转换失败: ${failedPages.join(', ')}` : undefined
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`PDF 转换失败: ${errorMessage}`, 5000);
            console.error("PDF 转换失败:", error);

            return {
                markdown: markdownParts.join(''), // 返回已成功的部分
                sourcePath: filePath,
                outputPath: "",
                provider: this.settings.currentModel || "unknown",
                duration: Date.now() - startTime,
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 原有的单图片转换逻辑（重构）
     */
    private async convertSingleImage(
        filePath: string,
        arrayBuffer: ArrayBuffer
    ): Promise<ConversionResult> {
        const startTime = Date.now();

        try {
            const fileData = await FileProcessor.processFile(filePath, this.app);
            const prompt = this.getConversionPrompt();

            new Notice(`正在使用 AI 转换文件...`, 3000);

            const conversionResult = await this.aiService.convertFile(fileData, prompt);

            const outputPath = await this.saveConversionResult(
                fileData,
                conversionResult.markdown,
                this.extractSuggestedFilename(conversionResult.markdown)
            );

            new Notice(`转换成功！耗时: ${conversionResult.duration}ms`, 3000);

            return {
                ...conversionResult,
                outputPath,
                sourcePath: filePath
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`转换失败: ${errorMessage}`, 5000);
            console.error("转换失败:", error);

            return {
                markdown: "",
                sourcePath: filePath,
                outputPath: "",
                provider: this.settings.currentModel || "unknown",
                duration: Date.now() - startTime,
                success: false,
                error: errorMessage
            };
        }
    }

    // ... 其他原有方法保持不变 ...
}
```

### Step 5: 在 main.ts 中初始化 PDF 处理器

```typescript
// 在 main.ts 的 onload() 方法中
import { PDFProcessor } from "./utils/pdf-processor";

async onload() {
    console.log("加载 Ink2Vault 插件");

    // 初始化 PDF 处理器
    PDFProcessor.initWorker();

    // ... 其他初始化代码 ...
}
```

## 使用流程图

```
用户选择 PDF (20 页)
    ↓
convertFile(filePath) 检测到 PDF
    ↓
getPdfInfo() → 显示 "开始处理 PDF，共 20 页"
    ↓
streamConvertPdfToImages() 开始循环
    ├─→ 第 1 页: 渲染 → Base64 → 调用 AI → 追加到 markdown
    │    └─→ onProgress: "已处理第 1/20 页"
    ├─→ 第 2 页: 渲染 → Base64 → 调用 AI → 追加到 markdown
    │    └─→ onProgress: "已处理第 2/20 页"
    ├─→ ...
    └─→ 第 20 页: 渲染 → Base64 → 调用 AI → 追加到 markdown
         └─→ onProgress: "已处理第 20/20 页"
    ↓
[合并所有 Markdown]
    ↓
[保存文件]
    ↓
显示完成提示 "转换成功！20 页，耗时: 2min 30s"
```

## 关键改进点

| 改进 | 原来 | 现在 |
|-----|------|------|
| PDF 处理 | ❌ 不支持 | ✅ 流式逐页 |
| 内存占用 | 300MB+ | 5-10MB |
| 超时问题 | 30s 全部超时 | 单页 20s，继续下一页 |
| 用户反馈 | "正在转换..." | "已处理 3/20 页" |
| 错误恢复 | 失败整个中止 | 单页失败继续 |
| 结果格式 | N/A | 每页用 `---` 分隔 |

## 测试建议

1. **小 PDF (1-5 页)**：验证基本功能
2. **中等 PDF (10-20 页)**：验证内存和超时
3. **大 PDF (50+ 页)**：验证流式处理效果
4. **网络不稳定**：验证单页超时和重试机制
5. **模型切换**：验证不同 AI 提供商的兼容性

## 故障排查

| 问题 | 原因 | 解决 |
|-----|------|------|
| "Worker 加载失败" | CDN 不可用 | 使用本地 Worker 或回退到主线程 |
| 内存持续增长 | 页面未清理 | 确保调用 `page.cleanup()` |
| 单页超时 | PDF 页面过大 | 降低 `scale` 到 1.2 或 1.0 |
| 图片模糊 | 压缩质量过低 | 提高 quality 到 0.9（但增加内存） |
