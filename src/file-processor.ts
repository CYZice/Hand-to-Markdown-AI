import { App, Notice, TFile } from "obsidian";
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from "./defaults";
import { FileData } from "./types";

/**
 * 文件处理工具类
 * 负责读取文件、验证格式、转换为Base64编码
 */
export class FileProcessor {

    /**
     * 处理文件并返回FileData
     * 
     * @param filePath 文件路径
     * @param app Obsidian App实例
     * @returns Promise<FileData> 处理后的文件数据
     * @throws Error 如果文件处理失败
     */
    static async processFile(filePath: string, app: App): Promise<FileData> {
        // 获取文件扩展名
        const extension = this.getFileExtension(filePath);


        // 验证文件类型
        const mimeType = SUPPORTED_FILE_TYPES[extension as keyof typeof SUPPORTED_FILE_TYPES];
        if (!mimeType) {
            throw new Error(`不支持的文件类型: ${extension}`);
        }

        // 读取文件
        const arrayBuffer = await this.readFile(filePath, app);

        // 验证文件大小
        const fileSize = arrayBuffer.byteLength;
        if (fileSize > MAX_FILE_SIZE) {
            throw new Error(`文件过大: ${this.formatFileSize(fileSize)} (最大支持 ${this.formatFileSize(MAX_FILE_SIZE)})`);
        }

        // 转换为Base64
        const base64 = this.arrayBufferToBase64(arrayBuffer);

        // 获取文件名
        const fileName = this.getFileName(filePath);

        return {
            path: filePath,
            base64: base64,
            mimeType: mimeType,
            size: fileSize,
            name: fileName
        };
    }

    /**
     * 批量处理文件
     * 
     * @param filePaths 文件路径数组
     * @param app Obsidian App实例
     * @param onProgress 进度回调
     * @returns Promise<FileData[]> 处理后的文件数据数组
     */
    static async processFiles(
        filePaths: string[],
        app: App,
        onProgress?: (current: number, total: number, message: string) => void
    ): Promise<FileData[]> {
        const results: FileData[] = [];
        const total = filePaths.length;

        for (let i = 0; i < total; i++) {
            const filePath = filePaths[i];

            try {
                if (onProgress) {
                    onProgress(i + 1, total, `正在处理: ${this.getFileName(filePath)}`);
                }

                const fileData = await this.processFile(filePath, app);
                results.push(fileData);

            } catch (error) {
                console.error(`处理文件失败: ${filePath}`, error);
                new Notice(`处理文件失败: ${this.getFileName(filePath)}`, 5000);
                // 继续处理其他文件
            }
        }

        return results;
    }

