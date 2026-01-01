var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/constants.ts
var MODEL_CATEGORIES, SYSTEM_PROMPTS;
var init_constants = __esm({
  "src/constants.ts"() {
    MODEL_CATEGORIES = {
      THINKING: "thinking",
      VISION: "vision",
      MULTIMODAL: "multimodal",
      TEXT: "text",
      IMAGE: "image"
    };
    SYSTEM_PROMPTS = {
      continue: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u5199\u4F5C\u52A9\u624B\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u4E0A\u4E0B\u6587\uFF0C\u4ECE\u5149\u6807\u4F4D\u7F6E\u5F00\u59CB\u7EED\u5199\u540E\u7EED\u5185\u5BB9\u3002\u91CD\u8981\uFF1A\u53EA\u751F\u6210\u65B0\u7684\u5185\u5BB9\uFF0C\u4E0D\u8981\u91CD\u590D\u6216\u91CD\u5199\u5DF2\u6709\u7684\u5185\u5BB9\u3002",
      convert: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6587\u6863\u8F6C\u6362\u52A9\u624B\u3002\u8BF7\u5C06\u56FE\u7247\u4E2D\u7684\u624B\u5199\u7B14\u8BB0\u8F6C\u6362\u4E3A\u7ED3\u6784\u5316\u7684Markdown\u683C\u5F0F\u3002\u6CE8\u610F\u6807\u9898\u3001\u5217\u8868\u548C\u5176\u4ED6\u683C\u5F0F\u3002\u4F7F\u7528$$\u8BED\u6CD5\u8868\u793A\u6570\u5B66\u516C\u5F0F\u3002\u4E0D\u8981\u9057\u6F0F\u539F\u59CB\u6587\u672C\u4E2D\u7684\u4EFB\u4F55\u5185\u5BB9\u3002\u8F93\u51FA\u5E94\u9002\u5408\u5728Obsidian\u4E2D\u4F7F\u7528\u3002\u53EA\u8FD4\u56DEmarkdown\u5185\u5BB9\uFF0C\u4E0D\u8981\u5305\u542B\u5176\u4ED6\u6587\u672C\u6216\u89E3\u91CA\u3002"
    };
  }
});

