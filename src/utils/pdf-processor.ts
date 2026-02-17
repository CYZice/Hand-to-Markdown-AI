import { Notice } from 'obsidian';

// 使用 Obsidian 内置的 PDF.js (window.pdfjsLib)
declare global {
    interface Window {
        pdfjsLib: any;
    }
}

/**
 * PDF 流式处理器
 * 负责逐页渲染 PDF 为图片，及时释放内存
 */
export class PDFProcessor {
    private static initialized = false;

    /**
     * 初始化 PDF.js Worker（必须在使用前调用）
     * Obsidian 插件环境下的兼容配置
     */
    static initWorker() {
        if (this.initialized) return;

        try {
            // 使用 Obsidian 内置的 PDF.js，无需配置 Worker
            if (!window.pdfjsLib) {
                throw new Error('Obsidian PDF.js 未加载');
            }
            console.log('PDF.js initialized (using Obsidian built-in)');
            this.initialized = true;
        } catch (err) {
            console.error('Failed to initialize PDF.js:', err);
            new Notice('PDF 功能不可用，请更新 Obsidian 版本', 5000);
        }
    }

    /**
     * 流式转换 PDF 为图片 Base64
     * 逐页渲染，及时释放内存，支持进度回调
     * 
     * @param buffer PDF 文件的 ArrayBuffer
     * @param onPageConverted 页面转换完成回调（base64, 页码）
     * @param onProgress 进度回调（当前页, 总页数, 消息）
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
            pageNumbers?: number[];
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
            const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;
            const normalizedPages = options.pageNumbers && options.pageNumbers.length > 0
                ? Array.from(new Set(options.pageNumbers.map(n => Math.floor(n)).filter(n => n > 0 && n <= totalPages))).sort((a, b) => a - b)
                : [];
            const pagesToRender = normalizedPages.length > 0
                ? normalizedPages
                : Array.from({ length: totalPages }, (_, i) => i + 1);

            new Notice(`开始处理 PDF，共 ${pagesToRender.length} 页`, 2000);

            // 2. 逐页处理
            for (let i = 0; i < pagesToRender.length; i++) {
                const pageNum = pagesToRender[i];
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
                        const done = i + 1;
                        const total = pagesToRender.length;
                        onProgress(done, total, `已处理第 ${done}/${total} 页`);
                    }

                } catch (pageError) {
                    const errMsg = pageError instanceof Error ? pageError.message : String(pageError);
                    console.warn(`处理第 ${pageNum} 页失败:`, errMsg);
                    new Notice(`⚠️ 第 ${pageNum} 页处理失败，跳过该页`, 3000);
                    // 继续处理下一页，而不是中止整个流程
                }
            }

            return pagesToRender.length;

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error('PDF 加载失败:', errMsg);
            throw new Error(`PDF 处理失败: ${errMsg}`);
        }
    }
    /**
     * 公共方法：转换指定页为 Base64 图片
     */
    static async convertSinglePageToImage(
        buffer: ArrayBuffer,
        pageNum: number,
        options: {
            scale?: number;
            quality?: number;
            format?: 'jpeg' | 'webp';
            timeoutPerPage?: number;
        } = {}
    ): Promise<string> {
        this.initWorker();
        const {
            scale = 1.5,
            quality = 0.8,
            format = 'jpeg',
            timeoutPerPage = 20000
        } = options;

        const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;

        const pagePromise = this.renderPageToBase64(pdf, pageNum, scale, quality, format);
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`第 ${pageNum} 页超时`)), timeoutPerPage)
        );

        const base64 = await Promise.race([pagePromise, timeoutPromise]);
        return base64;
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
     * 用于预检查，仅读取 metadata，不解析具体内容
     */
    static async getPdfInfo(buffer: ArrayBuffer): Promise<{ numPages: number }> {
        this.initWorker();

        try {
            const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
            const pdf = await loadingTask.promise;

            return {
                numPages: pdf.numPages
            };
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            throw new Error(`无法读取 PDF 信息: ${errMsg}`);
        }
    }
}
