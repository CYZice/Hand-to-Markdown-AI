import { MODEL_CATEGORIES } from "./constants";
import type { PluginSettings } from "./types";

export const DEFAULT_SETTINGS: PluginSettings = {
    useKeychain: true,
    providers: {
        openai: {
            apiKey: "",
            baseUrl: "https://api.openai.com/v1",
            enabled: true,
            name: "OpenAI",
            type: "openai"
        },
        anthropic: {
            apiKey: "",
            baseUrl: "https://api.anthropic.com/v1",
            enabled: false,
            name: "Anthropic",
            type: "anthropic"
        },
        gemini: {
            apiKey: "",
            baseUrl: "https://generativelanguage.googleapis.com/v1beta",
            enabled: false,
            name: "Google Gemini",
            type: "gemini"
        },
        ollama: {
            apiKey: "",
            baseUrl: "http://localhost:11434/v1",
            enabled: false,
            name: "Ollama",
            type: "ollama"
        }
    },

    models: {
        "gpt-4o-mini": {
            id: "gpt-4o-mini",
            name: "GPT-4o mini",
            provider: "openai",
            model: "gpt-4o-mini",
            enabled: true,
            category: MODEL_CATEGORIES.MULTIMODAL
        },
        "gpt-4o": {
            id: "gpt-4o",
            name: "GPT-4o",
            provider: "openai",
            model: "gpt-4o",
            enabled: true,
            category: MODEL_CATEGORIES.MULTIMODAL
        },
        "gpt-5": {
            id: "gpt-5",
            name: "GPT-5",
            provider: "openai",
            model: "gpt-5",
            enabled: false,
            category: MODEL_CATEGORIES.MULTIMODAL
        }
    },

    currentModel: "gpt-4o-mini",
    maxTokens: 5000,
    conversionPrompt: undefined,

    outputSettings: {
        outputDir: "Handwriting Converted",
        keepOriginalName: true,
        outputExtension: "md",
        autoOpen: true,
        contentAfterTitle: "" // 默认为空，不插入任何内容
    },

    advancedSettings: {
        timeout: 30000,
        pdfQuality: 0.8,
        pdfScale: 1.5,
        imagesPerRequest: 1,
        concurrencyLimit: 2,
        retryAttempts: 2,
        autoMinimizeProgress: false
    },

    apiKeyLinks: {
        openai: "https://platform.openai.com/api-keys",
        anthropic: "https://console.anthropic.com/",
        gemini: "https://aistudio.google.com/app/apikey",
        ollama: "https://ollama.com/"
    }
};

export const DEFAULT_CONVERSION_PROMPT = `你是一个面向 Obsidian 的 OCR 与笔记结构化助手。

任务：把输入图片中的内容转换成干净、结构化的 Markdown。

规则：
- 保持原文语言，不要翻译。
- 尽量保留原有结构：标题层级、段落、列表、表格、代码块、引用、强调等。
- 数学公式：行内用 $...$，独立公式用 $$...$$。
- 不要臆测或补全看不清的内容：遇到无法辨认的字/词/行，用 [无法辨认] 或 [不确定] 标注，并保留周围可读内容。
- 图表/流程图/示意图：优先转写可读的标签与文字；只有在信息明确时才做解释。如果信息不足，添加一个小节说明“图示信息不足”，并列出你能确定的要点（不要编造）。
- 如果一次输入包含多张图片（例如 PDF 连续页），按输入顺序输出，并用二级标题分隔每一页：## Page 1 / ## Page 2 ...（如果用户提供了页码则使用对应页码）。

只输出 Markdown 正文，不要输出任何额外说明。`;

/**
 * 支持的文件类型和对应的MIME类型
 */
export const SUPPORTED_FILE_TYPES = {
    // 图片格式
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",

    // PDF格式
    ".pdf": "application/pdf",

    // Excalidraw格式
    ".excalidraw": "application/json",
    ".excalidraw.md": "application/json",

};

/**
 * 文件大小限制（10MB）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
