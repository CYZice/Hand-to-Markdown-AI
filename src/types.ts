import { MODEL_CATEGORIES } from "./constants";

export type ModelCategory = typeof MODEL_CATEGORIES[keyof typeof MODEL_CATEGORIES];

export interface ProviderConfig {
    apiKey: string;
    baseUrl: string;
    enabled: boolean;
    name?: string;
    type?: string;
}

export interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    model: string;
    enabled: boolean;
    category: ModelCategory;
    actualModel?: string;
    type?: string;
    apiKey?: string;
    baseUrl?: string;
}

export interface ImageData {
    id: string | number;
    name: string;
    url: string;
    base64: string;
    type: string;
    size: number;
    fromInline?: boolean;
}

export interface TextContext {
    selectedText: string;
    beforeText: string;
    afterText: string;
    cursorPosition: { line: number; ch: number };
    filePath?: string;
    lineNumber?: number;
    additionalContext?: string;
    contextContent?: string;
}

export interface CursorPosition {
    left: number;
    top: number;
    height?: number;
}

export interface SelectedContext {
    files: Array<{ name: string; path: string; extension?: string }>;
    folders: Array<{ name: string; path: string }>;
}

export interface EventListenerInfo {
    element: HTMLElement | Document;
    event: string;
    handler: EventListener;
}

export interface APIModelConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface AvailableModel {
    id: string;
    name: string;
    provider: string;
}

export interface PluginSettings {
    providers: Record<string, ProviderConfig>;
    models: Record<string, ModelConfig>;
    currentModel: string;
    maxTokens: number;
    conversionPrompt?: string;
    outputSettings: OutputSettings;
    advancedSettings: AdvancedSettings;
    apiKeyLinks?: Record<string, string>;
    useKeychain?: boolean;
}

export interface OutputSettings {
    outputDir: string;
    keepOriginalName: boolean;
    outputExtension: string;
    autoOpen: boolean;
    contentAfterTitle?: string; // 标题下方插入的自定义内容
}

export interface AdvancedSettings {
    timeout: number;
    pdfQuality: number;  // PDF转图片质量 (0.1-1.0, 默认0.8)
    pdfScale: number;    // PDF转图片缩放比例 (1.0-2.0, 默认1.5)
    imagesPerRequest?: number; // 每次提交给AI的图片数量（默认1）
    concurrencyLimit?: number; // 批次并发限制（默认2）
    retryAttempts?: number;    // 批次请求重试次数（默认2）
    autoMinimizeProgress?: boolean; // 启动转换时自动最小化进度窗口
}

export interface FileData {
    path: string;
    base64: string;
    mimeType: string;
    size: number;
    name: string;
    isPdf?: boolean;
}

export interface ConversionResult {
    markdown: string;
    sourcePath: string;
    outputPath: string;
    provider: string;
    duration: number;
    success: boolean;
    error?: string;
    suggestedFilename?: string;
    modelId?: string;
    modelName?: string;
    tokensUsed?: number;
    cacheHit?: boolean;
    retryCount?: number;
    warnings?: string[];
}

export interface AIProvider {
    name: string;
    convert(fileData: FileData, prompt: string): Promise<string>;
    validateConfig(): boolean;
}

export interface ProgressCallback {
    (progress: {
        current: number;
        total: number;
        message: string;
    }): void;
}
