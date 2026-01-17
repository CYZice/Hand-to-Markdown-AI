import { exportToBlob, exportToSvg } from "@zsviczian/excalidraw";
import { FileData } from "../types";

/**
 * Excalidraw 处理器
 * 用于将 .excalidraw 文件转换为 PNG 或 SVG
 */
export class ExcalidrawProcessor {
    /**
     * 将 Excalidraw JSON 转换为 PNG Base64 (data URL)
     * 
     * @param jsonContent Excalidraw JSON 文件内容
     * @param filePath 文件路径
     * @param options 转换选项
     * @returns FileData 对象，包含 PNG 的 Base64 编码
     * @throws Error 如果转换失败
     */
    static async convertExcalidrawToPng(
        jsonContent: string,
        filePath: string,
        options?: {
            scale?: number;           // 缩放倍数
            withBackground?: boolean; // 是否包含背景
            withDarkMode?: boolean;   // 是否使用深色主题
            padding?: number;         // 内边距
        }
    ): Promise<FileData> {
        try {
            // 1. 解析 Excalidraw JSON
            let scene: any;
            try {
                scene = JSON.parse(jsonContent);
            } catch (parseError) {
                throw new Error("Invalid Excalidraw JSON format");
            }

            // 2. 验证 scene 结构
            if (!scene.elements || !Array.isArray(scene.elements)) {
                throw new Error("Invalid Excalidraw file structure: missing elements");
            }

            // 3. 准备导出配置
            const scale = options?.scale ?? 1;
            const withBackground = options?.withBackground ?? true;
            const withDarkMode = options?.withDarkMode ?? false;
            const padding = options?.padding ?? 10;

            // 4. 调用 Excalidraw 导出函数
            const blob = await exportToBlob({
                // 过滤已删除的元素
                elements: scene.elements.filter((el: any) => !el.isDeleted),

                // 应用主题和背景设置
                appState: {
                    ...scene.appState,
                    exportBackground: withBackground,
                    exportWithDarkMode: withDarkMode,
                },

                // 嵌入的文件（如果有）
                files: scene.files || {},

                // 导出内边距
                exportPadding: padding,

                // 输出格式为 PNG
                mimeType: "image/png" as any,

                // 设置输出尺寸和缩放
                getDimensions: (width: number, height: number) => ({
                    width: Math.floor(width * scale),
                    height: Math.floor(height * scale),
                    scale,
                }),
            });

            if (!blob) {
                throw new Error("Failed to generate PNG blob from Excalidraw");
            }

            // 5. 转换 Blob 为 Base64 Data URL
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = this.arrayBufferToBase64(arrayBuffer);
            const dataUrl = `data:image/png;base64,${base64}`;

            // 6. 提取文件名
            const fileName = filePath
                .split("/")
                .pop()
                ?.replace(/\.excalidraw$/i, "") || "drawing";

            // 7. 返回 FileData
            return {
                path: filePath,
                base64: dataUrl,           // 包含 data URL 前缀
                mimeType: "image/png",
                size: base64.length,
                name: fileName,
            };
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Excalidraw to PNG conversion failed: ${msg}`);
        }
    }

    /**
     * 将 Excalidraw JSON 转换为 SVG HTML 字符串
     * 
     * @param jsonContent Excalidraw JSON 文件内容
     * @param filePath 文件路径
     * @param options 转换选项
     * @returns SVG 的 HTML 字符串
     * @throws Error 如果转换失败
     */
    static async convertExcalidrawToSvg(
        jsonContent: string,
        filePath: string,
        options?: {
            withBackground?: boolean;
            withDarkMode?: boolean;
            padding?: number;
        }
    ): Promise<string> {
        try {
            // 1. 解析 Excalidraw JSON
            let scene: any;
            try {
                scene = JSON.parse(jsonContent);
            } catch (parseError) {
                throw new Error("Invalid Excalidraw JSON format");
            }

            // 2. 验证 scene 结构
            if (!scene.elements || !Array.isArray(scene.elements)) {
                throw new Error("Invalid Excalidraw file structure: missing elements");
            }

            // 3. 准备导出配置
            const withBackground = options?.withBackground ?? true;
            const withDarkMode = options?.withDarkMode ?? false;
            const padding = options?.padding ?? 10;

            // 4. 调用 Excalidraw 导出函数
            const svg = await exportToSvg({
                // 过滤已删除的元素
                elements: scene.elements.filter((el: any) => !el.isDeleted),

                // 应用主题和背景设置
                appState: {
                    ...scene.appState,
                    exportBackground: withBackground,
                    exportWithDarkMode: withDarkMode,
                },

                // 嵌入的文件（如果有）
                files: scene.files || {},

                // 导出内边距
                exportPadding: padding,

                // 导出帧信息
                exportingFrame: null,

                // 是否渲染可嵌入内容
                renderEmbeddables: true,

                // 是否跳过字体内联（节省大小）
                skipInliningFonts: false,
            });

            if (!svg) {
                throw new Error("Failed to generate SVG from Excalidraw");
            }

            // 5. 返回 SVG HTML 字符串
            return svg.outerHTML;
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Excalidraw to SVG conversion failed: ${msg}`);
        }
    }

    /**
     * 将 ArrayBuffer 转换为 Base64 字符串
     * 
     * @param buffer ArrayBuffer 对象
     * @returns Base64 字符串（不包含前缀）
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = "";

        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return btoa(binary);
    }

    /**
     * 验证文件是否为有效的 Excalidraw JSON
     * 
     * @param jsonContent 文件内容
     * @returns 是否有效
     */
    static isValidExcalidrawJson(jsonContent: string): boolean {
        try {
            const scene = JSON.parse(jsonContent);
            return (
                scene &&
                typeof scene === "object" &&
                Array.isArray(scene.elements) &&
                typeof scene.appState === "object"
            );
        } catch {
            return false;
        }
    }

    /**
     * 从 Excalidraw JSON 中提取元数据
     * 
     * @param jsonContent 文件内容
     * @returns 元数据对象
     */
    static extractMetadata(jsonContent: string): {
        elementCount: number;
        hasImages: boolean;
        theme?: string;
    } | null {
        try {
            const scene = JSON.parse(jsonContent);
            if (!this.isValidExcalidrawJson(jsonContent)) {
                return null;
            }

            const hasImages = scene.elements.some(
                (el: any) => el.type === "image"
            );

            return {
                elementCount: scene.elements.length,
                hasImages,
                theme: scene.appState?.theme,
            };
        } catch {
            return null;
        }
    }
}
