export const MODEL_CATEGORIES = {
    THINKING: "thinking",
    VISION: "vision",
    MULTIMODAL: "multimodal",
    TEXT: "text",
    IMAGE: "image"
} as const;

export const SYSTEM_PROMPTS: Record<string, string> = {
    continue: "你是一个专业的写作助手。请根据用户提供的上下文，从光标位置开始续写后续内容。重要：只生成新的内容，不要重复或重写已有的内容。",
    convert: "你是一个面向 Obsidian 的 OCR 与文档转换助手。将图片内容转换为结构化 Markdown：保持原文语言，不要翻译；保留标题层级/列表/表格/代码块；公式用 $...$ 与 $$...$$；看不清的内容用[无法辨认]/[不确定]标注，不要猜测；只输出 Markdown 正文，不要输出解释。"
};

export const FILE_EXTENSIONS = {
    IMAGE: ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"],
    DOCUMENT: ["md", "txt", "docx", "doc", "pdf", "xlsx", "xls", "epub", "mobi", "csv", "json"]
} as const;

export const IMAGE_CONSTANTS = {
    MAX_FILE_SIZE: 10485760,
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"]
} as const;

export const PROVIDER_TYPES = [
    { id: "openai", name: "OpenAI", defaultBaseUrl: "https://api.openai.com/v1" },
    { id: "anthropic", name: "Anthropic", defaultBaseUrl: "https://api.anthropic.com/v1" },
    { id: "gemini", name: "Google Gemini", defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta" },
    { id: "deepseek", name: "DeepSeek", defaultBaseUrl: "https://api.deepseek.com/v1" },
    { id: "ollama", name: "Ollama (Local)", defaultBaseUrl: "http://localhost:11434" },
    { id: "custom", name: "Custom (OpenAI Compatible)", defaultBaseUrl: "" }
];