// src/defaults.ts
var defaults_exports = {};
__export(defaults_exports, {
  DEFAULT_CONVERSION_PROMPT: () => DEFAULT_CONVERSION_PROMPT,
  DEFAULT_SETTINGS: () => DEFAULT_SETTINGS,
  MAX_FILE_SIZE: () => MAX_FILE_SIZE,
  SUPPORTED_FILE_TYPES: () => SUPPORTED_FILE_TYPES
});
var DEFAULT_SETTINGS, DEFAULT_CONVERSION_PROMPT, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE;
var init_defaults = __esm({
  "src/defaults.ts"() {
    init_constants();
    DEFAULT_SETTINGS = {
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
        "gemini-3-pro-preview": {
          id: "gemini-3-pro-preview",
          name: "Gemini 3 Pro Preview",
          provider: "openai",
          model: "gemini-3-pro-preview",
          enabled: true,
          category: MODEL_CATEGORIES.MULTIMODAL
        },
        "gemini-3-flash-preview": {
          id: "gemini-3-flash-preview",
          name: "Gemini 3 Flash Preview",
          provider: "openai",
          model: "gemini-3-flash-preview",
          enabled: true,
          category: MODEL_CATEGORIES.MULTIMODAL
        },
        "gpt-5": {
          id: "gpt-5",
          name: "GPT-5",
          provider: "openai",
          model: "gpt-5",
          enabled: true,
          category: MODEL_CATEGORIES.MULTIMODAL
        }
      },
      currentModel: "gemini-3-flash-preview",
      maxTokens: 5e3,
      conversionPrompt: void 0,
      outputSettings: {
        outputDir: "Handwriting Converted",
        keepOriginalName: true,
        outputExtension: "md",
        autoOpen: true
      },
      advancedSettings: {
        timeout: 3e4,
        pdfQuality: 0.8,
        pdfScale: 1.5
      },
      apiKeyLinks: {
        openai: "https://platform.openai.com/api-keys",
        anthropic: "https://console.anthropic.com/",
        gemini: "https://aistudio.google.com/app/apikey",
        ollama: "https://ollama.com/"
      }
    };
    DEFAULT_CONVERSION_PROMPT = `Take the handwritten notes from this image and convert them into a clean, well-structured Markdown file. Pay attention to headings, lists, and any other formatting. Resemble the hierarchy. Use latex for mathematical equations. For latex use the $$ syntax instead of \`\`\`latex. Do not skip anything from the original text. The output should be suitable for use in Obsidian. Just give me the markdown, do not include other text in the response apart from the markdown file. No explanation on how the changes were made is needed`;
    SUPPORTED_FILE_TYPES = {
      // 图片格式
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      // PDF格式
      ".pdf": "application/pdf"
    };
    MAX_FILE_SIZE = 10 * 1024 * 1024;
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HandMarkdownAIPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/conversion-modal.ts
var import_obsidian5 = require("obsidian");

// src/conversion-service.ts
var import_obsidian4 = require("obsidian");
init_defaults();

// src/file-processor.ts
var import_obsidian = require("obsidian");
init_defaults();
var FileProcessor = class {
  /**
   * 处理文件并返回FileData
   * 
   * @param filePath 文件路径
   * @param app Obsidian App实例
   * @returns Promise<FileData> 处理后的文件数据
   * @throws Error 如果文件处理失败
   */
  static async processFile(filePath, app) {
    const extension = this.getFileExtension(filePath);
    const mimeType = SUPPORTED_FILE_TYPES[extension];
    if (!mimeType) {
      throw new Error(`\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u7C7B\u578B: ${extension}`);
    }
    const arrayBuffer = await this.readFile(filePath, app);
    const fileSize = arrayBuffer.byteLength;
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`\u6587\u4EF6\u8FC7\u5927: ${this.formatFileSize(fileSize)} (\u6700\u5927\u652F\u6301 ${this.formatFileSize(MAX_FILE_SIZE)})`);
    }
    const base64 = this.arrayBufferToBase64(arrayBuffer);
    const fileName = this.getFileName(filePath);
    return {
      path: filePath,
      base64,
      mimeType,
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
  static async processFiles(filePaths, app, onProgress) {
    const results = [];
    const total = filePaths.length;
    for (let i = 0; i < total; i++) {
      const filePath = filePaths[i];
      try {
        if (onProgress) {
          onProgress(i + 1, total, `\u6B63\u5728\u5904\u7406: ${this.getFileName(filePath)}`);
        }
        const fileData = await this.processFile(filePath, app);
        results.push(fileData);
      } catch (error) {
        console.error(`\u5904\u7406\u6587\u4EF6\u5931\u8D25: ${filePath}`, error);
        new import_obsidian.Notice(`\u5904\u7406\u6587\u4EF6\u5931\u8D25: ${this.getFileName(filePath)}`, 5e3);
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
  static async readFile(filePath, app) {
    try {
      const file = app.vault.getAbstractFileByPath(filePath);
      if (!file || !(file instanceof import_obsidian.TFile)) {
        throw new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${filePath}`);
      }
      const arrayBuffer = await app.vault.readBinary(file);
      return arrayBuffer;
    } catch (error) {
      throw new Error(`\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * 将ArrayBuffer转换为Base64字符串
   * 
   * @param buffer ArrayBuffer
   * @returns string Base64字符串
   */
  static arrayBufferToBase64(buffer) {
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
  static getFileExtension(filePath) {
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
  static getFileName(filePath) {
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
  static formatFileSize(bytes) {
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
  static isFileSupported(filePath) {
    const extension = this.getFileExtension(filePath);
    return extension in SUPPORTED_FILE_TYPES;
  }
  /**
   * 获取文件的MIME类型
   * 
   * @param filePath 文件路径
   * @returns string | undefined MIME类型
   */
  static getFileMimeType(filePath) {
    const extension = this.getFileExtension(filePath);
    return SUPPORTED_FILE_TYPES[extension];
  }
};

// src/services/ai-service.ts
var import_obsidian2 = require("obsidian");
init_constants();
init_defaults();
var AIService = class {
  settings;
  app;
  requestQueue = [];
  isProcessing = false;
  constructor(settings, app) {
    this.settings = settings;
    this.app = app;
  }
  updateSettings(settings) {
    this.settings = settings;
  }
  getCurrentModelConfig() {
    const currentModelId = this.settings.currentModel;
    if (!currentModelId) {
      throw new Error("\u672A\u9009\u62E9\u5F53\u524D\u6A21\u578B");
    }
    const modelConfig = this.settings.models[currentModelId];
    if (!modelConfig || !modelConfig.enabled) {
      throw new Error(`\u6A21\u578B ${currentModelId} \u672A\u542F\u7528\u6216\u4E0D\u5B58\u5728`);
    }
    const providerConfig = this.settings.providers[modelConfig.provider];
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`\u4F9B\u5E94\u5546 ${modelConfig.provider} \u672A\u542F\u7528\u6216\u4E0D\u5B58\u5728`);
    }
    return {
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
      model: modelConfig.actualModel || modelConfig.model || modelConfig.id
    };
  }
  isVisionModel(model) {
    const currentModelId = this.settings.currentModel;
    const modelConfig = this.settings.models[currentModelId];
    if (!modelConfig)
      return false;
    let category = modelConfig.category;
    if (!category && modelConfig.type) {
      category = modelConfig.type === "image" ? MODEL_CATEGORIES.IMAGE : MODEL_CATEGORIES.TEXT;
    }
    return category === MODEL_CATEGORIES.VISION;
  }
  isThinkingModel(model = null) {
    const currentModelId = this.settings.currentModel;
    const modelConfig = this.settings.models[currentModelId];
    if (!modelConfig)
      return false;
    let category = modelConfig.category;
    if (!category && modelConfig.type) {
      category = modelConfig.type === "image" ? MODEL_CATEGORIES.IMAGE : MODEL_CATEGORIES.TEXT;
    }
    return category === MODEL_CATEGORIES.THINKING;
  }
  normalizeBaseUrl(url) {
    if (!url)
      return "";
    return url.replace(/\/$/, "");
  }
  buildApiUrl(endpoint) {
    const config = this.getCurrentModelConfig();
    const baseUrl = this.normalizeBaseUrl(config.baseUrl);
    const isOpenAI = baseUrl.includes("api.openai.com");
    if (baseUrl.endsWith("/v1")) {
      return `${baseUrl}${endpoint}`;
    } else if (!isOpenAI && (baseUrl.includes("/chat/completions") || baseUrl.includes("/images/generations"))) {
      const cleanBase = baseUrl.split("/chat/completions")[0].split("/images/generations")[0];
      return `${cleanBase}${endpoint}`;
    } else {
      return `${baseUrl}/v1${endpoint}`;
    }
  }
  getMaxTokens(mode) {
    return this.settings.maxTokens || DEFAULT_SETTINGS.maxTokens;
  }
  async sendRequest(mode, context, prompt = "", images = [], chatHistory = [], onStream = null) {
    const config = this.getCurrentModelConfig();
    if (!config.apiKey) {
      throw new Error("\u8BF7\u5148\u914D\u7F6EAPI Key");
    }
    const currentModelId = this.settings.currentModel;
    const modelConfig = this.settings.models[currentModelId];
    let category = modelConfig?.category;
    if (!category && modelConfig) {
      if (modelConfig.type === "image") {
        category = MODEL_CATEGORIES.IMAGE;
      } else {
        category = MODEL_CATEGORIES.TEXT;
      }
      modelConfig.category = category;
    }
    if (category === MODEL_CATEGORIES.IMAGE) {
      if (mode === "continue" && context.selectedText && context.selectedText.trim()) {
        throw new Error("\u4E0D\u652F\u6301\u56FE\u7247\u751F\u6210\u6A21\u578B\uFF0C\u8BF7\u9009\u62E9\u6587\u672C\u751F\u6210\u6A21\u578B\u8FDB\u884C\u6587\u672C\u4FEE\u6539\u3002");
      }
      return this.handleImageGeneration(prompt, config, context.cursorPosition);
    }
    const isThinking = category === MODEL_CATEGORIES.THINKING || this.isThinkingModel(config.model);
    const isStreaming = onStream && typeof onStream === "function";
    const isMultimodal = category === MODEL_CATEGORIES.MULTIMODAL;
    const isVision = category === MODEL_CATEGORIES.VISION || this.isVisionModel(config.model);
    if (images && images.length > 0 && !(isMultimodal || isVision)) {
      new import_obsidian2.Notice(`\u5F53\u524D\u6A21\u578B ${config.model} \u4E0D\u652F\u6301\u56FE\u7247\u548C\u9644\u4EF6\uFF0C\u8BF7\u5207\u6362\u5230\u591A\u6A21\u6001\u6A21\u578B\u6216\u89C6\u89C9\u6A21\u578B`);
      images = [];
    }
    let systemPrompt = SYSTEM_PROMPTS[mode] || "";
    let userPrompt = "";
    if (mode === "continue") {
      if (context.selectedText && context.selectedText.trim()) {
        userPrompt = `\u9700\u8981\u4FEE\u6539\u7684\u5B8C\u6574\u5185\u5BB9\uFF1A${context.selectedText}

\u4FEE\u6539\u8981\u6C42\uFF1A${prompt}`;
      } else {
        userPrompt = `\u4EE5\u4E0B\u662F\u5149\u6807\u524D\u7684\u4E0A\u4E0B\u6587\u5185\u5BB9\uFF1A
${context.beforeText}

\u8BF7\u4ECE\u5149\u6807\u4F4D\u7F6E\u5F00\u59CB\u7EED\u5199\uFF0C\u53EA\u751F\u6210\u65B0\u5185\u5BB9\uFF0C\u4E0D\u8981\u91CD\u590D\u4E0A\u8FF0\u5185\u5BB9\u3002\u7EED\u5199\u8981\u6C42\uFF1A${prompt}`;
      }
    } else {
      userPrompt = `\u4E0A\u4E0B\u6587\uFF1A${context.beforeText}

\u9009\u4E2D\u6587\u672C\uFF1A${context.selectedText}

\u540E\u7EED\u5185\u5BB9\uFF1A${context.afterText}`;
      if (prompt) {
        userPrompt += `

\u7279\u6B8A\u8981\u6C42\uFF1A${prompt}`;
      }
    }
    if (context.additionalContext && context.additionalContext.trim()) {
      userPrompt += `

\u3010\u91CD\u8981\u63D0\u793A\uFF1A\u4EE5\u4E0B\u662F\u5FC5\u987B\u53C2\u8003\u7684\u6587\u6863\u5185\u5BB9\uFF0C\u8BF7\u52A1\u5FC5\u57FA\u4E8E\u8FD9\u4E9B\u5185\u5BB9\u8FDB\u884C\u56DE\u590D\uFF0C\u4E0D\u5F97\u5FFD\u7565\u3011

=== \u5FC5\u8BFB\u53C2\u8003\u6587\u6863 ===
${context.additionalContext}
=== \u53C2\u8003\u6587\u6863\u7ED3\u675F ===

\u3010\u8BF7\u786E\u4FDD\u4F60\u7684\u56DE\u590D\u5B8C\u5168\u57FA\u4E8E\u4E0A\u8FF0\u6587\u6863\u5185\u5BB9\uFF0C\u5FC5\u987B\u5F15\u7528\u548C\u4F7F\u7528\u6587\u6863\u4E2D\u7684\u4FE1\u606F\u3011`;
    }
    if (context.contextContent && context.contextContent.trim()) {
      userPrompt += `

\u3010\u91CD\u8981\u63D0\u793A\uFF1A\u4EE5\u4E0B\u662F\u5FC5\u987B\u53C2\u8003\u7684\u6587\u6863\u5185\u5BB9\uFF0C\u8BF7\u52A1\u5FC5\u57FA\u4E8E\u8FD9\u4E9B\u5185\u5BB9\u8FDB\u884C\u56DE\u590D\uFF0C\u4E0D\u5F97\u5FFD\u7565\u3011

=== \u5FC5\u8BFB\u53C2\u8003\u6587\u6863 ===
${context.contextContent}
=== \u53C2\u8003\u6587\u6863\u7ED3\u675F ===

\u3010\u8BF7\u786E\u4FDD\u4F60\u7684\u56DE\u590D\u5B8C\u5168\u57FA\u4E8E\u4E0A\u8FF0\u6587\u6863\u5185\u5BB9\uFF0C\u5FC5\u987B\u5F15\u7528\u548C\u4F7F\u7528\u6587\u6863\u4E2D\u7684\u4FE1\u606F\u3011`;
    }
    const apiUrl = this.buildApiUrl("/chat/completions");
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }
    if (images && images.length > 0) {
      userPrompt += `

\u9644\u52A0\u56FE\u7247\uFF1A\u5171${images.length}\u5F20\u56FE\u7247`;
      const content = [
        { type: "text", text: userPrompt }
      ];
      images.forEach((img) => {
        content.push({
          type: "image_url",
          image_url: {
            url: img.base64 || img.url
          }
        });
      });
      messages.push({
        role: "user",
        content
      });
    } else {
      messages.push({
        role: "user",
        content: userPrompt
      });
    }
    const requestBody = {
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: this.getMaxTokens(mode)
    };
    if (isStreaming) {
      requestBody.stream = true;
    }
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      };
      if (isStreaming) {
        return await this.handleStreamRequest(apiUrl, headers, requestBody, onStream);
      }
      const response = await (0, import_obsidian2.requestUrl)({
        url: apiUrl,
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
        throw: false
      });
      if (response.status !== 200) {
        const errorText = response.text;
        if (response.status === 429) {
          if (errorText.includes("quota") || errorText.includes("insufficient_quota")) {
            throw new Error("API\u914D\u989D\u5DF2\u7528\u5B8C\uFF0C\u8BF7\u68C0\u67E5\u60A8\u7684\u8D26\u6237\u4F59\u989D\u548C\u8BA1\u8D39\u8BE6\u60C5\u3002");
          } else {
            throw new Error("API\u8BF7\u6C42\u9891\u7387\u8FC7\u9AD8\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002");
          }
        }
        throw new Error(`API\u8BF7\u6C42\u5931\u8D25: ${response.status} ${errorText}`);
      }
      const data = response.json;
      if (!data.choices || data.choices.length === 0) {
        throw new Error("API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u7F3A\u5C11choices\u6570\u7EC4");
      }
      const choice = data.choices[0];
      if (!choice.message) {
        throw new Error("API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u7F3A\u5C11message\u5BF9\u8C61");
      }
      let content = "";
      if (choice.message.content) {
        content = choice.message.content.trim();
      } else if (choice.text) {
        content = choice.text.trim();
      } else if (choice.message.text) {
        content = choice.message.text.trim();
      } else {
        throw new Error("API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u627E\u4E0D\u5230\u5185\u5BB9\u5B57\u6BB5");
      }
      const usage = data.usage || {};
      return {
        content,
        usage
      };
    } catch (error) {
      throw error;
    }
  }
  async handleStreamRequest(apiUrl, headers, requestBody, onStream) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          if (errorText.includes("quota") || errorText.includes("insufficient_quota")) {
            throw new Error("API\u914D\u989D\u5DF2\u7528\u5B8C\uFF0C\u8BF7\u68C0\u67E5\u60A8\u7684\u8D26\u6237\u4F59\u989D\u548C\u8BA1\u8D39\u8BE6\u60C5\u3002");
          } else {
            throw new Error("API\u8BF7\u6C42\u9891\u7387\u8FC7\u9AD8\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002");
          }
        }
        throw new Error(`API\u8BF7\u6C42\u5931\u8D25: ${response.status} ${errorText}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let thinking = "";
      let streamedContent = "";
      let fullContent = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                if (delta?.reasoning_content) {
                  const reasoningChunk = delta.reasoning_content;
                  thinking += reasoningChunk;
                  fullContent += reasoningChunk;
                  onStream({
                    content: streamedContent,
                    thinking,
                    fullContent,
                    isComplete: false
                  });
                }
                if (delta?.content) {
                  const contentChunk = delta.content;
                  streamedContent += contentChunk;
                  fullContent += contentChunk;
                  onStream({
                    content: streamedContent,
                    thinking,
                    fullContent,
                    isComplete: false
                  });
                }
                if (delta?.text) {
                  const textChunk = delta.text;
                  streamedContent += textChunk;
                  fullContent += textChunk;
                  onStream({
                    content: streamedContent,
                    thinking,
                    fullContent,
                    isComplete: false
                  });
                }
              } catch (e) {
              }
            }
          }
        }
        onStream({
          content: streamedContent,
          thinking,
          fullContent,
          isComplete: true
        });
        return {
          content: streamedContent.trim(),
          thinking: thinking.trim(),
          usage: {}
        };
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw error;
    }
  }
  async handleImageGeneration(prompt, config, cursorPosition = null) {
    if (!prompt || !prompt.trim()) {
      throw new Error("\u8BF7\u8F93\u5165\u56FE\u7247\u63CF\u8FF0");
    }
    const apiUrl = this.buildApiUrl("/images/generations");
    const model = config.model;
    const requestBody = {
      model,
      prompt: prompt.trim(),
      response_format: "b64_json",
      n: 1,
      size: this.settings.imageGenerationSize || "1024x1024"
    };
    if (model.includes("dall-e") && model === "dall-e-3") {
      requestBody.quality = "standard";
      requestBody.style = "vivid";
    }
    try {
      const response = await (0, import_obsidian2.requestUrl)({
        url: apiUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody),
        throw: false
      });
      if (response.status !== 200) {
        const errorText = response.text;
        if (response.status === 429) {
          if (errorText.includes("quota") || errorText.includes("insufficient_quota")) {
            throw new Error("API\u914D\u989D\u5DF2\u7528\u5B8C\uFF0C\u8BF7\u68C0\u67E5\u60A8\u7684\u8D26\u6237\u4F59\u989D\u548C\u8BA1\u8D39\u8BE6\u60C5\u3002");
          } else {
            throw new Error("API\u8BF7\u6C42\u9891\u7387\u8FC7\u9AD8\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002");
          }
        }
        if (response.status === 401) {
          throw new Error("API\u5BC6\u94A5\u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E\u3002");
        }
        throw new Error(`\u56FE\u7247\u751F\u6210API\u8BF7\u6C42\u5931\u8D25: ${response.status} ${errorText}`);
      }
      const data = response.json;
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error("\u56FE\u7247\u751F\u6210API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF");
      }
      const imageData = data.data[0];
      let base64Data = null;
      if (imageData.b64_json) {
        base64Data = imageData.b64_json;
      } else {
        throw new Error("\u56FE\u7247\u751F\u6210API\u8FD4\u56DE\u6570\u636E\u4E2D\u7F3A\u5C11\u56FE\u7247\u5185\u5BB9");
      }
      if (!base64Data) {
        throw new Error("\u56FE\u7247\u751F\u6210API\u8FD4\u56DE\u6570\u636E\u4E2D\u7F3A\u5C11\u56FE\u7247\u5185\u5BB9");
      }
      try {
        const fileName = `image_${Date.now()}.png`;
        const savePath = this.settings.imageSavePath || "Extras/\u9644\u4EF6";
        const fullPath = savePath + "/" + fileName;
        try {
          const folder = this.app.vault.getAbstractFileByPath(savePath);
          if (!folder) {
            await this.app.vault.createFolder(savePath);
          }
        } catch (e) {
          try {
            await this.app.vault.adapter.mkdir(savePath);
          } catch (mkdirError) {
            console.error("\u521B\u5EFA\u76EE\u5F55\u5931\u8D25:", mkdirError);
          }
        }
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        await this.app.vault.createBinary(fullPath, bytes.buffer);
        const markdownLink = `![[${fullPath}]]`;
        return {
          content: markdownLink,
          imageData,
          usage: {}
        };
      } catch (saveError) {
        console.error("\u4FDD\u5B58\u56FE\u7247\u5931\u8D25:", saveError);
        throw new Error("\u56FE\u7247\u4FDD\u5B58\u5931\u8D25");
      }
    } catch (error) {
      throw error;
    }
  }
  async convertFile(fileData, prompt, onStream) {
    const startTime = Date.now();
    try {
      const config = this.getCurrentModelConfig();
      if (!config.apiKey) {
        throw new Error("\u8BF7\u5148\u914D\u7F6EAPI Key");
      }
      const currentModelId = this.settings.currentModel;
      const modelConfig = this.settings.models[currentModelId];
      let category = modelConfig?.category;
      if (!category && modelConfig) {
        if (modelConfig.type === "image") {
          category = MODEL_CATEGORIES.IMAGE;
        } else {
          category = MODEL_CATEGORIES.TEXT;
        }
      }
      const isMultimodal = category === MODEL_CATEGORIES.MULTIMODAL;
      const isVision = category === MODEL_CATEGORIES.VISION || this.isVisionModel(config.model);
      if (!isMultimodal && !isVision) {
        throw new Error(`\u5F53\u524D\u6A21\u578B ${config.model} \u4E0D\u652F\u6301\u56FE\u7247\u8BC6\u522B\uFF0C\u8BF7\u5207\u6362\u5230\u591A\u6A21\u6001\u6A21\u578B\u6216\u89C6\u89C9\u6A21\u578B`);
      }
      const conversionPrompt = prompt || this.settings.conversionPrompt || SYSTEM_PROMPTS.convert;
      const apiUrl = this.buildApiUrl("/chat/completions");
      const messages = [
        { role: "system", content: conversionPrompt }
      ];
      const content = [
        { type: "text", text: "\u8BF7\u5C06\u56FE\u7247\u4E2D\u7684\u624B\u5199\u7B14\u8BB0\u8F6C\u6362\u4E3A\u7ED3\u6784\u5316\u7684Markdown\u683C\u5F0F\u3002" }
      ];
      content.push({
        type: "image_url",
        image_url: {
          url: fileData.base64
        }
      });
      messages.push({
        role: "user",
        content
      });
      const requestBody = {
        model: config.model,
        messages,
        temperature: 0.3,
        max_tokens: this.settings.maxTokens || 4096
      };
      if (onStream && typeof onStream === "function") {
        requestBody.stream = true;
        return await this.convertFileStream(apiUrl, config, requestBody, fileData, startTime, onStream);
      }
      const response = await (0, import_obsidian2.requestUrl)({
        url: apiUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody),
        throw: false
      });
      if (response.status !== 200) {
        const errorText = response.text;
        if (response.status === 429) {
          if (errorText.includes("quota") || errorText.includes("insufficient_quota")) {
            throw new Error("API\u914D\u989D\u5DF2\u7528\u5B8C\uFF0C\u8BF7\u68C0\u67E5\u60A8\u7684\u8D26\u6237\u4F59\u989D\u548C\u8BA1\u8D39\u8BE6\u60C5\u3002");
          } else {
            throw new Error("API\u8BF7\u6C42\u9891\u7387\u8FC7\u9AD8\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002");
          }
        }
        throw new Error(`API\u8BF7\u6C42\u5931\u8D25: ${response.status} ${errorText}`);
      }
      const data = response.json;
      if (!data.choices || data.choices.length === 0) {
        throw new Error("API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u7F3A\u5C11choices\u6570\u7EC4");
      }
      const choice = data.choices[0];
      if (!choice.message) {
        throw new Error("API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u7F3A\u5C11message\u5BF9\u8C61");
      }
      let markdown = "";
      if (choice.message.content) {
        markdown = choice.message.content.trim();
      } else if (choice.text) {
        markdown = choice.text.trim();
      } else if (choice.message.text) {
        markdown = choice.message.text.trim();
      } else {
        throw new Error("API\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF1A\u627E\u4E0D\u5230\u5185\u5BB9\u5B57\u6BB5");
      }
      const usage = data.usage || {};
      const duration = Date.now() - startTime;
      return {
        markdown,
        sourcePath: fileData.path,
        outputPath: "",
        provider: config.model,
        duration,
        success: true,
        modelId: currentModelId,
        modelName: modelConfig?.name || config.model,
        tokensUsed: usage.total_tokens
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("\u6587\u4EF6\u8F6C\u6362\u5931\u8D25:", error);
      return {
        markdown: "",
        sourcePath: fileData.path,
        outputPath: "",
        provider: this.settings.currentModel || "unknown",
        duration: Date.now() - startTime,
        success: false,
        error: errorMessage
      };
    }
  }
  /**
   * 流式转换文件（实时返回内容）
   */
  async convertFileStream(apiUrl, config, requestBody, fileData, startTime, onStream) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          throw new Error(errorText.includes("quota") ? "API\u914D\u989D\u5DF2\u7528\u5B8C" : "API\u8BF7\u6C42\u9891\u7387\u8FC7\u9AD8");
        }
        throw new Error(`API\u8BF7\u6C42\u5931\u8D25: ${response.status} ${errorText}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedContent = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]")
                break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                if (delta?.content) {
                  streamedContent += delta.content;
                  onStream({ content: streamedContent, isComplete: false });
                }
              } catch (e) {
              }
            }
          }
        }
        onStream({ content: streamedContent, isComplete: true });
        return {
          markdown: streamedContent.trim(),
          sourcePath: fileData.path,
          outputPath: "",
          provider: config.model,
          duration: Date.now() - startTime,
          success: true
        };
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw error;
    }
  }
  async convertFiles(fileDataList, prompt, onProgress) {
    const results = [];
    const total = fileDataList.length;
    for (let i = 0; i < total; i++) {
      const fileData = fileDataList[i];
      if (onProgress) {
        onProgress(i + 1, total, fileData.name);
      }
      const result = await this.convertFile(fileData, prompt);
      results.push(result);
    }
    return results;
  }
  validateConfig() {
    try {
      const config = this.getCurrentModelConfig();
      return !!(config.apiKey && config.baseUrl && config.model);
    } catch (error) {
      return false;
    }
  }
};