    /**
     * 读取文件内容
     * 
     * @param filePath 文件路径
     * @param app Obsidian App实例
     * @returns Promise<ArrayBuffer> 文件内容
     */
    private static async readFile(filePath: string, app: App): Promise<ArrayBuffer> {
        try {
            // 在Obsidian环境中，使用app.vault.readBinary
            const file = app.vault.getAbstractFileByPath(filePath);
            if (!file || !(file instanceof TFile)) {
                throw new Error(`文件不存在: ${filePath}`);
            }

            const arrayBuffer = await app.vault.readBinary(file);
            return arrayBuffer;
        } catch (error) {
            throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 将ArrayBuffer转换为Base64字符串
     * 
     * @param buffer ArrayBuffer
     * @returns string Base64字符串
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const len = bytes.byteLength;

        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return btoa(binary);
    }

    /**
     * 获取文件扩展名
     * 
     * @param filePath 文件路径
     * @returns string 文件扩展名（包含点）
     */
    private static getFileExtension(filePath: string): string {
        // 特殊处理 .excalidraw.md
        if (filePath.endsWith(".excalidraw.md")) {
            return ".excalidraw.md";
        }

        // 特殊处理 .excalidraw
        if (filePath.endsWith(".excalidraw")) {
            return ".excalidraw";
        }

        // 常规扩展名
        const lastDotIndex = filePath.lastIndexOf(".");
        if (lastDotIndex === -1) {
            return "";
        }
        return filePath.slice(lastDotIndex).toLowerCase();
    }

    /**
     * 获取文件名（不含路径）
     * 
     * @param filePath 文件路径
     * @returns string 文件名
     */
    static getFileName(filePath: string): string {
        const lastSlashIndex = Math.max(
            filePath.lastIndexOf("/"),
            filePath.lastIndexOf("\\")
        );

        if (lastSlashIndex === -1) {
            return filePath;
        }

        return filePath.slice(lastSlashIndex + 1);
    }

    /**
     * 格式化文件大小
     * 
     * @param bytes 字节数
     * @returns string 格式化后的文件大小
     */
    private static formatFileSize(bytes: number): string {
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * 检查文件是否支持
     * 
     * @param filePath 文件路径
     * @returns boolean 是否支持
     */
    static isFileSupported(filePath: string): boolean {
        const extension = this.getFileExtension(filePath);
        return extension in SUPPORTED_FILE_TYPES;
    }

    /**
     * 获取文件的MIME类型
     * 
     * @param filePath 文件路径
     * @returns string | undefined MIME类型
     */
    static getFileMimeType(filePath: string): string | undefined {
        const extension = this.getFileExtension(filePath);
        return SUPPORTED_FILE_TYPES[extension as keyof typeof SUPPORTED_FILE_TYPES];
    }

    /**
     * 处理 Excalidraw 文件（新增方法）
     */
    private static async processExcalidrawFile(filePath: string, app: App): Promise<FileData> {
        try {
            // 1. 读取文件内容
            const arrayBuffer = await this.readFile(filePath, app);
            const textContent = new TextDecoder().decode(arrayBuffer);

            // 2. 解析 JSON
            let excalidrawData: any;
            try {
                excalidrawData = JSON.parse(textContent);
            } catch (jsonError) {
                throw new Error("Excalidraw 文件格式错误：无法解析 JSON");
            }

            // 3. 渲染为图片（PNG Base64）
            const pngBase64 = await this.renderExcalidrawToImage(excalidrawData);

            // 4. 返回 FileData（与图片格式完全相同）
            return {
                path: filePath,
                base64: pngBase64,
                mimeType: "image/png",  // 关键：转为图片类型
                size: pngBase64.length,
                name: this.getFileName(filePath)
            };
        } catch (error) {
            throw new Error(`处理 Excalidraw 文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 渲染 Excalidraw 为图片（新增方法）
     */
    private static async renderExcalidrawToImage(
        excalidrawData: any,
        width: number = 1600,
        height: number = 1200
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // 创建 Canvas
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    throw new Error("无法获取 Canvas 上下文");
                }

                // 绘制白色背景
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);

                // 获取元素数组
                const elements = excalidrawData.elements || [];

                if (elements.length === 0) {
                    throw new Error("Excalidraw 文件中没有可渲染的元素");
                }

                // 计算边界
                const bounds = this.calculateExcalidrawBounds(elements);

                // 计算缩放和偏移
                const padding = 40;
                const scaleX = (width - padding * 2) / bounds.width;
                const scaleY = (height - padding * 2) / bounds.height;
                const scale = Math.min(scaleX, scaleY, 1); // 不超过 1 倍

                const offsetX = padding - bounds.minX * scale;
                const offsetY = padding - bounds.minY * scale;

                // 应用变换
                ctx.translate(offsetX, offsetY);
                ctx.scale(scale, scale);

                // 绘制所有元素
                this.drawExcalidrawElements(ctx, elements);

                // 转换为 Base64
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Canvas 转换失败"));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = () => {
                        reject(new Error("读取 Blob 失败"));
                    };
                    reader.readAsDataURL(blob);
                }, "image/png", 0.95);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 计算 Excalidraw 元素边界（新增辅助方法）
     */
    private static calculateExcalidrawBounds(elements: any[]): {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        width: number;
        height: number;
    } {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        elements.forEach((el) => {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + (el.width || 0));
            maxY = Math.max(maxY, el.y + (el.height || 0));
        });

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * 绘制 Excalidraw 元素（新增辅助方法）
     */
    private static drawExcalidrawElements(ctx: CanvasRenderingContext2D, elements: any[]): void {
        elements.forEach((el) => {
            if (el.isDeleted) return; // 跳过已删除元素

            ctx.save();

            // 设置通用样式
            ctx.strokeStyle = el.strokeColor || "#000000";
            ctx.fillStyle = el.backgroundColor || "transparent";
            ctx.lineWidth = el.strokeWidth || 1;
            ctx.globalAlpha = (el.opacity !== undefined ? el.opacity : 100) / 100;

            try {
                switch (el.type) {
                    case "rectangle":
                        if (el.backgroundColor && el.backgroundColor !== "transparent") {
                            ctx.fillRect(el.x, el.y, el.width, el.height);
                        }
                        ctx.strokeRect(el.x, el.y, el.width, el.height);
                        break;

                    case "diamond":
                        const centerX = el.x + el.width / 2;
                        const centerY = el.y + el.height / 2;
                        ctx.beginPath();
                        ctx.moveTo(centerX, el.y);
                        ctx.lineTo(el.x + el.width, centerY);
                        ctx.lineTo(centerX, el.y + el.height);
                        ctx.lineTo(el.x, centerY);
                        ctx.closePath();
                        if (el.backgroundColor && el.backgroundColor !== "transparent") {
                            ctx.fill();
                        }
                        ctx.stroke();
                        break;

                    case "ellipse":
                        ctx.beginPath();
                        ctx.ellipse(
                            el.x + el.width / 2,
                            el.y + el.height / 2,
                            el.width / 2,
                            el.height / 2,
                            0,
                            0,
                            2 * Math.PI
                        );
                        if (el.backgroundColor && el.backgroundColor !== "transparent") {
                            ctx.fill();
                        }
                        ctx.stroke();
                        break;

                    case "line":
                    case "arrow":
                        ctx.beginPath();
                        const points = el.points || [[0, 0], [el.width, el.height]];
                        ctx.moveTo(el.x + points[0][0], el.y + points[0][1]);
                        for (let i = 1; i < points.length; i++) {
                            ctx.lineTo(el.x + points[i][0], el.y + points[i][1]);
                        }
                        ctx.stroke();

                        // 绘制箭头
                        if (el.type === "arrow" && points.length >= 2) {
                            this.drawArrowhead(ctx, el, points);
                        }
                        break;

                    case "text":
                        ctx.fillStyle = el.strokeColor || "#000000";
                        ctx.font = `${el.fontSize || 20}px ${el.fontFamily || "Arial"}`;
                        ctx.textBaseline = "top";
                        const text = el.text || "";
                        const lines = text.split("\n");
                        lines.forEach((line: string, i: number) => {
                            ctx.fillText(line, el.x, el.y + i * (el.fontSize || 20) * 1.2);
                        });
                        break;
                }
            } catch (error) {
                console.warn(`绘制元素失败 (${el.type}):`, error);
            }

            ctx.restore();
        });
    }

    /**
     * 绘制箭头头部（新增辅助方法）
     */
    private static drawArrowhead(ctx: CanvasRenderingContext2D, el: any, points: number[][]): void {
        const lastIdx = points.length - 1;
        if (lastIdx < 1) return;

        const p1 = points[lastIdx - 1];
        const p2 = points[lastIdx];

        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const headlen = 15;

        const endX = el.x + p2[0];
        const endY = el.y + p2[1];

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headlen * Math.cos(angle - Math.PI / 6),
            endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headlen * Math.cos(angle + Math.PI / 6),
            endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }
}

