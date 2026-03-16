import { App, Notice, TFile } from "obsidian";
import { DEFAULT_CONVERSION_PROMPT } from "./defaults";
import { FileProcessor } from "./file-processor";
import { AIService } from "./services/ai-service";
import { ConversionResult, FileData, PluginSettings, ProgressCallback } from "./types";
import { ProgressModal } from "./ui/progress-modal";
import { PDFProcessor } from "./utils/pdf-processor";

export class ConversionService {
    private app: App;
    private settings: PluginSettings;
    private aiService: AIService;

    constructor(app: App, settings: PluginSettings) {
        this.app = app;
        this.settings = settings;
        this.aiService = new AIService(settings, app);
    }

    updateSettings(settings: PluginSettings): void {
        this.settings = settings;
        this.aiService.updateSettings(settings);
    }

    private getConversionPrompt(): string {
        return this.settings.conversionPrompt || DEFAULT_CONVERSION_PROMPT;
    }

    async convertFile(filePath: string, options?: { pdfPages?: number[] }): Promise<ConversionResult> {
        const startTime = Date.now();

        let progressModal: ProgressModal | null = null;
        try {
            // 检测文件类型
            const mimeType = FileProcessor.getFileMimeType(filePath);

            // 判断是否为 PDF
            if (mimeType === "application/pdf") {
                // PDF 流式处理（新增）
                return await this.convertPdfStream(filePath, startTime, options?.pdfPages);
            } else {
                // 单张图片处理（保留原有逻辑）
                return await this.convertSingleImage(filePath, startTime);
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
     * 单张图片转换（原有逻辑）
     */
    private async convertSingleImage(filePath: string, startTime: number): Promise<ConversionResult> {
        try {
            const fileData = await FileProcessor.processFile(filePath, this.app);

            const prompt = this.getConversionPrompt();

            new Notice(`正在使用 AI 转换文件...`, 3000);

            const conversionResult = await this.aiService.convertFile(fileData, prompt);
            const processedMarkdown = ConversionService.postProcessConvertedMarkdown(conversionResult.markdown, this.settings);

            const outputPath = await this.saveConversionResult(
                fileData,
                processedMarkdown,
                this.extractSuggestedFilename(processedMarkdown)
            );

            new Notice(`转换成功！耗时: ${conversionResult.duration}ms`, 3000);

            return {
                ...conversionResult,
                markdown: processedMarkdown,
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

    /**
     * PDF 流式处理（新增）
     * 逐页转换，实时写入文件
     */
    private async convertPdfStream(filePath: string, startTime: number, pdfPages?: number[]): Promise<ConversionResult> {
        let totalPages = 0;
        let successPages = 0;
        let failedPages: number[] = [];
        let outputFile: TFile | null = null;
        let outputPath = "";

        // 并发与重试参数（可根据需要调整或未来搬到设置）
        const CONCURRENCY_LIMIT = this.settings.advancedSettings?.concurrencyLimit ?? 2;
        const RETRY_ATTEMPTS = this.settings.advancedSettings?.retryAttempts ?? 2;
        const RETRY_BASE_DELAY_MS = 1200;

        let progressModal: ProgressModal | null = null;

        try {
            // 1. 读取 PDF 文件
            const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
            if (!file) {
                throw new Error(`文件不存在: ${filePath}`);
            }

            const arrayBuffer = await this.app.vault.readBinary(file);

            // 2. 获取 PDF 信息
            const bufferForInfo = arrayBuffer.slice(0);
            const pdfInfo = await PDFProcessor.getPdfInfo(bufferForInfo);
            const pdfTotalPages = pdfInfo.numPages;
            const normalizedPages = pdfPages && pdfPages.length > 0
                ? Array.from(new Set(pdfPages.map(n => Math.floor(n)).filter(n => n > 0 && n <= pdfTotalPages))).sort((a, b) => a - b)
                : [];
            if (pdfPages && pdfPages.length > 0 && normalizedPages.length === 0) {
                throw new Error("页码范围无效");
            }
            const pagesToProcess = normalizedPages.length > 0
                ? normalizedPages
                : Array.from({ length: pdfTotalPages }, (_, i) => i + 1);
            totalPages = pagesToProcess.length;

            const noticeText = totalPages !== pdfTotalPages
                ? `开始处理 PDF，共 ${totalPages} 页（从 ${pdfTotalPages} 页中选择）`
                : `开始处理 PDF，共 ${totalPages} 页`;
            new Notice(noticeText, 3000);

            const batchSize = this.settings.advancedSettings?.imagesPerRequest || 1;
            const expectedTotalJobs = Math.max(1, Math.ceil(totalPages / batchSize));

            // 进度模态框
            progressModal = new ProgressModal(this.app);
            progressModal.open();
            progressModal.setTotals(totalPages, expectedTotalJobs);
            if (this.settings.advancedSettings?.autoMinimizeProgress) {
                progressModal.minimize();
            }

            // 3. 立即创建输出文件
            const fileName = FileProcessor.getFileName(filePath);
            const fileData: FileData = {
                path: filePath,
                base64: "",
                mimeType: "application/pdf",
                size: 0,
                name: fileName,
                isPdf: true
            };

            outputPath = await this.createOutputFile(
                fileData,
                `# ${fileName}\n${this.settings.outputSettings.contentAfterTitle
                    ? '\n' + this.settings.outputSettings.contentAfterTitle + '\n\n'
                    : '\n'
                }`
            );
            outputFile = this.app.vault.getAbstractFileByPath(outputPath) as TFile;

            // 4. 立即打开文件
            await this.app.workspace.openLinkText(outputFile.path, "", true);

            const prompt = this.getConversionPrompt();

            // 5. 流式处理每一页（支持批量提交图片）
            let batchImages: FileData[] = [];
            let batchPages: number[] = [];

            // 批次并发池
            type BatchJob = { id: number; images: FileData[]; pages: number[] };
            let jobCounter = 0;
            let totalJobs = 0;
            const jobQueue: BatchJob[] = [];
            let activeJobs = 0;
            const jobResults = new Map<number, { result: import("./types").ConversionResult; job: BatchJob }>();
            let nextWriteId = 1;
            let writing = false;
            let renderedCount = 0;

            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            const retryConvertImageBatch = async (
                files: FileData[],
                prompt: string,
                pageNumbers?: number[],
            ): Promise<import("./types").ConversionResult> => {
                let attempt = 0;
                let lastErr: any = null;
                while (attempt <= RETRY_ATTEMPTS) {
                    try {
                        const res = await this.aiService.convertImageBatch(files, prompt, pageNumbers);
                        return res;
                    } catch (err: any) {
                        lastErr = err;
                        // 针对 429/网络错误做指数退避
                        const msg = err?.message || String(err);
                        const isRateOrNetwork = /429|quota|rate|network|timeout/i.test(msg);
                        if (!isRateOrNetwork || attempt === RETRY_ATTEMPTS) {
                            break;
                        }
                        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                        await sleep(delay);
                        attempt++;
                    }
                }
                return {
                    markdown: "",
                    sourcePath: files[0]?.path || "",
                    outputPath: "",
                    provider: this.settings.currentModel || "unknown",
                    duration: 0,
                    success: false,
                    error: lastErr?.message || String(lastErr)
                };
            };

            const tryFlushWrites = async () => {
                if (writing) return;
                writing = true;
                try {
                    while (jobResults.has(nextWriteId)) {
                        const { result, job } = jobResults.get(nextWriteId)!;

                        const currentContent = await this.app.vault.read(outputFile!);
                        const useSeparator = this.settings.outputSettings?.insertPageSeparator ?? false;
                        const separator = useSeparator ? `\n\n---\n\n` : `\n\n`;
                        const processedMarkdown = ConversionService.postProcessConvertedMarkdown(result.markdown, this.settings);
                        const appendContent = result.success !== false
                            ? (nextWriteId === 1 ? `${processedMarkdown}` : `${separator}${processedMarkdown}`)
                            : (nextWriteId === 1 ? `> [!ERROR] 第 ${job.pages.join(", ")} 页转换失败: ${result.error}` : `${separator}> [!ERROR] 第 ${job.pages.join(", ")} 页转换失败: ${result.error}`);

                        // 更新统计与模态进度
                        if (result.success !== false) {
                            successPages += job.images.length;
                        } else {
                            // 失败页：将该批次的页号记录为失败
                            failedPages.push(...job.pages);
                        }

                        progressModal!.updateAIProgress(nextWriteId);
                        const processedPages = Math.min(totalPages, successPages + failedPages.length);
                        progressModal!.setStatus(`已完成批次 ${nextWriteId}/${expectedTotalJobs}，已处理 ${processedPages}/${totalPages} 页（成功 ${successPages} 页）`);

                        const finalNewContent = currentContent + appendContent;

                        await this.app.vault.modify(outputFile!, finalNewContent);

                        nextWriteId++;
                    }
                } finally {
                    writing = false;
                }
            };

            const runNextJob = () => {
                while (activeJobs < CONCURRENCY_LIMIT && jobQueue.length > 0) {
                    const job = jobQueue.shift()!;
                    activeJobs++;
                    (async () => {
                        try {
                            const res = await retryConvertImageBatch(job.images, prompt, job.pages);
                            jobResults.set(job.id, { result: res, job });
                            await tryFlushWrites();
                        } catch (e) {
                            jobResults.set(job.id, {
                                result: {
                                    markdown: "",
                                    sourcePath: job.images[0]?.path || "",
                                    outputPath: "",
                                    provider: this.settings.currentModel || "unknown",
                                    duration: 0,
                                    success: false,
                                    error: e instanceof Error ? e.message : String(e)
                                },
                                job
                            });
                            await tryFlushWrites();
                        } finally {
                            activeJobs--;
                            runNextJob();
                        }
                    })();
                }
            };

            await PDFProcessor.streamConvertPdfToImages(
                arrayBuffer,
                async (base64: string, pageNum: number) => {
                    let errMsg: string | null = null;
                    let submittedBatch = false;
                    try {
                        // 为每一页创建临时 FileData
                        const pageFileData: FileData = {
                            path: `${filePath}#page${pageNum}`,
                            name: `Page ${pageNum}`,
                            base64: base64,
                            mimeType: "image/jpeg",
                            size: base64.length,
                            isPdf: true
                        };
                        // 收集到批量数组
                        batchImages.push(pageFileData);
                        batchPages.push(pageNum);

                        // 达到批量大小或最后一页时，执行一次AI转换
                        if (batchImages.length >= batchSize || renderedCount + 1 === totalPages) {
                            jobCounter++;
                            const job: BatchJob = {
                                id: jobCounter,
                                images: batchImages.slice(),
                                pages: batchPages.slice()
                            };
                            jobQueue.push(job);
                            totalJobs++;
                            progressModal!.setStatus(`已提交批次 ${totalJobs}/${expectedTotalJobs}（${job.images.length} 页），正在并发处理...`);
                            batchImages = [];
                            batchPages = [];
                            runNextJob();
                            submittedBatch = true;
                        }

                    } catch (pageError) {
                        failedPages.push(pageNum);
                        errMsg = pageError instanceof Error ? pageError.message : String(pageError);
                        console.error(`第 ${pageNum} 页转换失败:`, errMsg);
                        // 写入错误信息（即时，包含页号，便于后续重试识别）
                        const currentContent = await this.app.vault.read(outputFile!);
                        const useSeparator = this.settings.outputSettings?.insertPageSeparator ?? false;
                        const separator = useSeparator ? `\n\n---\n\n` : `\n\n`;
                        const errorBlock = pageNum === 1
                            ? `> [!ERROR] 第 ${pageNum} 页渲染失败: ${errMsg}`
                            : `${separator}> [!ERROR] 第 ${pageNum} 页渲染失败: ${errMsg}`;

                        const finalNewContent = currentContent + errorBlock;

                        await this.app.vault.modify(outputFile!, finalNewContent);
                    } finally {
                        renderedCount++;
                        progressModal!.updateRenderProgress(renderedCount);
                        if (errMsg) {
                            progressModal!.setStatus(`第 ${pageNum} 页渲染失败：${errMsg}`);
                        } else if (!submittedBatch) {
                            progressModal!.setStatus(`已渲染第 ${renderedCount}/${totalPages} 页，等待提交AI...`);
                        }
                    }
                },
                (current: number, total: number, message: string) => {
                    // 渲染进度由模态展示，避免 Notice 造成误导
                    progressModal!.updateRenderProgress(current);
                },
                {
                    scale: this.settings.advancedSettings?.pdfScale || 1.5,
                    quality: this.settings.advancedSettings?.pdfQuality || 0.8,
                    format: 'jpeg',
                    timeoutPerPage: this.settings.advancedSettings?.timeout || 30000,
                    onCancel: () => progressModal?.isCancelled() === true,
                    pageNumbers: pagesToProcess
                }
            );

            // 等待所有批次完成与写入
            while (activeJobs > 0 || jobQueue.length > 0 || jobResults.has(nextWriteId)) {
                await sleep(100);
                await tryFlushWrites();
            }

            // 6. 添加元数据注释但不在 Markdown 内容中显示进度信息
            const finalContent = await this.app.vault.read(outputFile!);
            const metadataComment = `<!-- Ink2Vault: ${JSON.stringify({ sourcePath: filePath, totalPages, failedPages })} -->`;
            await this.app.vault.modify(outputFile!, finalContent + (finalContent.endsWith('\n') ? '' : '\n') + metadataComment);

            // 根据失败页展示完成后操作按钮，否则关闭模态
            if (failedPages.length > 0 && progressModal) {
                progressModal.setStatus(`部分页面失败：第 ${failedPages.join(', ')} 页。可选择重试。`);
                progressModal.showCompletionActions({
                    onRetryAll: async () => {
                        await this.retryFailedPagesFromOutput(outputPath);
                    },
                    onRetrySingle: async (pageNum: number) => {
                        await this.retrySinglePageFromOutput(outputPath, undefined, pageNum);
                    },
                    onClose: () => {
                        try { progressModal?.close(); } catch (_) { }
                    }
                });
            } else {
                try { progressModal?.close(); } catch (_) { }
            }

            const duration = Date.now() - startTime;

            // 7. 显示完成消息
            const message = failedPages.length > 0
                ? `转换完成！成功 ${successPages}/${totalPages} 页（失败: 第 ${failedPages.join(', ')} 页）。可在打开的进度窗中一键重试。`
                : `转换成功！${totalPages} 页，耗时: ${(duration / 1000).toFixed(1)}s`;

            new Notice(message, 5000);

            return {
                markdown: await this.app.vault.read(outputFile!),
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

            // 如果文件已创建，写入错误信息
            if (outputFile) {
                const errorContent = await this.app.vault.read(outputFile);
                // 不在 markdown 中添加错误提示，只在通知中显示
                // 如果需要记录错误，可以附加到末尾
            }

            // 关闭模态
            try { progressModal?.close(); } catch (_) { }

            return {
                markdown: "",
                sourcePath: filePath,
                outputPath,
                provider: this.settings.currentModel || "unknown",
                duration: Date.now() - startTime,
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 从输出文件中解析源 PDF 路径与失败页列表（来自注释或摘要）
     */
    private async parseConversionMetadata(outputPath: string): Promise<{ sourcePath: string | null; failedPages: number[]; totalPages: number | null }> {
        const file = this.app.vault.getAbstractFileByPath(outputPath) as TFile;
        if (!file) return { sourcePath: null, failedPages: [], totalPages: null };
        const content = await this.app.vault.read(file);

        let sourcePath: string | null = null;
        // 优先解析末尾 JSON 注释元数据
        const metaMatch = content.match(/<!--\s*Ink2Vault:\s*(\{[\s\S]*?\})\s*-->/);
        if (metaMatch) {
            try {
                const obj = JSON.parse(metaMatch[1]);
                sourcePath = obj.sourcePath || null;
                const failedFromMeta: number[] = Array.isArray(obj.failedPages) ? obj.failedPages.filter((n: any) => typeof n === 'number') : [];
                const totalFromMeta: number | null = typeof obj.totalPages === 'number' ? obj.totalPages : null;
                return { sourcePath, failedPages: failedFromMeta, totalPages: totalFromMeta };
            } catch { }
        }
        const headerMatch = content.match(/^#\s+(.+)$/m);
        if (headerMatch) {
            const name = headerMatch[1].trim();
            // 无法从标题反推路径，留空，改用注释或上下文
        }

        // 解析完成摘要中的失败页
        const summaryMatch = content.match(/失败: 第\s+([0-9,\s]+)\s+页/);
        const failedPages: number[] = [];
        if (summaryMatch) {
            summaryMatch[1].split(/[,\s]+/).forEach(s => {
                const n = parseInt(s);
                if (!isNaN(n)) failedPages.push(n);
            });
        }

        // 也从错误块中提取页号
        const errorBlocks = content.match(/> \[!ERROR\] 第\s+(\d+)\s+页渲染失败/gi) || [];
        errorBlocks.forEach(b => {
            const m = b.match(/第\s+(\d+)\s+页/);
            if (m) {
                const n = parseInt(m[1]);
                if (!isNaN(n) && !failedPages.includes(n)) failedPages.push(n);
            }
        });

        // 尝试从文件顶部转换中行提取总页数
        const totalMatch = content.match(/\((\d+)\/(\d+)\)/);
        const totalPages = totalMatch ? parseInt(totalMatch[2]) : null;

        // 从输出文件路径推断源路径：输出文件名等于原始名（若保留原名设置开启）
        // 此处返回 null，重试方法应接收原始源路径参数更可靠
        return { sourcePath, failedPages, totalPages };
    }

    /**
     * 重试当前输出文件的所有失败页（需要提供源 PDF 路径）
     */
    async retryFailedPagesFromOutput(outputPath: string, sourcePdfPath?: string): Promise<void> {
        const meta = await this.parseConversionMetadata(outputPath);
        if (meta.failedPages.length === 0) {
            new Notice("没有失败的页可重试", 3000);
            return;
        }
        const sp = sourcePdfPath || meta.sourcePath;
        if (!sp) {
            new Notice("源 PDF 路径未知，无法重试。请重新转换或在命令中提供路径。", 5000);
            return;
        }
        const file = this.app.vault.getAbstractFileByPath(sp) as TFile;
        if (!file) {
            new Notice("源 PDF 文件不存在，无法重试", 4000);
            return;
        }

        const buffer = await this.app.vault.readBinary(file);
        const pageNums = meta.failedPages.sort((a, b) => a - b);

        const progress = new ProgressModal(this.app);
        progress.open();
        progress.setTotals(pageNums.length, pageNums.length);
        progress.setStatus("正在重试失败页...");

        let successCount = 0;
        const prompt = this.getConversionPrompt();

        for (let i = 0; i < pageNums.length; i++) {
            const pageNum = pageNums[i];
            try {
                const base64 = await PDFProcessor.convertSinglePageToImage(buffer, pageNum, {
                    scale: this.settings.advancedSettings?.pdfScale || 1.5,
                    quality: this.settings.advancedSettings?.pdfQuality || 0.8,
                    format: 'jpeg',
                    timeoutPerPage: this.settings.advancedSettings?.timeout || 30000
                });

                const pageFileData: FileData = {
                    path: `${sp}#page${pageNum}`,
                    name: `Page ${pageNum}`,
                    base64,
                    mimeType: "image/jpeg",
                    size: base64.length,
                    isPdf: true
                };

                const res = await this.aiService.convertImageBatch([pageFileData], prompt, [pageNum]);
                const of = this.app.vault.getAbstractFileByPath(outputPath) as TFile;
                const current = await this.app.vault.read(of);

                // 尝试提取并替换对应的错误块
                const errorRegexExact = new RegExp(`>? \\[!ERROR\\] 第 ${pageNum} 页(?:渲染|转换)失败: [^\\n]*\\n?`);
                let newContent = current;
                if (errorRegexExact.test(current)) {
                    newContent = current.replace(errorRegexExact, res.markdown + "\n");
                } else {
                    const append = `\n\n---\n\n${res.markdown}`;
                    newContent = current + append;
                }

                await this.app.vault.modify(of, newContent);

                successCount++;
                progress.updateAIProgress(successCount);
                progress.setStatus(`已重试 ${successCount}/${pageNums.length}`);
            } catch (e) {
                new Notice(`第 ${pageNum} 页重试失败: ${e instanceof Error ? e.message : String(e)}`, 4000);
            }
        }

        progress.close();
        new Notice(`失败页重试完成：成功 ${successCount}/${pageNums.length}`, 5000);
    }

    /**
     * 重试单个页（需要提供源 PDF 路径与页码）
     */
    async retrySinglePageFromOutput(outputPath: string, sourcePdfPath: string | undefined, pageNum: number): Promise<void> {
        const spOrMeta = sourcePdfPath || (await this.parseConversionMetadata(outputPath)).sourcePath || null;
        if (!spOrMeta) {
            new Notice("源 PDF 路径未知，无法重试。请重新转换或在命令中提供路径。", 5000);
            return;
        }
        const file = this.app.vault.getAbstractFileByPath(spOrMeta) as TFile;
        if (!file) {
            new Notice("源 PDF 文件不存在，无法重试", 4000);
            return;
        }

        const buffer = await this.app.vault.readBinary(file);
        const prompt = this.getConversionPrompt();

        const progress = new ProgressModal(this.app);
        progress.open();
        progress.setTotals(1, 1);

        try {
            const base64 = await PDFProcessor.convertSinglePageToImage(buffer, pageNum, {
                scale: this.settings.advancedSettings?.pdfScale || 1.5,
                quality: this.settings.advancedSettings?.pdfQuality || 0.8,
                format: 'jpeg',
                timeoutPerPage: this.settings.advancedSettings?.timeout || 30000
            });

            const pageFileData: FileData = {
                path: `${spOrMeta}#page${pageNum}`,
                name: `Page ${pageNum}`,
                base64,
                mimeType: "image/jpeg",
                size: base64.length,
                isPdf: true
            };

            const res = await this.aiService.convertImageBatch([pageFileData], prompt, [pageNum]);
            const of = this.app.vault.getAbstractFileByPath(outputPath) as TFile;
            const current = await this.app.vault.read(of);

            const errorRegexExact = new RegExp(`>? \\[!ERROR\\] 第 ${pageNum} 页(?:渲染|转换)失败: [^\\n]*\\n?`);
            let newContent = current;
            if (errorRegexExact.test(current)) {
                newContent = current.replace(errorRegexExact, res.markdown + "\n");
            } else {
                newContent = current + `\n\n---\n\n${res.markdown}`;
            }
            await this.app.vault.modify(of, newContent);

            progress.updateAIProgress(1);
            progress.close();
            new Notice(`第 ${pageNum} 页重试完成`, 4000);
        } catch (e) {
            progress.close();
            new Notice(`第 ${pageNum} 页重试失败: ${e instanceof Error ? e.message : String(e)}`, 5000);
        }
    }

    /**
     * 从Markdown内容中提取建议的文件名
     * 
     * @param markdown Markdown内容
     * @returns string | undefined 建议的文件名，如果没有找到则返回undefined
     */
    private extractSuggestedFilename(markdown: string): string | undefined {
        // 尝试从Markdown的第一行标题提取文件名
        const firstLine = markdown.split('\n')[0].trim();

        // 检查是否是标题（# 开头）
        if (firstLine.startsWith('#')) {
            const title = firstLine.replace(/^#+\s*/, '').trim();
            // 清理文件名中的非法字符
            const cleanName = title
                .replace(/[<>:"/\\|?*]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 100); // 限制长度

            if (cleanName.length > 0) {
                return cleanName;
            }
        }

        return undefined;
    }

    async convertFiles(
        filePaths: string[],
        onProgress?: ProgressCallback,
        options?: { pdfPages?: number[] }
    ): Promise<ConversionResult[]> {
        const results: ConversionResult[] = [];
        const total = filePaths.length;

        for (let i = 0; i < total; i++) {
            const filePath = filePaths[i];

            try {
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total,
                        message: `正在转换: ${FileProcessor.getFileName(filePath)}`
                    });
                }

                const isPdf = FileProcessor.getFileMimeType(filePath) === "application/pdf";
                const result = await this.convertFile(filePath, isPdf ? { pdfPages: options?.pdfPages } : undefined);
                results.push(result);

            } catch (error) {
                console.error(`转换文件失败: ${filePath}`, error);
                results.push({
                    markdown: "",
                    sourcePath: filePath,
                    outputPath: "",
                    provider: this.settings.currentModel || "unknown",
                    duration: 0,
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        return results;
    }

    async convertFilesMerged(filePaths: string[]): Promise<ConversionResult> {
        const startTime = Date.now();
        try {
            const supportedFiles = filePaths.filter(path => ConversionService.isFileSupported(path));
            if (supportedFiles.length === 0) {
                new Notice("没有支持的文件", 3000);
                return {
                    markdown: "",
                    sourcePath: "",
                    outputPath: "",
                    provider: this.settings.currentModel || "unknown",
                    duration: 0,
                    success: false,
                    error: "没有支持的文件"
                };
            }

            const pdfFiles = supportedFiles.filter(path => FileProcessor.getFileMimeType(path) === "application/pdf");
            if (pdfFiles.length > 0) {
                new Notice("合并仅支持图片文件，PDF请单独转换", 4000);
                return {
                    markdown: "",
                    sourcePath: pdfFiles[0],
                    outputPath: "",
                    provider: this.settings.currentModel || "unknown",
                    duration: 0,
                    success: false,
                    error: "合并仅支持图片文件"
                };
            }

            const fileDataList = await FileProcessor.processFiles(supportedFiles, this.app);
            if (fileDataList.length === 0) {
                new Notice("没有可处理的图片文件", 3000);
                return {
                    markdown: "",
                    sourcePath: "",
                    outputPath: "",
                    provider: this.settings.currentModel || "unknown",
                    duration: 0,
                    success: false,
                    error: "没有可处理的图片文件"
                };
            }

            const prompt = this.getConversionPrompt();
            const conversionResult = await this.aiService.convertImageBatch(fileDataList, prompt);
            if (!conversionResult.success) {
                return {
                    ...conversionResult,
                    outputPath: ""
                };
            }

            const baseName = fileDataList[0].name.replace(/\.[^/.]+$/, "");
            const mergedName = `${baseName}-merged.${this.settings.outputSettings.outputExtension}`;
            const outputFileData: FileData = { ...fileDataList[0], name: mergedName };
            const outputPath = await this.saveConversionResult(
                outputFileData,
                conversionResult.markdown,
                this.extractSuggestedFilename(conversionResult.markdown)
            );

            return {
                ...conversionResult,
                outputPath,
                sourcePath: fileDataList[0].path,
                duration: Date.now() - startTime
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                markdown: "",
                sourcePath: "",
                outputPath: "",
                provider: this.settings.currentModel || "unknown",
                duration: Date.now() - startTime,
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 保存转换结果
     * 
     * @param fileData 原始文件数据
     * @param markdown 转换后的Markdown内容
     * @param suggestedFilename 建议的文件名（可选）
     * @returns Promise<string> 输出文件路径
     */
    /**
     * 创建输出文件并返回路径
     */
    private getAvailableOutputPath(outputDir: string, fileName: string): string {
        const initialPath = outputDir ? `${outputDir}/${fileName}` : fileName;
        if (!this.app.vault.getAbstractFileByPath(initialPath)) {
            return initialPath;
        }

        const dotIndex = fileName.lastIndexOf(".");
        const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
        const ext = dotIndex > 0 ? fileName.slice(dotIndex) : "";

        let counter = 1;
        let candidate = outputDir ? `${outputDir}/${baseName} (${counter})${ext}` : `${baseName} (${counter})${ext}`;
        while (this.app.vault.getAbstractFileByPath(candidate)) {
            counter++;
            candidate = outputDir ? `${outputDir}/${baseName} (${counter})${ext}` : `${baseName} (${counter})${ext}`;
        }
        return candidate;
    }

    private async createOutputFile(fileData: FileData, initialContent: string): Promise<string> {
        const { outputSettings } = this.settings;

        const outputDir = (outputSettings.outputDir || "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
        if (outputDir) {
            const outputFolder = this.app.vault.getAbstractFileByPath(outputDir);
            if (!outputFolder) {
                await this.app.vault.createFolder(outputDir);
            }
        }

        // 确定输出文件名
        let outputFileName: string;
        if (outputSettings.keepOriginalName) {
            const baseName = fileData.name.replace(/\.[^/.]+$/, "");
            outputFileName = `${baseName}.${outputSettings.outputExtension}`;
        } else {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
            outputFileName = `converted-${timestamp}.${outputSettings.outputExtension}`;
        }

        // 构建完整输出路径
        const outputPath = this.getAvailableOutputPath(outputDir, outputFileName);
        await this.app.vault.create(outputPath, initialContent);

        return outputPath;
    }

    private async saveConversionResult(
        fileData: FileData,
        markdown: string,
        suggestedFilename?: string
    ): Promise<string> {
        const { outputSettings } = this.settings;

        const outputDir = (outputSettings.outputDir || "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
        if (outputDir) {
            const outputFolder = this.app.vault.getAbstractFileByPath(outputDir);
            if (!outputFolder) {
                await this.app.vault.createFolder(outputDir);
            }
        }

        // 确定输出文件名
        let outputFileName: string;
        if (outputSettings.keepOriginalName) {
            // 移除原始扩展名
            const baseName = fileData.name.replace(/\.[^/.]+$/, "");
            outputFileName = `${baseName}.${outputSettings.outputExtension}`;
        } else if (suggestedFilename) {
            // 使用建议的文件名
            outputFileName = suggestedFilename.endsWith(`.${outputSettings.outputExtension}`)
                ? suggestedFilename
                : `${suggestedFilename}.${outputSettings.outputExtension}`;
        } else {
            // 使用时间戳
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
            outputFileName = `converted-${timestamp}.${outputSettings.outputExtension}`;
        }

        // 构建完整输出路径
        const outputPath = this.getAvailableOutputPath(outputDir, outputFileName);

        // 生成文件内容：标题 + 自定义内容 + markdown
        const fileName = fileData.name.replace(/\.[^/.]+$/, "");
        const titleAndContent = `# ${fileName}\n${outputSettings.contentAfterTitle ? '\n' + outputSettings.contentAfterTitle + '\n' : '\n'}${markdown}`;

        await this.app.vault.create(outputPath, titleAndContent);

        // 如果启用自动打开，打开文件
        if (outputSettings.autoOpen) {
            const newFile = this.app.vault.getAbstractFileByPath(outputPath);
            if (newFile instanceof TFile) {
                await this.app.workspace.openLinkText(newFile.path, "", true);
            }
        }

        return outputPath;
    }

    validateConfig(): boolean {
        return this.aiService.validateConfig();
    }

    static postProcessConvertedMarkdown(markdown: string, settings: PluginSettings): string {
        let out = markdown || "";
        if (settings.outputSettings?.removePageHeadings) {
            out = out.replace(/^\s*#{1,6}\s*Page\s*\d+\s*(?:[:：-]\s*)?$/gmi, "");
            out = out.replace(/\n{3,}/g, "\n\n").trim();
        }
        return out.trim();
    }

    static getSupportedFileTypes(): string[] {
        return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".pdf"];
    }

    static isFileSupported(filePath: string): boolean {
        return FileProcessor.isFileSupported(filePath);
    }
}