// src/utils/pdf-processor.ts
var import_obsidian3 = require("obsidian");
var PDFProcessor = class {
  /**
   * 初始化 PDF.js Worker（必须在使用前调用）
   * Obsidian 插件环境下的兼容配置
   */
  static initWorker() {
    if (this.initialized)
      return;
    try {
      if (!window.pdfjsLib) {
        throw new Error("Obsidian PDF.js \u672A\u52A0\u8F7D");
      }
      console.log("PDF.js initialized (using Obsidian built-in)");
      this.initialized = true;
    } catch (err) {
      console.error("Failed to initialize PDF.js:", err);
      new import_obsidian3.Notice("PDF \u529F\u80FD\u4E0D\u53EF\u7528\uFF0C\u8BF7\u66F4\u65B0 Obsidian \u7248\u672C", 5e3);
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
  static async streamConvertPdfToImages(buffer, onPageConverted, onProgress, options = {}) {
    this.initWorker();
    const {
      scale = 1.5,
      quality = 0.8,
      format = "jpeg",
      timeoutPerPage = 2e4,
      onCancel
    } = options;
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      new import_obsidian3.Notice(`\u5F00\u59CB\u5904\u7406 PDF\uFF0C\u5171 ${totalPages} \u9875`, 2e3);
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (onCancel?.()) {
          new import_obsidian3.Notice("\u8F6C\u6362\u5DF2\u53D6\u6D88", 2e3);
          break;
        }
        try {
          const pagePromise = this.renderPageToBase64(
            pdf,
            pageNum,
            scale,
            quality,
            format
          );
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(
              () => reject(new Error(`\u7B2C ${pageNum} \u9875\u8D85\u65F6`)),
              timeoutPerPage
            )
          );
          const base64 = await Promise.race([pagePromise, timeoutPromise]);
          await onPageConverted(base64, pageNum);
          if (onProgress) {
            onProgress(pageNum, totalPages, `\u5DF2\u5904\u7406\u7B2C ${pageNum}/${totalPages} \u9875`);
          }
        } catch (pageError) {
          const errMsg = pageError instanceof Error ? pageError.message : String(pageError);
          console.warn(`\u5904\u7406\u7B2C ${pageNum} \u9875\u5931\u8D25:`, errMsg);
          new import_obsidian3.Notice(`\u26A0\uFE0F \u7B2C ${pageNum} \u9875\u5904\u7406\u5931\u8D25\uFF0C\u8DF3\u8FC7\u8BE5\u9875`, 3e3);
        }
      }
      return totalPages;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("PDF \u52A0\u8F7D\u5931\u8D25:", errMsg);
      throw new Error(`PDF \u5904\u7406\u5931\u8D25: ${errMsg}`);
    }
  }
  /**
   * 将单个 PDF 页面渲染为 Base64 图片
   * @private
   */
  static async renderPageToBase64(pdf, pageNum, scale, quality, format) {
    const page = await pdf.getPage(pageNum);
    try {
      const viewport = page.getViewport({ scale });
      const canvas = this.createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("\u65E0\u6CD5\u83B7\u53D6 Canvas context");
      }
      await page.render({
        canvasContext: context,
        viewport
      }).promise;
      const mimeType = format === "webp" ? "image/webp" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const base64 = dataUrl.split(",")[1];
      page.cleanup();
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      return base64;
    } catch (error) {
      page.cleanup();
      throw error;
    }
  }
  /**
   * 创建 Canvas 元素
   * @private
   */
  static createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  /**
   * 获取 PDF 信息（页数等）
   * 用于预检查，仅读取 metadata，不解析具体内容
   */
  static async getPdfInfo(buffer) {
    this.initWorker();
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      return {
        numPages: pdf.numPages
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`\u65E0\u6CD5\u8BFB\u53D6 PDF \u4FE1\u606F: ${errMsg}`);
    }
  }
};
__publicField(PDFProcessor, "initialized", false);

