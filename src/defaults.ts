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

/**
 * 默认转换提示词（来自noted.md）
 */
export const DEFAULT_CONVERSION_PROMPT = `Take the handwritten notes from this image and convert them into a clean, well-structured Markdown file. Pay attention to headings, lists, and any other formatting. Resemble the hierarchy. Use latex for mathematical equations. For latex use the $$ syntax instead of \`\`\`latex. Do not skip anything from the original text. The output should be suitable for use in Obsidian. Just give me the markdown, do not include other text in the response apart from the markdown file. No explanation on how the changes were made is needed`;

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