// src/conversion-service.ts
var ConversionService = class {
  app;
  settings;
  aiService;
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
    this.aiService = new AIService(settings, app);
  }
  updateSettings(settings) {
    this.settings = settings;
    this.aiService.updateSettings(settings);
  }
  getConversionPrompt() {
    return this.settings.conversionPrompt || DEFAULT_CONVERSION_PROMPT;
  }
  async convertFile(filePath) {
    const startTime = Date.now();
    try {
      const mimeType = FileProcessor.getFileMimeType(filePath);
      if (mimeType === "application/pdf") {
        return await this.convertPdfStream(filePath, startTime);
      } else {
        return await this.convertSingleImage(filePath, startTime);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      new import_obsidian4.Notice(`\u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
      console.error("\u8F6C\u6362\u5931\u8D25:", error);
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
  async convertSingleImage(filePath, startTime) {
    try {
      const fileData = await FileProcessor.processFile(filePath, this.app);
      const prompt = this.getConversionPrompt();
      new import_obsidian4.Notice(`\u6B63\u5728\u4F7F\u7528 AI \u8F6C\u6362\u6587\u4EF6...`, 3e3);
      const conversionResult = await this.aiService.convertFile(fileData, prompt);
      const outputPath = await this.saveConversionResult(
        fileData,
        conversionResult.markdown,
        this.extractSuggestedFilename(conversionResult.markdown)
      );
      new import_obsidian4.Notice(`\u8F6C\u6362\u6210\u529F\uFF01\u8017\u65F6: ${conversionResult.duration}ms`, 3e3);
      return {
        ...conversionResult,
        outputPath,
        sourcePath: filePath
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      new import_obsidian4.Notice(`\u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
      console.error("\u8F6C\u6362\u5931\u8D25:", error);
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
  async convertPdfStream(filePath, startTime) {
    let totalPages = 0;
    let successPages = 0;
    let failedPages = [];
    let outputFile = null;
    let outputPath = "";
    try {
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!file) {
        throw new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${filePath}`);
      }
      const arrayBuffer = await this.app.vault.readBinary(file);
      const bufferForInfo = arrayBuffer.slice(0);
      const pdfInfo = await PDFProcessor.getPdfInfo(bufferForInfo);
      totalPages = pdfInfo.numPages;
      new import_obsidian4.Notice(`\u5F00\u59CB\u5904\u7406 PDF\uFF0C\u5171 ${totalPages} \u9875`, 3e3);
      const fileName = FileProcessor.getFileName(filePath);
      const fileData = {
        path: filePath,
        base64: "",
        mimeType: "application/pdf",
        size: 0,
        name: fileName,
        isPdf: true
      };
      outputPath = await this.createOutputFile(
        fileData,
        `# ${fileName}

> \u{1F504} \u6B63\u5728\u8F6C\u6362\u4E2D... (0/${totalPages})

`
      );
      outputFile = this.app.vault.getAbstractFileByPath(outputPath);
      await this.app.workspace.openLinkText(outputFile.path, "", true);
      const prompt = this.getConversionPrompt();
      await PDFProcessor.streamConvertPdfToImages(
        arrayBuffer,
        async (base64, pageNum) => {
          try {
            const pageFileData = {
              path: `${filePath}#page${pageNum}`,
              name: `Page ${pageNum}`,
              base64,
              mimeType: "image/jpeg",
              size: base64.length,
              isPdf: true
            };
            new import_obsidian4.Notice(`\u6B63\u5728\u8F6C\u6362\u7B2C ${pageNum}/${totalPages} \u9875...`, 2e3);
            let pageContent = "";
            const result = await this.aiService.convertFile(
              pageFileData,
              prompt,
              (streamData) => {
                if (streamData.content) {
                  pageContent = streamData.content;
                  const pagePrefix = pageNum === 1 ? `## \u7B2C ${pageNum} \u9875

` : `

---

## \u7B2C ${pageNum} \u9875

`;
                  this.app.vault.read(outputFile).then((currentContent2) => {
                    const pageMarker2 = `## \u7B2C ${pageNum} \u9875`;
                    let baseContent2 = currentContent2;
                    const pageMarkerIndex2 = currentContent2.indexOf(pageMarker2);
                    if (pageMarkerIndex2 !== -1) {
                      const nextPageIndex = currentContent2.indexOf(`## \u7B2C ${pageNum + 1} \u9875`, pageMarkerIndex2);
                      if (nextPageIndex !== -1) {
                        baseContent2 = currentContent2.substring(0, pageMarkerIndex2) + currentContent2.substring(nextPageIndex);
                      } else {
                        baseContent2 = currentContent2.substring(0, pageMarkerIndex2);
                      }
                    }
                    const newContent = baseContent2.replace(
                      /> 🔄 正在转换中... \(\d+\/\d+\)/,
                      `> \u{1F504} \u6B63\u5728\u8F6C\u6362\u4E2D... (\u7B2C${pageNum}\u9875 ${pageContent.length}\u5B57 / \u5171${totalPages}\u9875)`
                    ) + pagePrefix + pageContent;
                    this.app.vault.modify(outputFile, newContent);
                  });
                }
              }
            );
            const currentContent = await this.app.vault.read(outputFile);
            let finalPageContent;
            if (result.success !== false) {
              finalPageContent = pageNum === 1 ? `## \u7B2C ${pageNum} \u9875

${result.markdown}` : `

---

## \u7B2C ${pageNum} \u9875

${result.markdown}`;
              successPages++;
            } else {
              failedPages.push(pageNum);
              finalPageContent = pageNum === 1 ? `## \u7B2C ${pageNum} \u9875

> [!ERROR] \u8F6C\u6362\u5931\u8D25: ${result.error}` : `

---

## \u7B2C ${pageNum} \u9875

> [!ERROR] \u8F6C\u6362\u5931\u8D25: ${result.error}`;
            }
            const pageMarker = `## \u7B2C ${pageNum} \u9875`;
            let baseContent = currentContent;
            const pageMarkerIndex = currentContent.indexOf(pageMarker);
            if (pageMarkerIndex !== -1) {
              const nextPageIndex = currentContent.indexOf(`## \u7B2C ${pageNum + 1} \u9875`, pageMarkerIndex);
              if (nextPageIndex !== -1) {
                baseContent = currentContent.substring(0, pageMarkerIndex) + currentContent.substring(nextPageIndex);
              } else {
                baseContent = currentContent.substring(0, pageMarkerIndex);
              }
            }
            const finalNewContent = baseContent.replace(
              /> 🔄 正在转换中... .*/,
              `> \u{1F504} \u6B63\u5728\u8F6C\u6362\u4E2D... (${pageNum}/${totalPages})`
            ) + finalPageContent;
            await this.app.vault.modify(outputFile, finalNewContent);
          } catch (pageError) {
            failedPages.push(pageNum);
            const errMsg = pageError instanceof Error ? pageError.message : String(pageError);
            console.error(`\u7B2C ${pageNum} \u9875\u8F6C\u6362\u5931\u8D25:`, errMsg);
            const currentContent = await this.app.vault.read(outputFile);
            const errorContent = pageNum === 1 ? `## \u7B2C ${pageNum} \u9875

> [!ERROR] \u8F6C\u6362\u5931\u8D25: ${errMsg}` : `

---

## \u7B2C ${pageNum} \u9875

> [!ERROR] \u8F6C\u6362\u5931\u8D25: ${errMsg}`;
            const errorNewContent = currentContent.replace(
              /> 🔄 正在转换中... \(\d+\/\d+\)/,
              `> \u{1F504} \u6B63\u5728\u8F6C\u6362\u4E2D... (${pageNum}/${totalPages})`
            ) + errorContent;
            await this.app.vault.modify(outputFile, errorNewContent);
          }
        },
        (current, total, message2) => {
          new import_obsidian4.Notice(message2, 1e3);
        },
        {
          scale: this.settings.advancedSettings?.pdfScale || 1.5,
          quality: this.settings.advancedSettings?.pdfQuality || 0.8,
          format: "jpeg",
          timeoutPerPage: this.settings.advancedSettings?.timeout || 3e4,
          onCancel: () => false
        }
      );
      const finalContent = await this.app.vault.read(outputFile);
      const completedContent = finalContent.replace(
        /> 🔄 正在转换中... \(\d+\/\d+\)/,
        failedPages.length > 0 ? `> \u2705 \u8F6C\u6362\u5B8C\u6210\uFF01\u6210\u529F ${successPages}/${totalPages} \u9875\uFF08\u5931\u8D25: \u7B2C ${failedPages.join(", ")} \u9875\uFF09` : `> \u2705 \u8F6C\u6362\u5B8C\u6210\uFF01\u5171 ${totalPages} \u9875`
      );
      await this.app.vault.modify(outputFile, completedContent);
      const duration = Date.now() - startTime;
      const message = failedPages.length > 0 ? `\u8F6C\u6362\u5B8C\u6210\uFF01\u6210\u529F ${successPages}/${totalPages} \u9875\uFF08\u5931\u8D25: \u7B2C ${failedPages.join(", ")} \u9875\uFF09` : `\u8F6C\u6362\u6210\u529F\uFF01${totalPages} \u9875\uFF0C\u8017\u65F6: ${(duration / 1e3).toFixed(1)}s`;
      new import_obsidian4.Notice(message, 5e3);
      return {
        markdown: await this.app.vault.read(outputFile),
        sourcePath: filePath,
        outputPath,
        provider: this.settings.currentModel || "unknown",
        duration,
        success: failedPages.length === 0,
        error: failedPages.length > 0 ? `\u90E8\u5206\u9875\u9762\u8F6C\u6362\u5931\u8D25: ${failedPages.join(", ")}` : void 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      new import_obsidian4.Notice(`PDF \u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
      console.error("PDF \u8F6C\u6362\u5931\u8D25:", error);
      if (outputFile) {
        const errorContent = await this.app.vault.read(outputFile);
        await this.app.vault.modify(
          outputFile,
          errorContent.replace(
            /> 🔄 正在转换中.*/,
            `> \u274C \u8F6C\u6362\u5931\u8D25: ${errorMessage}`
          )
        );
      }
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
   * 从Markdown内容中提取建议的文件名
   * 
   * @param markdown Markdown内容
   * @returns string | undefined 建议的文件名，如果没有找到则返回undefined
   */
  extractSuggestedFilename(markdown) {
    const firstLine = markdown.split("\n")[0].trim();
    if (firstLine.startsWith("#")) {
      const title = firstLine.replace(/^#+\s*/, "").trim();
      const cleanName = title.replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, "-").substring(0, 100);
      if (cleanName.length > 0) {
        return cleanName;
      }
    }
    return void 0;
  }
  async convertFiles(filePaths, onProgress) {
    const results = [];
    const total = filePaths.length;
    for (let i = 0; i < total; i++) {
      const filePath = filePaths[i];
      try {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total,
            message: `\u6B63\u5728\u8F6C\u6362: ${FileProcessor.getFileName(filePath)}`
          });
        }
        const result = await this.convertFile(filePath);
        results.push(result);
      } catch (error) {
        console.error(`\u8F6C\u6362\u6587\u4EF6\u5931\u8D25: ${filePath}`, error);
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
  async createOutputFile(fileData, initialContent) {
    const { outputSettings } = this.settings;
    let outputDir = outputSettings.outputDir;
    if (!outputDir.startsWith("/")) {
      outputDir = "/" + outputDir;
    }
    const outputFolder = this.app.vault.getAbstractFileByPath(outputDir.slice(1));
    if (!outputFolder) {
      await this.app.vault.createFolder(outputDir.slice(1));
    }
    let outputFileName;
    if (outputSettings.keepOriginalName) {
      const baseName = fileData.name.replace(/\.[^/.]+$/, "");
      outputFileName = `${baseName}.${outputSettings.outputExtension}`;
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      outputFileName = `converted-${timestamp}.${outputSettings.outputExtension}`;
    }
    const outputPath = `${outputDir.slice(1)}/${outputFileName}`;
    const existingFile = this.app.vault.getAbstractFileByPath(outputPath);
    if (existingFile instanceof import_obsidian4.TFile) {
      await this.app.vault.modify(existingFile, initialContent);
    } else {
      await this.app.vault.create(outputPath, initialContent);
    }
    return outputPath;
  }
  async saveConversionResult(fileData, markdown, suggestedFilename) {
    const { outputSettings } = this.settings;
    let outputDir = outputSettings.outputDir;
    if (!outputDir.startsWith("/")) {
      outputDir = "/" + outputDir;
    }
    const outputFolder = this.app.vault.getAbstractFileByPath(outputDir.slice(1));
    if (!outputFolder) {
      await this.app.vault.createFolder(outputDir.slice(1));
    }
    let outputFileName;
    if (outputSettings.keepOriginalName) {
      const baseName = fileData.name.replace(/\.[^/.]+$/, "");
      outputFileName = `${baseName}.${outputSettings.outputExtension}`;
    } else if (suggestedFilename) {
      outputFileName = suggestedFilename.endsWith(`.${outputSettings.outputExtension}`) ? suggestedFilename : `${suggestedFilename}.${outputSettings.outputExtension}`;
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      outputFileName = `converted-${timestamp}.${outputSettings.outputExtension}`;
    }
    const outputPath = `${outputDir.slice(1)}/${outputFileName}`;
    const existingFile = this.app.vault.getAbstractFileByPath(outputPath);
    if (existingFile instanceof import_obsidian4.TFile) {
      await this.app.vault.modify(existingFile, markdown);
    } else {
      await this.app.vault.create(outputPath, markdown);
    }
    if (outputSettings.autoOpen) {
      const newFile = this.app.vault.getAbstractFileByPath(outputPath);
      if (newFile instanceof import_obsidian4.TFile) {
        await this.app.workspace.openLinkText(newFile.path, "", true);
      }
    }
    return outputPath;
  }
  validateConfig() {
    return this.aiService.validateConfig();
  }
  static getSupportedFileTypes() {
    return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".pdf"];
  }
  static isFileSupported(filePath) {
    return FileProcessor.isFileSupported(filePath);
  }
};

// src/conversion-modal.ts
var ConversionModal = class extends import_obsidian5.Modal {
  plugin;
  selectedFiles = [];
  fileCheckboxes = /* @__PURE__ */ new Map();
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("hand-markdown-ai-modal");
    contentEl.createEl("h2", {
      text: "\u8F6C\u6362\u624B\u5199\u7B14\u8BB0",
      cls: "modal-title"
    });
    const descEl = contentEl.createEl("p", {
      text: "\u9009\u62E9\u8981\u8F6C\u6362\u7684\u624B\u5199\u7B14\u8BB0\u6587\u4EF6\uFF08\u652F\u6301PNG\u3001JPG\u3001JPEG\u3001PDF\u7B49\u683C\u5F0F\uFF09",
      cls: "modal-description"
    });
    const supportedFiles = this.getSupportedFiles();
    if (supportedFiles.length === 0) {
      const noFilesEl = contentEl.createEl("div", {
        text: "\u672A\u627E\u5230\u652F\u6301\u7684\u6587\u4EF6\u3002\u8BF7\u786E\u4FDDvault\u4E2D\u6709PNG\u3001JPG\u3001JPEG\u6216PDF\u683C\u5F0F\u7684\u6587\u4EF6\u3002",
        cls: "no-files-message"
      });
      const closeButton = contentEl.createEl("button", {
        text: "\u5173\u95ED",
        cls: "mod-cancel"
      });
      closeButton.onclick = () => {
        this.close();
      };
      return;
    }
    const fileListContainer = contentEl.createDiv();
    fileListContainer.addClass("file-list-container");
    const selectAllContainer = fileListContainer.createDiv();
    selectAllContainer.addClass("select-all-container");
    const selectAllCheckbox = selectAllContainer.createEl("input", {
      type: "checkbox",
      cls: "select-all-checkbox"
    });
    const selectAllLabel = selectAllContainer.createEl("label", {
      text: "\u5168\u9009",
      cls: "select-all-label"
    });
    selectAllCheckbox.addEventListener("change", () => {
      const isChecked = selectAllCheckbox.checked;
      this.fileCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      this.updateSelectedFiles();
    });
    const fileList = fileListContainer.createDiv();
    fileList.addClass("file-list");
    supportedFiles.forEach((file) => {
      const fileItem = fileList.createDiv();
      fileItem.addClass("file-item");
      const checkbox = fileItem.createEl("input", {
        type: "checkbox",
        cls: "file-checkbox"
      });
      const fileName = fileItem.createEl("label", {
        text: file.path,
        cls: "file-name"
      });
      const fileSize = fileItem.createEl("span", {
        text: this.formatFileSize(file.stat.size),
        cls: "file-size"
      });
      this.fileCheckboxes.set(file.path, checkbox);
      checkbox.addEventListener("change", () => {
        this.updateSelectedFiles();
        this.updateSelectAllState();
      });
    });
    const statsEl = contentEl.createDiv();
    statsEl.addClass("file-stats");
    statsEl.textContent = `\u5DF2\u9009\u62E9 ${this.selectedFiles.length} / ${supportedFiles.length} \u4E2A\u6587\u4EF6`;
    const buttonContainer = contentEl.createDiv();
    buttonContainer.addClass("modal-button-container");
    const cancelButton = buttonContainer.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "mod-cancel"
    });
    cancelButton.onclick = () => {
      this.close();
    };
    const convertButton = buttonContainer.createEl("button", {
      text: "\u5F00\u59CB\u8F6C\u6362",
      cls: "mod-cta"
    });
    convertButton.onclick = async () => {
      if (this.selectedFiles.length === 0) {
        new import_obsidian5.Notice("\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6", 3e3);
        return;
      }
      this.close();
      const filePaths = this.selectedFiles.map((file) => file.path);
      await this.plugin.convertFiles(filePaths);
    };
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.fileCheckboxes.clear();
  }
  /**
   * 更新选中的文件列表
   */
  updateSelectedFiles() {
    this.selectedFiles = [];
    this.fileCheckboxes.forEach((checkbox, filePath) => {
      if (checkbox.checked) {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof import_obsidian5.TFile) {
          this.selectedFiles.push(file);
        }
      }
    });
    const statsEl = this.contentEl.querySelector(".file-stats");
    if (statsEl) {
      const supportedFiles = this.getSupportedFiles();
      statsEl.textContent = `\u5DF2\u9009\u62E9 ${this.selectedFiles.length} / ${supportedFiles.length} \u4E2A\u6587\u4EF6`;
    }
  }
  /**
   * 更新全选复选框状态
   */
  updateSelectAllState() {
    const selectAllCheckbox = this.contentEl.querySelector(
      ".select-all-checkbox"
    );
    if (selectAllCheckbox) {
      const allChecked = Array.from(this.fileCheckboxes.values()).every(
        (checkbox) => checkbox.checked
      );
      const someChecked = Array.from(this.fileCheckboxes.values()).some(
        (checkbox) => checkbox.checked
      );
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
  }
  /**
   * 获取支持的文件列表
   */
  getSupportedFiles() {
    const files = [];
    this.app.vault.getFiles().forEach((file) => {
      if (ConversionService.isFileSupported(file.path)) {
        files.push(file);
      }
    });
    files.sort((a, b) => a.path.localeCompare(b.path));
    return files;
  }
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0)
      return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
};

// src/main.ts
init_defaults();

// src/ui/simple-settings-tab.ts
var import_obsidian6 = require("obsidian");
init_constants();
var SimpleSettingsTab = class extends import_obsidian6.PluginSettingTab {
  plugin;
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    this.ensureCurrentModelValid();
    this.addHeader(containerEl);
    this.addProviderSection(containerEl);
    this.addModelSection(containerEl);
    this.addPdfSettings(containerEl);
    this.addOutputSettings(containerEl);
    this.addPromptSettings(containerEl);
    this.addAdvancedOptions(containerEl);
    this.addFooter(containerEl);
  }
  addHeader(containerEl) {
    containerEl.createEl("h2", { text: "Hand Markdown AI" });
    containerEl.createEl("p", {
      text: "\u5C06 PDF \u548C\u624B\u5199\u7B14\u8BB0\u8F6C\u6362\u4E3A Markdown \u683C\u5F0F",
      attr: { style: "color: var(--text-muted); margin-bottom: 20px;" }
    });
    const statusDiv = containerEl.createDiv({ attr: { style: "margin-bottom: 20px;" } });
    const currentModel = this.plugin.settings.currentModel;
    const modelConfig = this.plugin.settings.models[currentModel];
    const provider = modelConfig ? this.plugin.settings.providers[modelConfig.provider] : null;
    const hasApiKey = provider?.apiKey?.trim();
    if (hasApiKey) {
      statusDiv.innerHTML = `
                <div style="padding: 12px; background: #d4edda; color: #155724; border-radius: 6px; border: 1px solid #c3e6cb;">
                    \u2705 <strong>\u5C31\u7EEA</strong> - \u4F7F\u7528 ${modelConfig?.name || currentModel}
                    <br><small>\u53F3\u952E PDF \u2192 "\u8F6C\u6362\u4E3AMarkdown"</small>
                </div>
            `;
    } else {
      statusDiv.innerHTML = `
                <div style="padding: 12px; background: #fff3cd; color: #856404; border-radius: 6px; border: 1px solid #ffeaa7;">
                    \u26A0\uFE0F <strong>\u9700\u8981\u914D\u7F6E</strong> - \u8BF7\u5148\u586B\u5199 API Key
                </div>
            `;
    }
    containerEl.createEl("hr");
  }
  addProviderSection(containerEl) {
    containerEl.createEl("h3", { text: "\u{1F310} \u63D0\u4F9B\u5546" });
    const table = containerEl.createEl("table", { attr: { style: "width: 100%; border-collapse: collapse; margin-top: 6px;" } });
    const thead = table.createEl("thead").createEl("tr");
    ["ID", "Type", "Base URL", "API Key", "\u542F\u7528", "\u64CD\u4F5C"].forEach((text) => {
      thead.createEl("th", { text, attr: { style: "text-align: left; padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);" } });
    });
    const tbody = table.createEl("tbody");
    Object.entries(this.plugin.settings.providers).forEach(([id, provider]) => {
      const row = tbody.createEl("tr");
      const cellStyle = "padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);";
      row.createEl("td", { text: id, attr: { style: cellStyle } });
      row.createEl("td", { text: provider.type || "openai", attr: { style: cellStyle } });
      row.createEl("td", { text: provider.baseUrl || "-", attr: { style: cellStyle } });
      row.createEl("td", { text: provider.apiKey ? "\u2022\u2022\u2022\u2022" : "\u672A\u914D\u7F6E", attr: { style: cellStyle + " color: var(--text-muted);" } });
      const enabledCell = row.createEl("td", { attr: { style: cellStyle } });
      const toggle = enabledCell.createEl("input", { type: "checkbox" });
      toggle.checked = provider.enabled;
      toggle.onchange = async () => {
        provider.enabled = toggle.checked;
        await this.plugin.saveSettings();
      };
      const actionsCell = row.createEl("td", { attr: { style: cellStyle } });
      const editBtn = actionsCell.createEl("button", { text: "\u7F16\u8F91" });
      editBtn.onclick = () => this.showProviderModal("edit", id);
      const deleteBtn = actionsCell.createEl("button", { text: "\u5220\u9664", attr: { style: "margin-left: 6px;" } });
      deleteBtn.onclick = async () => {
        if (Object.keys(this.plugin.settings.providers).length <= 1) {
          new import_obsidian6.Notice("\u81F3\u5C11\u9700\u8981\u4FDD\u7559\u4E00\u4E2A\u63D0\u4F9B\u5546");
          return;
        }
        if (confirm(`\u786E\u5B9A\u5220\u9664\u63D0\u4F9B\u5546 ${id} \uFF1F\u5C06\u540C\u65F6\u79FB\u9664\u5176\u4E0B\u7684\u6A21\u578B\u3002`)) {
          Object.entries(this.plugin.settings.models).forEach(([modelId, model]) => {
            if (model.provider === id) {
              delete this.plugin.settings.models[modelId];
            }
          });
          delete this.plugin.settings.providers[id];
          this.ensureCurrentModelValid();
          await this.plugin.saveSettings();
          this.display();
        }
      };
    });
    const addBtnWrap = containerEl.createDiv({ attr: { style: "margin-top: 10px;" } });
    const addBtn = addBtnWrap.createEl("button", { text: "+ \u6DFB\u52A0\u63D0\u4F9B\u5546" });
    addBtn.onclick = () => this.showProviderModal("add");
    containerEl.createEl("hr");
  }
  addModelSection(containerEl) {
    containerEl.createEl("h3", { text: "\u{1F916} \u6A21\u578B" });
    const header = containerEl.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center;" } });
    const addBtn = header.createEl("button", { text: "+ \u6DFB\u52A0\u6A21\u578B" });
    addBtn.onclick = () => this.showModelModal("add");
    const table = containerEl.createEl("table", { attr: { style: "width: 100%; border-collapse: collapse; margin-top: 8px;" } });
    const thead = table.createEl("thead").createEl("tr");
    ["ID", "\u540D\u79F0", "Provider", "Model", "\u7C7B\u522B", "\u542F\u7528", "\u64CD\u4F5C"].forEach((text) => {
      thead.createEl("th", { text, attr: { style: "text-align: left; padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);" } });
    });
    const tbody = table.createEl("tbody");
    const allModels = Object.values(this.plugin.settings.models);
    if (allModels.length === 0) {
      const row = tbody.createEl("tr");
      row.createEl("td", {
        text: "\u6682\u65E0\u6A21\u578B\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6DFB\u52A0",
        attr: { colspan: "7", style: "padding: 10px; text-align: center; color: var(--text-muted);" }
      });
    } else {
      allModels.forEach((model) => {
        const row = tbody.createEl("tr");
        const cellStyle = "padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);";
        row.createEl("td", { text: model.id, attr: { style: cellStyle } });
        row.createEl("td", { text: model.name, attr: { style: cellStyle } });
        row.createEl("td", { text: model.provider, attr: { style: cellStyle } });
        row.createEl("td", { text: model.model, attr: { style: cellStyle } });
        row.createEl("td", { text: model.category, attr: { style: cellStyle } });
        const enabledCell = row.createEl("td", { attr: { style: cellStyle } });
        const toggle = enabledCell.createEl("input", { type: "checkbox" });
        toggle.checked = model.enabled;
        toggle.onchange = async () => {
          model.enabled = toggle.checked;
          await this.plugin.saveSettings();
          this.ensureCurrentModelValid();
          this.display();
        };
        const actionsCell = row.createEl("td", { attr: { style: cellStyle } });
        const editBtn = actionsCell.createEl("button", { text: "\u7F16\u8F91" });
        editBtn.onclick = () => this.showModelModal("edit", model.id);
        const deleteBtn = actionsCell.createEl("button", { text: "\u5220\u9664", attr: { style: "margin-left: 6px;" } });
        deleteBtn.onclick = async () => {
          if (confirm(`\u786E\u5B9A\u5220\u9664\u6A21\u578B ${model.name} \uFF1F`)) {
            delete this.plugin.settings.models[model.id];
            this.ensureCurrentModelValid();
            await this.plugin.saveSettings();
            this.display();
          }
        };
      });
    }
    new import_obsidian6.Setting(containerEl).setName("\u5F53\u524D\u6A21\u578B").setDesc("\u9009\u62E9\u7528\u4E8E\u8F6C\u6362\u7684\u6A21\u578B").addDropdown((dropdown) => {
      const enabledModels = Object.entries(this.plugin.settings.models).filter(([_, config]) => config.enabled);
      enabledModels.forEach(([id, config]) => {
        dropdown.addOption(id, `${config.name} (${config.provider})`);
      });
      const current = this.plugin.settings.currentModel;
      const hasCurrent = enabledModels.some(([id]) => id === current);
      const selected = hasCurrent ? current : enabledModels[0]?.[0] || "";
      if (!hasCurrent && selected) {
        this.plugin.settings.currentModel = selected;
        this.plugin.saveSettings();
      }
      dropdown.setValue(selected).onChange(async (value) => {
        this.plugin.settings.currentModel = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    containerEl.createEl("hr");
  }
  showProviderModal(mode, providerId) {
    const modal = new import_obsidian6.Modal(this.app);
    modal.titleEl.setText(mode === "add" ? "\u6DFB\u52A0\u63D0\u4F9B\u5546" : `\u7F16\u8F91\u63D0\u4F9B\u5546 ${providerId}`);
    const content = modal.contentEl.createDiv({ attr: { style: "display: flex; flex-direction: column; gap: 12px;" } });
    const provider = providerId ? this.plugin.settings.providers[providerId] : { apiKey: "", baseUrl: "", enabled: true, type: "openai", name: "" };
    let idValue = providerId || "";
    const idInput = new import_obsidian6.Setting(content).setName("ID").setDesc("\u7528\u4E8E\u5F15\u7528\u7684\u552F\u4E00\u6807\u8BC6").addText((text) => {
      text.setPlaceholder("my-provider").setValue(idValue).onChange((value) => idValue = value.trim());
      if (mode === "edit")
        text.setDisabled(true);
    });
    new import_obsidian6.Setting(content).setName("\u663E\u793A\u540D\u79F0").addText(
      (text) => text.setPlaceholder("OpenAI").setValue(provider.name || "").onChange((value) => provider.name = value.trim())
    );
    new import_obsidian6.Setting(content).setName("\u7C7B\u578B").setDesc("openai \u517C\u5BB9\u7C7B\u578B\u6807\u8BC6").addText(
      (text) => text.setPlaceholder("openai").setValue(provider.type || "openai").onChange((value) => provider.type = value.trim() || "openai")
    );
    new import_obsidian6.Setting(content).setName("Base URL").setDesc("\u53EF\u9009\uFF0COpenAI \u517C\u5BB9\u63A5\u53E3\u5730\u5740").addText(
      (text) => text.setPlaceholder("https://api.openai.com/v1").setValue(provider.baseUrl || "").onChange((value) => provider.baseUrl = value.trim())
    );
    new import_obsidian6.Setting(content).setName("API Key").addText((text) => {
      text.inputEl.type = "password";
      text.setPlaceholder("sk-...").setValue(provider.apiKey || "").onChange((value) => provider.apiKey = value.trim());
    });
    new import_obsidian6.Setting(content).setName("\u542F\u7528").addToggle(
      (toggle) => toggle.setValue(provider.enabled).onChange((value) => provider.enabled = value)
    );
    const footer = modal.contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;" } });
    const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88" });
    cancelBtn.onclick = () => modal.close();
    const saveBtn = footer.createEl("button", { text: "\u4FDD\u5B58" });
    saveBtn.onclick = async () => {
      if (!idValue) {
        new import_obsidian6.Notice("ID \u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (mode === "add" && this.plugin.settings.providers[idValue]) {
        new import_obsidian6.Notice("ID \u5DF2\u5B58\u5728");
        return;
      }
      if (mode === "add") {
        this.plugin.settings.providers[idValue] = provider;
      } else if (providerId) {
        this.plugin.settings.providers[providerId] = provider;
      }
      await this.plugin.saveSettings();
      this.display();
      modal.close();
    };
    modal.open();
  }
  showModelModal(mode, modelId) {
    const modal = new import_obsidian6.Modal(this.app);
    modal.titleEl.setText(mode === "add" ? "\u6DFB\u52A0\u6A21\u578B" : `\u7F16\u8F91\u6A21\u578B ${modelId}`);
    const content = modal.contentEl.createDiv({ attr: { style: "display: flex; flex-direction: column; gap: 12px;" } });
    const model = modelId ? { ...this.plugin.settings.models[modelId] } : {
      id: "",
      name: "",
      provider: Object.keys(this.plugin.settings.providers)[0] || "openai",
      model: "",
      enabled: true,
      category: MODEL_CATEGORIES.TEXT
    };
    let idValue = model.id;
    new import_obsidian6.Setting(content).setName("ID").setDesc("\u552F\u4E00\u6807\u8BC6\uFF0C\u5EFA\u8BAE\u4F7F\u7528\u5C0F\u5199\u548C\u77ED\u6A2A\u7EBF").addText((text) => {
      text.setPlaceholder("gpt-4o-mini").setValue(idValue).onChange((value) => idValue = value.trim());
      if (mode === "edit")
        text.setDisabled(true);
    });
    new import_obsidian6.Setting(content).setName("\u663E\u793A\u540D\u79F0").addText(
      (text) => text.setPlaceholder("GPT-4o Mini").setValue(model.name).onChange((value) => model.name = value.trim())
    );
    new import_obsidian6.Setting(content).setName("Provider").addDropdown((drop) => {
      Object.keys(this.plugin.settings.providers).forEach((pid) => drop.addOption(pid, pid));
      drop.setValue(model.provider).onChange((value) => model.provider = value);
    });
    new import_obsidian6.Setting(content).setName("Model").setDesc("API \u6A21\u578B\u540D\u79F0\uFF0C\u4F8B\u5982 gpt-4o-mini").addText(
      (text) => text.setPlaceholder("gpt-4o-mini").setValue(model.model).onChange((value) => model.model = value.trim())
    );
    new import_obsidian6.Setting(content).setName("\u7C7B\u522B").addDropdown((drop) => {
      Object.entries(MODEL_CATEGORIES).forEach(([key, value]) => drop.addOption(String(value), key));
      drop.setValue(String(model.category)).onChange((value) => model.category = value);
    });
    new import_obsidian6.Setting(content).setName("\u542F\u7528").addToggle(
      (toggle) => toggle.setValue(model.enabled).onChange((value) => model.enabled = value)
    );
    const footer = modal.contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;" } });
    footer.createEl("button", { text: "\u53D6\u6D88" }).onclick = () => modal.close();
    footer.createEl("button", { text: "\u4FDD\u5B58" }).onclick = async () => {
      if (!idValue) {
        new import_obsidian6.Notice("\u6A21\u578B ID \u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (!model.name) {
        new import_obsidian6.Notice("\u6A21\u578B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (!model.model) {
        new import_obsidian6.Notice("Model \u5B57\u6BB5\u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (!this.plugin.settings.providers[model.provider]) {
        new import_obsidian6.Notice("\u8BF7\u9009\u62E9\u6709\u6548\u7684 Provider");
        return;
      }
      if (mode === "add" && this.plugin.settings.models[idValue]) {
        new import_obsidian6.Notice("\u6A21\u578B ID \u5DF2\u5B58\u5728");
        return;
      }
      const persisted = { ...model, id: idValue };
      this.plugin.settings.models[idValue] = persisted;
      this.ensureCurrentModelValid();
      await this.plugin.saveSettings();
      this.display();
      modal.close();
    };
    modal.open();
  }
  ensureCurrentModelValid() {
    const enabledModels = Object.entries(this.plugin.settings.models).filter(([_, m]) => m.enabled);
    const hasCurrent = enabledModels.some(([id]) => id === this.plugin.settings.currentModel);
    if (!hasCurrent) {
      this.plugin.settings.currentModel = enabledModels[0]?.[0] || "";
    }
  }
  addPdfSettings(containerEl) {
    containerEl.createEl("h3", { text: "\u{1F4C4} PDF \u5904\u7406" });
    new import_obsidian6.Setting(containerEl).setName("\u56FE\u7247\u8D28\u91CF").setDesc("PDF \u8F6C\u56FE\u7247\u7684\u8D28\u91CF\uFF080.1-1.0\uFF0C\u8D8A\u9AD8\u8D8A\u6E05\u6670\u4F46\u6587\u4EF6\u8D8A\u5927\uFF09").addSlider(
      (slider) => slider.setLimits(0.1, 1, 0.1).setValue(this.plugin.settings.advancedSettings?.pdfQuality || 0.8).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.advancedSettings.pdfQuality = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian6.Setting(containerEl).setName("\u56FE\u7247\u7F29\u653E").setDesc("PDF \u8F6C\u56FE\u7247\u7684\u7F29\u653E\u6BD4\u4F8B\uFF081.0-2.0\uFF0C\u8D8A\u9AD8\u8D8A\u6E05\u6670\uFF09").addSlider(
      (slider) => slider.setLimits(1, 2, 0.1).setValue(this.plugin.settings.advancedSettings?.pdfScale || 1.5).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.advancedSettings.pdfScale = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("hr");
  }
  addOutputSettings(containerEl) {
    containerEl.createEl("h3", { text: "\u{1F4BE} \u8F93\u51FA\u8BBE\u7F6E" });
    new import_obsidian6.Setting(containerEl).setName("\u8F93\u51FA\u76EE\u5F55").setDesc("\u8F6C\u6362\u540E\u7684\u6587\u4EF6\u4FDD\u5B58\u4F4D\u7F6E").addText(
      (text) => text.setPlaceholder("Converted").setValue(this.plugin.settings.outputSettings.outputDir).onChange(async (value) => {
        this.plugin.settings.outputSettings.outputDir = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian6.Setting(containerEl).setName("\u4FDD\u7559\u539F\u6587\u4EF6\u540D").setDesc("\u4F7F\u7528\u539F\u59CB PDF \u6587\u4EF6\u540D").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.outputSettings.keepOriginalName).onChange(async (value) => {
        this.plugin.settings.outputSettings.keepOriginalName = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian6.Setting(containerEl).setName("\u8F6C\u6362\u540E\u81EA\u52A8\u6253\u5F00").setDesc("\u8F6C\u6362\u5B8C\u6210\u540E\u7ACB\u5373\u6253\u5F00\u6587\u4EF6").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.outputSettings.autoOpen).onChange(async (value) => {
        this.plugin.settings.outputSettings.autoOpen = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("hr");
  }
  addPromptSettings(containerEl) {
    containerEl.createEl("h3", { text: "\u270D\uFE0F \u8F6C\u6362\u63D0\u793A\u8BCD" });
    const defaultPrompt = "Take the handwritten notes from this image and convert them into a clean, well-structured Markdown file. Pay attention to headings, lists, and any other formatting. Use latex for mathematical equations. For latex use the $$ syntax. Do not skip anything from the original text. Just give me the markdown, do not include other text in the response apart from the markdown file.";
    new import_obsidian6.Setting(containerEl).setName("\u81EA\u5B9A\u4E49\u63D0\u793A\u8BCD").setDesc("\u544A\u8BC9 AI \u5982\u4F55\u8F6C\u6362\u4F60\u7684\u7B14\u8BB0\uFF08\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\uFF09").addTextArea((text) => {
      text.setPlaceholder(defaultPrompt).setValue(this.plugin.settings.conversionPrompt || "").onChange(async (value) => {
        this.plugin.settings.conversionPrompt = value;
        await this.plugin.saveSettings();
      });
      text.inputEl.rows = 6;
      text.inputEl.style.width = "100%";
    });
    containerEl.createEl("hr");
  }
  addAdvancedOptions(containerEl) {
    const detailsEl = containerEl.createEl("details", {
      attr: { style: "margin: 20px 0;" }
    });
    detailsEl.createEl("summary", {
      text: "\u2699\uFE0F \u9AD8\u7EA7\u9009\u9879",
      attr: { style: "cursor: pointer; font-size: 1.1em; font-weight: 600; margin-bottom: 10px;" }
    });
    const contentDiv = detailsEl.createDiv({ attr: { style: "margin-top: 15px;" } });
    new import_obsidian6.Setting(contentDiv).setName("\u8BF7\u6C42\u8D85\u65F6\uFF08\u79D2\uFF09").setDesc("\u5355\u4E2A\u9875\u9762\u5904\u7406\u7684\u6700\u5927\u7B49\u5F85\u65F6\u95F4").addText(
      (text) => text.setPlaceholder("60").setValue(String(this.plugin.settings.advancedSettings.timeout / 1e3)).onChange(async (value) => {
        const seconds = parseInt(value);
        if (!isNaN(seconds) && seconds > 0) {
          this.plugin.settings.advancedSettings.timeout = seconds * 1e3;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian6.Setting(contentDiv).setName("\u6700\u5927 Token \u6570").setDesc("AI \u54CD\u5E94\u7684\u6700\u5927\u957F\u5EA6").addText(
      (text) => text.setPlaceholder("4096").setValue(String(this.plugin.settings.maxTokens)).onChange(async (value) => {
        const tokens = parseInt(value);
        if (!isNaN(tokens) && tokens > 0) {
          this.plugin.settings.maxTokens = tokens;
          await this.plugin.saveSettings();
        }
      })
    );
  }
  addFooter(containerEl) {
    containerEl.createEl("hr");
    const footerDiv = containerEl.createDiv({
      attr: { style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;" }
    });
    const testBtn = footerDiv.createEl("button", {
      text: "\u{1F9EA} \u6D4B\u8BD5\u914D\u7F6E",
      attr: {
        style: "padding: 8px 16px; border: 1px solid var(--interactive-accent); background: transparent; color: var(--interactive-accent); border-radius: 6px; cursor: pointer;"
      }
    });
    testBtn.onclick = () => this.testConfiguration();
    const resetBtn = footerDiv.createEl("button", {
      text: "\u{1F504} \u91CD\u7F6E\u8BBE\u7F6E",
      attr: {
        style: "padding: 8px 16px; border: 1px solid var(--text-error); background: transparent; color: var(--text-error); border-radius: 6px; cursor: pointer;"
      }
    });
    resetBtn.onclick = () => this.resetSettings();
    containerEl.createEl("p", {
      text: "Hand Markdown AI v1.0.0",
      attr: { style: "text-align: center; color: var(--text-muted); margin-top: 20px; font-size: 0.85em;" }
    });
  }
  async testConfiguration() {
    const currentModel = this.plugin.settings.currentModel;
    if (!currentModel) {
      new import_obsidian6.Notice("\u274C \u672A\u9009\u62E9\u6A21\u578B", 3e3);
      return;
    }
    const modelConfig = this.plugin.settings.models[currentModel];
    const provider = this.plugin.settings.providers[modelConfig?.provider];
    if (!provider?.apiKey) {
      new import_obsidian6.Notice("\u274C \u672A\u914D\u7F6E API Key", 3e3);
      return;
    }
    new import_obsidian6.Notice("\u{1F9EA} \u6B63\u5728\u6D4B\u8BD5\u914D\u7F6E...", 2e3);
    setTimeout(() => {
      new import_obsidian6.Notice("\u2705 \u914D\u7F6E\u6709\u6548\uFF01", 3e3);
    }, 1e3);
  }
  async resetSettings() {
    if (!confirm("\u786E\u5B9A\u8981\u91CD\u7F6E\u6240\u6709\u8BBE\u7F6E\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002")) {
      return;
    }
    const { DEFAULT_SETTINGS: DEFAULT_SETTINGS2 } = await Promise.resolve().then(() => (init_defaults(), defaults_exports));
    this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS2));
    await this.plugin.saveSettings();
    this.display();
    new import_obsidian6.Notice("\u2705 \u8BBE\u7F6E\u5DF2\u91CD\u7F6E", 3e3);
  }
};

// src/main.ts
var HandMarkdownAIPlugin = class extends import_obsidian7.Plugin {
  settings;
  conversionService;
  aiService;
  async onload() {
    console.log("\u52A0\u8F7D Hand Markdown AI \u63D2\u4EF6");
    await this.loadSettings();
    PDFProcessor.initWorker();
    this.aiService = new AIService(this.settings, this.app);
    this.conversionService = new ConversionService(this.app, this.settings);
    this.addSettingTab(new SimpleSettingsTab(this.app, this));
    this.registerCommands();
    this.registerContextMenu();
    this.addRibbonIcon("file-text", "\u8F6C\u6362\u624B\u5199\u7B14\u8BB0", () => {
      this.showConversionModal();
    });
    console.log("Hand Markdown AI \u63D2\u4EF6\u52A0\u8F7D\u5B8C\u6210");
  }
  onunload() {
    console.log("\u5378\u8F7D Hand Markdown AI \u63D2\u4EF6");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    if (this.conversionService) {
      this.conversionService.updateSettings(this.settings);
    }
    if (this.aiService) {
      this.aiService.updateSettings(this.settings);
    }
  }
  /**
   * 注册命令
   */
  registerCommands() {
    this.addCommand({
      id: "convert-single-file",
      name: "\u8F6C\u6362\u5355\u4E2A\u6587\u4EF6",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "C"
        }
      ],
      callback: () => {
        this.showConversionModal();
      }
    });
    this.addCommand({
      id: "convert-current-file",
      name: "\u8F6C\u6362\u5F53\u524D\u6587\u4EF6",
      hotkeys: [
        {
          modifiers: ["Mod", "Alt"],
          key: "C"
        }
      ],
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          return false;
        }
        if (!ConversionService.isFileSupported(activeFile.path)) {
          return false;
        }
        if (!checking) {
          this.convertFile(activeFile.path);
        }
        return true;
      }
    });
    this.addCommand({
      id: "convert-selected-files",
      name: "\u8F6C\u6362\u9009\u4E2D\u7684\u6587\u4EF6",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift", "Alt"],
          key: "C"
        }
      ],
      callback: () => {
        this.showFileSelectionModal();
      }
    });
    this.addCommand({
      id: "open-settings",
      name: "\u6253\u5F00\u8BBE\u7F6E",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: ","
        }
      ],
      callback: () => {
        this.openSettings();
      }
    });
    this.addCommand({
      id: "quick-convert-current",
      name: "\u5FEB\u901F\u8F6C\u6362\u5F53\u524D\u6587\u4EF6\uFF08\u65E0\u786E\u8BA4\uFF09",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "K"
        }
      ],
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          return false;
        }
        if (!ConversionService.isFileSupported(activeFile.path)) {
          return false;
        }
        if (!checking) {
          if (!this.conversionService.validateConfig()) {
            new import_obsidian7.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
            this.openSettings();
            return;
          }
          this.convertFile(activeFile.path);
        }
        return true;
      }
    });
    this.addCommand({
      id: "toggle-model",
      name: "\u5207\u6362AI\u6A21\u578B",
      callback: () => {
        this.toggleModel();
      }
    });
  }
  /**
   * 注册右键菜单
   */
  registerContextMenu() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof import_obsidian7.TFile && ConversionService.isFileSupported(file.path)) {
          menu.addItem((item) => {
            item.setTitle("\u8F6C\u6362\u4E3AMarkdown").setIcon("file-text").onClick(() => {
              this.convertFile(file.path);
            });
          });
        }
      })
    );
  }
  /**
   * 显示转换对话框
   */
  showConversionModal() {
    new ConversionModal(this.app, this).open();
  }
  /**
   * 显示文件选择对话框
   */
  showFileSelectionModal() {
    new ConversionModal(this.app, this).open();
  }
  /**
   * 转换文件
   * 
   * @param filePath 文件路径
   */
  async convertFile(filePath) {
    if (!this.conversionService.validateConfig()) {
      new import_obsidian7.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
      this.openSettings();
      return;
    }
    const result = await this.conversionService.convertFile(filePath);
    if (result.success) {
      new import_obsidian7.Notice(`\u8F6C\u6362\u6210\u529F\uFF01\u6587\u4EF6\u5DF2\u4FDD\u5B58\u5230: ${result.outputPath}`, 5e3);
    } else {
      new import_obsidian7.Notice(`\u8F6C\u6362\u5931\u8D25: ${result.error}`, 5e3);
    }
  }
  /**
   * 批量转换文件
   * 
   * @param filePaths 文件路径数组
   */
  async convertFiles(filePaths) {
    if (!this.conversionService.validateConfig()) {
      new import_obsidian7.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
      this.openSettings();
      return;
    }
    const supportedFiles = filePaths.filter(
      (path) => ConversionService.isFileSupported(path)
    );
    if (supportedFiles.length === 0) {
      new import_obsidian7.Notice("\u6CA1\u6709\u652F\u6301\u7684\u6587\u4EF6", 3e3);
      return;
    }
    const results = await this.conversionService.convertFiles(supportedFiles);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;
    new import_obsidian7.Notice(
      `\u6279\u91CF\u8F6C\u6362\u5B8C\u6210\uFF01\u6210\u529F: ${successCount}, \u5931\u8D25: ${failCount}`,
      5e3
    );
  }
  /**
   * 打开设置
   */
  openSettings() {
    new import_obsidian7.Notice("\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u627E\u5230 Hand Markdown AI \u63D2\u4EF6\u8FDB\u884C\u914D\u7F6E", 5e3);
  }
  toggleModel() {
    const enabledModels = Object.entries(this.settings.models).filter(([_, config]) => config.enabled).map(([id, _]) => id);
    if (enabledModels.length === 0) {
      new import_obsidian7.Notice("\u6CA1\u6709\u542F\u7528\u7684\u6A21\u578B\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E", 5e3);
      return;
    }
    const currentIndex = enabledModels.indexOf(this.settings.currentModel);
    const nextIndex = (currentIndex + 1) % enabledModels.length;
    const nextModel = enabledModels[nextIndex];
    this.settings.currentModel = nextModel;
    this.saveSettings();
    const modelName = this.settings.models[nextModel]?.name || nextModel;
    new import_obsidian7.Notice(`\u5DF2\u5207\u6362\u5230\u6A21\u578B: ${modelName}`, 3e3);
  }
};
