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
        autoOpen: true,
        contentAfterTitle: ""
        // 默认为空，不插入任何内容
      },
      advancedSettings: {
        timeout: 3e4,
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

// src/file-processor.ts
var file_processor_exports = {};
__export(file_processor_exports, {
  FileProcessor: () => FileProcessor
});
var import_obsidian, FileProcessor;
var init_file_processor = __esm({
  "src/file-processor.ts"() {
    import_obsidian = require("obsidian");
    init_defaults();
    FileProcessor = class {
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
        if (filePath.endsWith(".excalidraw.md")) {
          return ".excalidraw.md";
        }
        if (filePath.endsWith(".excalidraw")) {
          return ".excalidraw";
        }
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
      /**
       * 处理 Excalidraw 文件（新增方法）
       */
      static async processExcalidrawFile(filePath, app) {
        try {
          const arrayBuffer = await this.readFile(filePath, app);
          const textContent = new TextDecoder().decode(arrayBuffer);
          let excalidrawData;
          try {
            excalidrawData = JSON.parse(textContent);
          } catch (jsonError) {
            throw new Error("Excalidraw \u6587\u4EF6\u683C\u5F0F\u9519\u8BEF\uFF1A\u65E0\u6CD5\u89E3\u6790 JSON");
          }
          const pngBase64 = await this.renderExcalidrawToImage(excalidrawData);
          return {
            path: filePath,
            base64: pngBase64,
            mimeType: "image/png",
            // 关键：转为图片类型
            size: pngBase64.length,
            name: this.getFileName(filePath)
          };
        } catch (error) {
          throw new Error(`\u5904\u7406 Excalidraw \u6587\u4EF6\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      /**
       * 渲染 Excalidraw 为图片（新增方法）
       */
      static async renderExcalidrawToImage(excalidrawData, width = 1600, height = 1200) {
        return new Promise((resolve, reject) => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("\u65E0\u6CD5\u83B7\u53D6 Canvas \u4E0A\u4E0B\u6587");
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            const elements = excalidrawData.elements || [];
            if (elements.length === 0) {
              throw new Error("Excalidraw \u6587\u4EF6\u4E2D\u6CA1\u6709\u53EF\u6E32\u67D3\u7684\u5143\u7D20");
            }
            const bounds = this.calculateExcalidrawBounds(elements);
            const padding = 40;
            const scaleX = (width - padding * 2) / bounds.width;
            const scaleY = (height - padding * 2) / bounds.height;
            const scale = Math.min(scaleX, scaleY, 1);
            const offsetX = padding - bounds.minX * scale;
            const offsetY = padding - bounds.minY * scale;
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);
            this.drawExcalidrawElements(ctx, elements);
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error("Canvas \u8F6C\u6362\u5931\u8D25"));
                return;
              }
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result);
              };
              reader.onerror = () => {
                reject(new Error("\u8BFB\u53D6 Blob \u5931\u8D25"));
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
      static calculateExcalidrawBounds(elements) {
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
      static drawExcalidrawElements(ctx, elements) {
        elements.forEach((el) => {
          if (el.isDeleted)
            return;
          ctx.save();
          ctx.strokeStyle = el.strokeColor || "#000000";
          ctx.fillStyle = el.backgroundColor || "transparent";
          ctx.lineWidth = el.strokeWidth || 1;
          ctx.globalAlpha = (el.opacity !== void 0 ? el.opacity : 100) / 100;
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
                lines.forEach((line, i) => {
                  ctx.fillText(line, el.x, el.y + i * (el.fontSize || 20) * 1.2);
                });
                break;
            }
          } catch (error) {
            console.warn(`\u7ED8\u5236\u5143\u7D20\u5931\u8D25 (${el.type}):`, error);
          }
          ctx.restore();
        });
      }
      /**
       * 绘制箭头头部（新增辅助方法）
       */
      static drawArrowhead(ctx, el, points) {
        const lastIdx = points.length - 1;
        if (lastIdx < 1)
          return;
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
    };
  }
});

// src/ui/batch-progress-modal.ts
var batch_progress_modal_exports = {};
__export(batch_progress_modal_exports, {
  BatchProgressModal: () => BatchProgressModal
});
var import_obsidian8, BatchProgressModal;
var init_batch_progress_modal = __esm({
  "src/ui/batch-progress-modal.ts"() {
    import_obsidian8 = require("obsidian");
    BatchProgressModal = class extends import_obsidian8.Modal {
      barEl;
      textEl;
      statusEl;
      total = 0;
      constructor(app) {
        super(app);
        this.modalEl.addClass("hand-markdown-ai-batch-progress");
        this.titleEl.setText("\u6279\u91CF\u8F6C\u6362\u8FDB\u5EA6");
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        const container = contentEl.createDiv({ attr: { style: "min-width: 360px; padding: 10px;" } });
        const barWrap = container.createDiv({ attr: { style: "height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden;" } });
        this.barEl = barWrap.createDiv({ attr: { style: "height: 100%; width: 0%; background: var(--interactive-accent); transition: width 120ms ease;" } });
        this.textEl = container.createDiv({ attr: { style: "margin-top: 8px; font-size: 12px; opacity: .8;" } });
        this.textEl.setText("0/0");
        this.statusEl = container.createDiv({ attr: { style: "margin-top: 6px; font-size: 12px;" } });
      }
      setTotals(total) {
        this.total = Math.max(0, total);
        this.updateProgress(0);
      }
      updateProgress(done) {
        const total = this.total || 1;
        const pct = Math.min(100, Math.max(0, done / total * 100));
        if (this.barEl)
          this.barEl.style.width = pct.toFixed(2) + "%";
        if (this.textEl)
          this.textEl.setText(`${done}/${this.total}`);
      }
      setStatus(text) {
        if (this.statusEl)
          this.statusEl.setText(text);
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HandMarkdownAIPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian9 = require("obsidian");

// src/conversion-modal.ts
var import_obsidian6 = require("obsidian");

// src/conversion-service.ts
var import_obsidian5 = require("obsidian");
init_defaults();
init_file_processor();

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
  /**
   * 测试当前 Provider/Model 的 API 连接（对齐 Markdown-Next-AI）
   */
  async testConnection() {
    try {
      const config = this.getCurrentModelConfig();
      if (!config.apiKey || !config.apiKey.trim()) {
        return { success: false, message: "\u672A\u914D\u7F6E API Key" };
      }
      const url = this.buildApiUrl("/chat/completions");
      const response = await (0, import_obsidian2.requestUrl)({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        }),
        throw: false
      });
      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, message: `HTTP ${response.status}: ${response.text}` };
      }
    } catch (error) {
      return { success: false, message: error?.message || String(error) };
    }
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
  async sendRequest(mode, context, prompt2 = "", images = [], chatHistory = [], onStream = null) {
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
      return this.handleImageGeneration(prompt2, config, context.cursorPosition);
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

\u4FEE\u6539\u8981\u6C42\uFF1A${prompt2}`;
      } else {
        userPrompt = `\u4EE5\u4E0B\u662F\u5149\u6807\u524D\u7684\u4E0A\u4E0B\u6587\u5185\u5BB9\uFF1A
${context.beforeText}

\u8BF7\u4ECE\u5149\u6807\u4F4D\u7F6E\u5F00\u59CB\u7EED\u5199\uFF0C\u53EA\u751F\u6210\u65B0\u5185\u5BB9\uFF0C\u4E0D\u8981\u91CD\u590D\u4E0A\u8FF0\u5185\u5BB9\u3002\u7EED\u5199\u8981\u6C42\uFF1A${prompt2}`;
      }
    } else {
      userPrompt = `\u4E0A\u4E0B\u6587\uFF1A${context.beforeText}

\u9009\u4E2D\u6587\u672C\uFF1A${context.selectedText}

\u540E\u7EED\u5185\u5BB9\uFF1A${context.afterText}`;
      if (prompt2) {
        userPrompt += `

\u7279\u6B8A\u8981\u6C42\uFF1A${prompt2}`;
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
  async handleImageGeneration(prompt2, config, cursorPosition = null) {
    if (!prompt2 || !prompt2.trim()) {
      throw new Error("\u8BF7\u8F93\u5165\u56FE\u7247\u63CF\u8FF0");
    }
    const apiUrl = this.buildApiUrl("/images/generations");
    const model = config.model;
    const requestBody = {
      model,
      prompt: prompt2.trim(),
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
  async convertFile(fileData, prompt2, onStream) {
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
      const conversionPrompt = prompt2 || this.settings.conversionPrompt || SYSTEM_PROMPTS.convert;
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
   * 批量转换多张图片（单次请求发送多张 image_url）
   */
  async convertImageBatch(files, prompt2) {
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
        category = modelConfig.type === "image" ? MODEL_CATEGORIES.IMAGE : MODEL_CATEGORIES.TEXT;
      }
      const isMultimodal = category === MODEL_CATEGORIES.MULTIMODAL;
      const isVision = category === MODEL_CATEGORIES.VISION || this.isVisionModel(config.model);
      if (!isMultimodal && !isVision) {
        throw new Error(`\u5F53\u524D\u6A21\u578B ${config.model} \u4E0D\u652F\u6301\u56FE\u7247\u8BC6\u522B\uFF0C\u8BF7\u5207\u6362\u5230\u591A\u6A21\u6001\u6A21\u578B\u6216\u89C6\u89C9\u6A21\u578B`);
      }
      const conversionPrompt = prompt2 || this.settings.conversionPrompt || SYSTEM_PROMPTS.convert;
      const apiUrl = this.buildApiUrl("/chat/completions");
      const messages = [
        { role: "system", content: conversionPrompt }
      ];
      const content = [
        { type: "text", text: "\u8BF7\u5C06\u4EE5\u4E0B\u56FE\u7247\uFF08\u53EF\u80FD\u662F\u8FDE\u7EED\u9875\uFF09\u4E2D\u7684\u624B\u5199\u7B14\u8BB0\u5408\u5E76\u8F6C\u6362\u4E3A\u7ED3\u6784\u5316\u7684Markdown\u3002" }
      ];
      files.forEach((file) => {
        content.push({
          type: "image_url",
          image_url: { url: file.base64 }
        });
      });
      messages.push({ role: "user", content });
      const requestBody = {
        model: config.model,
        messages,
        temperature: 0.3,
        max_tokens: this.settings.maxTokens || 4096
      };
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
      const choice = data.choices?.[0];
      let contentText = "";
      if (choice?.message?.content) {
        contentText = choice.message.content.trim();
      } else if (choice?.text) {
        contentText = choice.text.trim();
      } else if (choice?.message?.text) {
        contentText = choice.message.text.trim();
      }
      const usage = data.usage || {};
      return {
        markdown: contentText,
        sourcePath: files[0]?.path || "",
        outputPath: "",
        provider: config.model,
        duration: Date.now() - startTime,
        success: true,
        modelId: currentModelId,
        modelName: modelConfig?.name || config.model,
        tokensUsed: usage.total_tokens
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        markdown: "",
        sourcePath: files[0]?.path || "",
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
  async convertFiles(fileDataList, prompt2, onProgress) {
    const results = [];
    const total = fileDataList.length;
    for (let i = 0; i < total; i++) {
      const fileData = fileDataList[i];
      if (onProgress) {
        onProgress(i + 1, total, fileData.name);
      }
      const result = await this.convertFile(fileData, prompt2);
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

// src/ui/progress-modal.ts
var import_obsidian3 = require("obsidian");
var ProgressModal = class extends import_obsidian3.Modal {
  titleElRef;
  renderBarEl;
  renderTextEl;
  aiBarEl;
  aiTextEl;
  statusEl;
  cancelBtnEl = null;
  cancelled = false;
  actionsEl = null;
  minimizeBtnEl = null;
  // 浮动非阻塞状态
  overlayEl = null;
  overlayRenderBarEl = null;
  overlayAiBarEl = null;
  overlayTextEl = null;
  overlayCancelBtnEl = null;
  isMinimized = false;
  totalPages = 0;
  totalJobs = 0;
  // 保存当前进度，防止还原时刷新
  currentRenderProgress = 0;
  currentAIProgress = 0;
  currentStatus = "\u521D\u59CB\u5316...";
  constructor(app) {
    super(app);
    this.modalEl.addClass("hand-markdown-ai-progress-modal");
    this.titleEl.setText("\u6B63\u5728\u8F6C\u6362 PDF \u2192 Markdown");
    this.titleElRef = this.titleEl;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const container = contentEl.createDiv({
      attr: { style: "min-width: 420px; padding: 6px;" }
    });
    container.createEl("h4", { text: "PDF \u6E32\u67D3\u8FDB\u5EA6" });
    const renderBar = container.createDiv({
      attr: { style: "height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden;" }
    });
    this.renderBarEl = renderBar.createDiv({
      attr: { style: "height: 100%; width: 0%; background: var(--interactive-accent); transition: width 120ms ease;" }
    });
    this.renderTextEl = container.createDiv({
      attr: { style: "margin-top: 6px; font-size: 12px; opacity: 0.8;" }
    });
    container.createEl("h4", { text: "AI \u8F6C\u6362\u8FDB\u5EA6" });
    const aiBar = container.createDiv({
      attr: { style: "height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden;" }
    });
    this.aiBarEl = aiBar.createDiv({
      attr: { style: "height: 100%; width: 0%; background: var(--text-accent); transition: width 120ms ease;" }
    });
    this.aiTextEl = container.createDiv({
      attr: { style: "margin-top: 6px; font-size: 12px; opacity: 0.8;" }
    });
    this.statusEl = container.createDiv({
      attr: { style: "margin-top: 10px; font-size: 12px;" }
    });
    this.statusEl.setText("\u521D\u59CB\u5316...");
    this.actionsEl = container.createDiv({ attr: { style: "display:flex; justify-content:flex-end; gap:8px; margin-top:12px;" } });
    this.cancelBtnEl = this.actionsEl.createEl("button", { text: "\u53D6\u6D88" });
    this.cancelBtnEl.onclick = () => {
      this.cancelled = true;
      this.setStatus("\u5DF2\u8BF7\u6C42\u53D6\u6D88\uFF0C\u6B63\u5728\u505C\u6B62...");
    };
    this.minimizeBtnEl = this.actionsEl.createEl("button", { text: "\u6700\u5C0F\u5316" });
    this.minimizeBtnEl.onclick = () => {
      this.minimize();
    };
  }
  setTotals(totalPages, totalJobs) {
    this.totalPages = Math.max(0, totalPages);
    this.totalJobs = Math.max(0, totalJobs);
    this.updateRenderProgress(0);
    this.updateAIProgress(0);
  }
  updateRenderProgress(donePages) {
    this.currentRenderProgress = donePages;
    const total = this.totalPages || 1;
    const pct = Math.min(100, Math.max(0, donePages / total * 100));
    if (this.renderBarEl)
      this.renderBarEl.style.width = pct.toFixed(2) + "%";
    if (this.renderTextEl)
      this.renderTextEl.setText(`\u5DF2\u6E32\u67D3 ${donePages}/${this.totalPages} \u9875`);
    if (this.overlayRenderBarEl)
      this.overlayRenderBarEl.style.width = pct.toFixed(2) + "%";
  }
  updateAIProgress(doneJobs) {
    this.currentAIProgress = doneJobs;
    const total = this.totalJobs || 1;
    const pct = Math.min(100, Math.max(0, doneJobs / total * 100));
    if (this.aiBarEl)
      this.aiBarEl.style.width = pct.toFixed(2) + "%";
    if (this.aiTextEl)
      this.aiTextEl.setText(`\u5DF2\u5B8C\u6210\u6279\u6B21 ${doneJobs}/${this.totalJobs}`);
    if (this.overlayAiBarEl)
      this.overlayAiBarEl.style.width = pct.toFixed(2) + "%";
  }
  setStatus(text) {
    this.currentStatus = text;
    if (this.statusEl)
      this.statusEl.setText(text);
    if (this.overlayTextEl && this.isMinimized) {
      this.overlayTextEl.setText(text);
    }
  }
  isCancelled() {
    return this.cancelled;
  }
  /**
   * 在完成后提供操作按钮：重试失败页、重试指定页、关闭
   */
  showCompletionActions(actions) {
    if (!this.actionsEl)
      return;
    if (this.cancelBtnEl) {
      this.cancelBtnEl.disabled = true;
      this.cancelBtnEl.textContent = "\u5DF2\u5B8C\u6210";
    }
    const retryAllBtn = this.actionsEl.createEl("button", { text: "\u91CD\u8BD5\u5931\u8D25\u9875" });
    retryAllBtn.onclick = async () => {
      try {
        await actions.onRetryAll?.();
      } catch (e) {
      }
    };
    const singleWrap = this.actionsEl.createDiv({ attr: { style: "display:flex; align-items:center; gap:6px;" } });
    const singleInput = singleWrap.createEl("input", { attr: { type: "number", min: "1", placeholder: "\u9875\u7801" } });
    const retrySingleBtn = singleWrap.createEl("button", { text: "\u91CD\u8BD5\u6307\u5B9A\u9875" });
    retrySingleBtn.onclick = async () => {
      const n = parseInt(singleInput.value);
      if (!isNaN(n) && n > 0) {
        try {
          await actions.onRetrySingle?.(n);
        } catch (e) {
        }
      }
    };
    const closeBtn = this.actionsEl.createEl("button", { text: "\u5173\u95ED" });
    closeBtn.onclick = async () => {
      try {
        await actions.onClose?.();
      } finally {
        this.close();
      }
    };
  }
  /** 将进度窗口最小化为右下角浮动面板（不阻塞操作） */
  minimize() {
    if (this.isMinimized)
      return;
    this.isMinimized = true;
    try {
      super.close();
    } catch (_) {
    }
    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "hand-markdown-ai-progress-overlay";
    this.overlayEl.setAttr(
      "style",
      "position:fixed; right:16px; bottom:16px; z-index:9999;background: var(--background-primary); box-shadow: var(--shadow-s);border: 1px solid var(--background-modifier-border); border-radius: 8px;padding: 10px; width: 280px;"
    );
    const title = this.overlayEl.createEl("div", { text: "PDF \u2192 Markdown \u8FDB\u5EA6", attr: { style: "font-weight:600; margin-bottom:6px;" } });
    const rLabel = this.overlayEl.createEl("div", { text: "\u6E32\u67D3", attr: { style: "font-size:12px; opacity:.8;" } });
    const rBar = this.overlayEl.createDiv({ attr: { style: "height:8px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden; margin-top:4px;" } });
    this.overlayRenderBarEl = rBar.createDiv({ attr: { style: "height:100%; width:0%; background: var(--interactive-accent); transition: width 120ms ease;" } });
    const aLabel = this.overlayEl.createEl("div", { text: "AI", attr: { style: "font-size:12px; opacity:.8; margin-top:8px;" } });
    const aBar = this.overlayEl.createDiv({ attr: { style: "height:8px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden; margin-top:4px;" } });
    this.overlayAiBarEl = aBar.createDiv({ attr: { style: "height:100%; width:0%; background: var(--text-accent); transition: width 120ms ease;" } });
    this.overlayTextEl = this.overlayEl.createEl("div", { text: "\u5904\u7406\u4E2D...", attr: { style: "margin-top:6px; font-size:12px;" } });
    const row = this.overlayEl.createDiv({ attr: { style: "display:flex; justify-content:flex-end; gap:6px; margin-top:8px;" } });
    this.overlayCancelBtnEl = row.createEl("button", { text: "\u53D6\u6D88" });
    this.overlayCancelBtnEl.onclick = () => {
      this.cancelled = true;
      this.setStatus("\u5DF2\u8BF7\u6C42\u53D6\u6D88\uFF0C\u6B63\u5728\u505C\u6B62...");
    };
    const restoreBtn = row.createEl("button", { text: "\u8FD8\u539F" });
    restoreBtn.onclick = () => this.restore();
    document.body.appendChild(this.overlayEl);
  }
  /** 还原为模态窗口 */
  restore() {
    if (!this.isMinimized)
      return;
    this.isMinimized = false;
    if (this.overlayEl && this.overlayEl.parentElement) {
      this.overlayEl.parentElement.removeChild(this.overlayEl);
    }
    this.overlayEl = null;
    this.overlayRenderBarEl = null;
    this.overlayAiBarEl = null;
    this.overlayTextEl = null;
    this.overlayCancelBtnEl = null;
    try {
      super.open();
    } catch (_) {
    }
    this.updateRenderProgress(this.currentRenderProgress);
    this.updateAIProgress(this.currentAIProgress);
    this.setStatus(this.currentStatus);
  }
  /** 重载 close：确保浮动面板也被移除 */
  close() {
    if (this.overlayEl && this.overlayEl.parentElement) {
      this.overlayEl.parentElement.removeChild(this.overlayEl);
    }
    this.overlayEl = null;
    super.close();
  }
};

// src/utils/pdf-processor.ts
var import_obsidian4 = require("obsidian");
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
      new import_obsidian4.Notice("PDF \u529F\u80FD\u4E0D\u53EF\u7528\uFF0C\u8BF7\u66F4\u65B0 Obsidian \u7248\u672C", 5e3);
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
      new import_obsidian4.Notice(`\u5F00\u59CB\u5904\u7406 PDF\uFF0C\u5171 ${totalPages} \u9875`, 2e3);
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (onCancel?.()) {
          new import_obsidian4.Notice("\u8F6C\u6362\u5DF2\u53D6\u6D88", 2e3);
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
          new import_obsidian4.Notice(`\u26A0\uFE0F \u7B2C ${pageNum} \u9875\u5904\u7406\u5931\u8D25\uFF0C\u8DF3\u8FC7\u8BE5\u9875`, 3e3);
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
   * 公共方法：转换指定页为 Base64 图片
   */
  static async convertSinglePageToImage(buffer, pageNum, options = {}) {
    this.initWorker();
    const {
      scale = 1.5,
      quality = 0.8,
      format = "jpeg",
      timeoutPerPage = 2e4
    } = options;
    const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const pagePromise = this.renderPageToBase64(pdf, pageNum, scale, quality, format);
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error(`\u7B2C ${pageNum} \u9875\u8D85\u65F6`)), timeoutPerPage)
    );
    const base64 = await Promise.race([pagePromise, timeoutPromise]);
    return base64;
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
    let progressModal = null;
    try {
      const mimeType = FileProcessor.getFileMimeType(filePath);
      if (mimeType === "application/pdf") {
        return await this.convertPdfStream(filePath, startTime);
      } else {
        return await this.convertSingleImage(filePath, startTime);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      new import_obsidian5.Notice(`\u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
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
      const prompt2 = this.getConversionPrompt();
      new import_obsidian5.Notice(`\u6B63\u5728\u4F7F\u7528 AI \u8F6C\u6362\u6587\u4EF6...`, 3e3);
      const conversionResult = await this.aiService.convertFile(fileData, prompt2);
      const outputPath = await this.saveConversionResult(
        fileData,
        conversionResult.markdown,
        this.extractSuggestedFilename(conversionResult.markdown)
      );
      new import_obsidian5.Notice(`\u8F6C\u6362\u6210\u529F\uFF01\u8017\u65F6: ${conversionResult.duration}ms`, 3e3);
      return {
        ...conversionResult,
        outputPath,
        sourcePath: filePath
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      new import_obsidian5.Notice(`\u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
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
    const CONCURRENCY_LIMIT = this.settings.advancedSettings?.concurrencyLimit ?? 2;
    const RETRY_ATTEMPTS = this.settings.advancedSettings?.retryAttempts ?? 2;
    const RETRY_BASE_DELAY_MS = 1200;
    let progressModal = null;
    try {
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!file) {
        throw new Error(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${filePath}`);
      }
      const arrayBuffer = await this.app.vault.readBinary(file);
      const bufferForInfo = arrayBuffer.slice(0);
      const pdfInfo = await PDFProcessor.getPdfInfo(bufferForInfo);
      totalPages = pdfInfo.numPages;
      new import_obsidian5.Notice(`\u5F00\u59CB\u5904\u7406 PDF\uFF0C\u5171 ${totalPages} \u9875`, 3e3);
      progressModal = new ProgressModal(this.app);
      progressModal.open();
      progressModal.setTotals(totalPages, 0);
      if (this.settings.advancedSettings?.autoMinimizeProgress) {
        progressModal.minimize();
      }
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
${this.settings.outputSettings.contentAfterTitle ? "\n" + this.settings.outputSettings.contentAfterTitle + "\n\n" : "\n"}`
      );
      outputFile = this.app.vault.getAbstractFileByPath(outputPath);
      await this.app.workspace.openLinkText(outputFile.path, "", true);
      const prompt2 = this.getConversionPrompt();
      const batchSize = this.settings.advancedSettings?.imagesPerRequest || 1;
      let batchImages = [];
      let jobCounter = 0;
      let totalJobs = 0;
      const jobQueue = [];
      let activeJobs = 0;
      const jobResults = /* @__PURE__ */ new Map();
      let nextWriteId = 1;
      let writing = false;
      const updateTotals = () => {
        progressModal.setTotals(totalPages, totalJobs);
      };
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const retryConvertImageBatch = async (files, prompt3) => {
        let attempt = 0;
        let lastErr = null;
        while (attempt <= RETRY_ATTEMPTS) {
          try {
            const res = await this.aiService.convertImageBatch(files, prompt3);
            return res;
          } catch (err) {
            lastErr = err;
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
        if (writing)
          return;
        writing = true;
        try {
          while (jobResults.has(nextWriteId)) {
            const { result, job } = jobResults.get(nextWriteId);
            const currentContent = await this.app.vault.read(outputFile);
            const appendContent = result.success !== false ? nextWriteId === 1 ? `${result.markdown}` : `

---

${result.markdown}` : nextWriteId === 1 ? `> [!ERROR] \u8F6C\u6362\u5931\u8D25: ${result.error}` : `

---

> [!ERROR] \u8F6C\u6362\u5931\u8D25: ${result.error}`;
            if (result.success !== false) {
              successPages += job.images.length;
            } else {
              const failed = Array.from({ length: job.endPage - job.startPage + 1 }, (_, i) => job.startPage + i);
              failedPages.push(...failed);
            }
            progressModal.updateAIProgress(nextWriteId);
            const processedPages = job.endPage;
            progressModal.setStatus(`\u5DF2\u5B8C\u6210\u6279\u6B21 ${nextWriteId}/${totalJobs}\uFF0C\u5DF2\u5904\u7406 ${processedPages}/${totalPages} \u9875\uFF08\u6210\u529F ${successPages} \u9875\uFF09`);
            const finalNewContent = currentContent + appendContent;
            await this.app.vault.modify(outputFile, finalNewContent);
            nextWriteId++;
          }
        } finally {
          writing = false;
        }
      };
      const runNextJob = () => {
        while (activeJobs < CONCURRENCY_LIMIT && jobQueue.length > 0) {
          const job = jobQueue.shift();
          activeJobs++;
          (async () => {
            try {
              const res = await retryConvertImageBatch(job.images, prompt2);
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
            batchImages.push(pageFileData);
            progressModal.updateRenderProgress(pageNum);
            progressModal.setStatus(`\u5DF2\u6E32\u67D3\u7B2C ${pageNum}/${totalPages} \u9875\uFF0C\u7B49\u5F85\u63D0\u4EA4AI...`);
            if (batchImages.length >= batchSize || pageNum === totalPages) {
              jobCounter++;
              const job = {
                id: jobCounter,
                images: batchImages.slice(),
                startPage: pageNum - batchImages.length + 1,
                endPage: pageNum
              };
              jobQueue.push(job);
              totalJobs++;
              updateTotals();
              progressModal.setStatus(`\u5DF2\u63D0\u4EA4\u6279\u6B21 ${totalJobs}\uFF08\u7B2C ${job.startPage}-${job.endPage} \u9875\uFF09\uFF0C\u6B63\u5728\u5E76\u53D1\u5904\u7406...`);
              batchImages = [];
              runNextJob();
            }
          } catch (pageError) {
            failedPages.push(pageNum);
            const errMsg = pageError instanceof Error ? pageError.message : String(pageError);
            console.error(`\u7B2C ${pageNum} \u9875\u8F6C\u6362\u5931\u8D25:`, errMsg);
            const currentContent = await this.app.vault.read(outputFile);
            const errorBlock = pageNum === 1 ? `> [!ERROR] \u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25: ${errMsg}` : `

---

> [!ERROR] \u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25: ${errMsg}`;
            const finalNewContent = currentContent + errorBlock;
            await this.app.vault.modify(outputFile, finalNewContent);
            progressModal.updateRenderProgress(pageNum);
            progressModal.setStatus(`\u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25\uFF1A${errMsg}`);
          }
        },
        (current, total, message2) => {
          progressModal.updateRenderProgress(current);
        },
        {
          scale: this.settings.advancedSettings?.pdfScale || 1.5,
          quality: this.settings.advancedSettings?.pdfQuality || 0.8,
          format: "jpeg",
          timeoutPerPage: this.settings.advancedSettings?.timeout || 3e4,
          onCancel: () => progressModal?.isCancelled() === true
        }
      );
      while (activeJobs > 0 || jobQueue.length > 0 || jobResults.has(nextWriteId)) {
        await sleep(100);
        await tryFlushWrites();
      }
      const finalContent = await this.app.vault.read(outputFile);
      const metadataComment = `<!-- HandMarkdownAI: ${JSON.stringify({ sourcePath: filePath, totalPages, failedPages })} -->`;
      await this.app.vault.modify(outputFile, finalContent + (finalContent.endsWith("\n") ? "" : "\n") + metadataComment);
      if (failedPages.length > 0 && progressModal) {
        progressModal.setStatus(`\u90E8\u5206\u9875\u9762\u5931\u8D25\uFF1A\u7B2C ${failedPages.join(", ")} \u9875\u3002\u53EF\u9009\u62E9\u91CD\u8BD5\u3002`);
        progressModal.showCompletionActions({
          onRetryAll: async () => {
            await this.retryFailedPagesFromOutput(outputPath);
          },
          onRetrySingle: async (pageNum) => {
            await this.retrySinglePageFromOutput(outputPath, void 0, pageNum);
          },
          onClose: () => {
            try {
              progressModal?.close();
            } catch (_) {
            }
          }
        });
      } else {
        try {
          progressModal?.close();
        } catch (_) {
        }
      }
      const duration = Date.now() - startTime;
      const message = failedPages.length > 0 ? `\u8F6C\u6362\u5B8C\u6210\uFF01\u6210\u529F ${successPages}/${totalPages} \u9875\uFF08\u5931\u8D25: \u7B2C ${failedPages.join(", ")} \u9875\uFF09\u3002\u53EF\u5728\u6253\u5F00\u7684\u8FDB\u5EA6\u7A97\u4E2D\u4E00\u952E\u91CD\u8BD5\u3002` : `\u8F6C\u6362\u6210\u529F\uFF01${totalPages} \u9875\uFF0C\u8017\u65F6: ${(duration / 1e3).toFixed(1)}s`;
      new import_obsidian5.Notice(message, 5e3);
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
      new import_obsidian5.Notice(`PDF \u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
      console.error("PDF \u8F6C\u6362\u5931\u8D25:", error);
      if (outputFile) {
        const errorContent = await this.app.vault.read(outputFile);
      }
      try {
        progressModal?.close();
      } catch (_) {
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
   * 从输出文件中解析源 PDF 路径与失败页列表（来自注释或摘要）
   */
  async parseConversionMetadata(outputPath) {
    const file = this.app.vault.getAbstractFileByPath(outputPath);
    if (!file)
      return { sourcePath: null, failedPages: [], totalPages: null };
    const content = await this.app.vault.read(file);
    let sourcePath = null;
    const metaMatch = content.match(/<!--\s*HandMarkdownAI:\s*(\{[\s\S]*?\})\s*-->/);
    if (metaMatch) {
      try {
        const obj = JSON.parse(metaMatch[1]);
        sourcePath = obj.sourcePath || null;
        const failedFromMeta = Array.isArray(obj.failedPages) ? obj.failedPages.filter((n) => typeof n === "number") : [];
        const totalFromMeta = typeof obj.totalPages === "number" ? obj.totalPages : null;
        return { sourcePath, failedPages: failedFromMeta, totalPages: totalFromMeta };
      } catch {
      }
    }
    const headerMatch = content.match(/^#\s+(.+)$/m);
    if (headerMatch) {
      const name = headerMatch[1].trim();
    }
    const summaryMatch = content.match(/失败: 第\s+([0-9,\s]+)\s+页/);
    const failedPages = [];
    if (summaryMatch) {
      summaryMatch[1].split(/[,\s]+/).forEach((s) => {
        const n = parseInt(s);
        if (!isNaN(n))
          failedPages.push(n);
      });
    }
    const errorBlocks = content.match(/> \[!ERROR\] 第\s+(\d+)\s+页渲染失败/gi) || [];
    errorBlocks.forEach((b) => {
      const m = b.match(/第\s+(\d+)\s+页/);
      if (m) {
        const n = parseInt(m[1]);
        if (!isNaN(n) && !failedPages.includes(n))
          failedPages.push(n);
      }
    });
    const totalMatch = content.match(/\((\d+)\/(\d+)\)/);
    const totalPages = totalMatch ? parseInt(totalMatch[2]) : null;
    return { sourcePath, failedPages, totalPages };
  }
  /**
   * 重试当前输出文件的所有失败页（需要提供源 PDF 路径）
   */
  async retryFailedPagesFromOutput(outputPath, sourcePdfPath) {
    const meta = await this.parseConversionMetadata(outputPath);
    if (meta.failedPages.length === 0) {
      new import_obsidian5.Notice("\u6CA1\u6709\u5931\u8D25\u7684\u9875\u53EF\u91CD\u8BD5", 3e3);
      return;
    }
    const sp = sourcePdfPath || meta.sourcePath;
    if (!sp) {
      new import_obsidian5.Notice("\u6E90 PDF \u8DEF\u5F84\u672A\u77E5\uFF0C\u65E0\u6CD5\u91CD\u8BD5\u3002\u8BF7\u91CD\u65B0\u8F6C\u6362\u6216\u5728\u547D\u4EE4\u4E2D\u63D0\u4F9B\u8DEF\u5F84\u3002", 5e3);
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(sp);
    if (!file) {
      new import_obsidian5.Notice("\u6E90 PDF \u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u91CD\u8BD5", 4e3);
      return;
    }
    const buffer = await this.app.vault.readBinary(file);
    const pageNums = meta.failedPages.sort((a, b) => a - b);
    const progress = new ProgressModal(this.app);
    progress.open();
    progress.setTotals(pageNums.length, pageNums.length);
    progress.setStatus("\u6B63\u5728\u91CD\u8BD5\u5931\u8D25\u9875...");
    let successCount = 0;
    const prompt2 = this.getConversionPrompt();
    for (let i = 0; i < pageNums.length; i++) {
      const pageNum = pageNums[i];
      try {
        const base64 = await PDFProcessor.convertSinglePageToImage(buffer, pageNum, {
          scale: this.settings.advancedSettings?.pdfScale || 1.5,
          quality: this.settings.advancedSettings?.pdfQuality || 0.8,
          format: "jpeg",
          timeoutPerPage: this.settings.advancedSettings?.timeout || 3e4
        });
        const pageFileData = {
          path: `${sp}#page${pageNum}`,
          name: `Page ${pageNum}`,
          base64,
          mimeType: "image/jpeg",
          size: base64.length,
          isPdf: true
        };
        const res = await this.aiService.convertImageBatch([pageFileData], prompt2);
        const of = this.app.vault.getAbstractFileByPath(outputPath);
        const current = await this.app.vault.read(of);
        const cleaned = current.replace(new RegExp(`
?
?---

>? [!ERROR] \u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25: .*`), "").replace(new RegExp(`>? [!ERROR] \u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25: .*
?`), "");
        const append = i === 0 ? res.markdown : `

---

${res.markdown}`;
        await this.app.vault.modify(of, cleaned + append);
        successCount++;
        progress.updateAIProgress(successCount);
        progress.setStatus(`\u5DF2\u91CD\u8BD5 ${successCount}/${pageNums.length}`);
      } catch (e) {
        new import_obsidian5.Notice(`\u7B2C ${pageNum} \u9875\u91CD\u8BD5\u5931\u8D25: ${e instanceof Error ? e.message : String(e)}`, 4e3);
      }
    }
    progress.close();
    new import_obsidian5.Notice(`\u5931\u8D25\u9875\u91CD\u8BD5\u5B8C\u6210\uFF1A\u6210\u529F ${successCount}/${pageNums.length}`, 5e3);
  }
  /**
   * 重试单个页（需要提供源 PDF 路径与页码）
   */
  async retrySinglePageFromOutput(outputPath, sourcePdfPath, pageNum) {
    const spOrMeta = sourcePdfPath || (await this.parseConversionMetadata(outputPath)).sourcePath || null;
    if (!spOrMeta) {
      new import_obsidian5.Notice("\u6E90 PDF \u8DEF\u5F84\u672A\u77E5\uFF0C\u65E0\u6CD5\u91CD\u8BD5\u3002\u8BF7\u91CD\u65B0\u8F6C\u6362\u6216\u5728\u547D\u4EE4\u4E2D\u63D0\u4F9B\u8DEF\u5F84\u3002", 5e3);
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(spOrMeta);
    if (!file) {
      new import_obsidian5.Notice("\u6E90 PDF \u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u91CD\u8BD5", 4e3);
      return;
    }
    const buffer = await this.app.vault.readBinary(file);
    const prompt2 = this.getConversionPrompt();
    const progress = new ProgressModal(this.app);
    progress.open();
    progress.setTotals(1, 1);
    try {
      const base64 = await PDFProcessor.convertSinglePageToImage(buffer, pageNum, {
        scale: this.settings.advancedSettings?.pdfScale || 1.5,
        quality: this.settings.advancedSettings?.pdfQuality || 0.8,
        format: "jpeg",
        timeoutPerPage: this.settings.advancedSettings?.timeout || 3e4
      });
      const pageFileData = {
        path: `${spOrMeta}#page${pageNum}`,
        name: `Page ${pageNum}`,
        base64,
        mimeType: "image/jpeg",
        size: base64.length,
        isPdf: true
      };
      const res = await this.aiService.convertImageBatch([pageFileData], prompt2);
      const of = this.app.vault.getAbstractFileByPath(outputPath);
      const current = await this.app.vault.read(of);
      const cleaned = current.replace(new RegExp(`
?
?---

>? [!ERROR] \u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25: .*`), "").replace(new RegExp(`>? [!ERROR] \u7B2C ${pageNum} \u9875\u6E32\u67D3\u5931\u8D25: .*
?`), "");
      const append = res.markdown;
      await this.app.vault.modify(of, cleaned + `

---

` + append);
      progress.updateAIProgress(1);
      progress.close();
      new import_obsidian5.Notice(`\u7B2C ${pageNum} \u9875\u91CD\u8BD5\u5B8C\u6210`, 4e3);
    } catch (e) {
      progress.close();
      new import_obsidian5.Notice(`\u7B2C ${pageNum} \u9875\u91CD\u8BD5\u5931\u8D25: ${e instanceof Error ? e.message : String(e)}`, 5e3);
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
    if (existingFile instanceof import_obsidian5.TFile) {
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
    const fileName = fileData.name.replace(/\.[^/.]+$/, "");
    const titleAndContent = `# ${fileName}
${outputSettings.contentAfterTitle ? "\n" + outputSettings.contentAfterTitle + "\n" : "\n"}${markdown}`;
    const existingFile = this.app.vault.getAbstractFileByPath(outputPath);
    if (existingFile instanceof import_obsidian5.TFile) {
      await this.app.vault.modify(existingFile, titleAndContent);
    } else {
      await this.app.vault.create(outputPath, titleAndContent);
    }
    if (outputSettings.autoOpen) {
      const newFile = this.app.vault.getAbstractFileByPath(outputPath);
      if (newFile instanceof import_obsidian5.TFile) {
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
var ConversionModal = class extends import_obsidian6.Modal {
  plugin;
  selectedFiles = [];
  fileCheckboxes = /* @__PURE__ */ new Map();
  folderCheckboxes = /* @__PURE__ */ new Map();
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
    const treeContainer = fileListContainer.createDiv();
    treeContainer.addClass("file-tree-container");
    const rootFolder = this.app.vault.getRoot();
    this.buildFolderTree(rootFolder, treeContainer);
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
        new import_obsidian6.Notice("\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6", 3e3);
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
        if (file instanceof import_obsidian6.TFile) {
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
   * 构建文件夹树
   */
  buildFolderTree(folder, containerEl) {
    const folderEl = containerEl.createDiv();
    folderEl.addClass("folder-item");
    const folderHeader = folderEl.createDiv();
    folderHeader.addClass("folder-header");
    const folderCheckbox = folderHeader.createEl("input", {
      type: "checkbox",
      cls: "folder-checkbox"
    });
    const folderLabel = folderHeader.createEl("label", {
      text: folder.path || "/",
      cls: "folder-name"
    });
    this.folderCheckboxes.set(folder.path || "/", folderCheckbox);
    const childrenContainer = folderEl.createDiv();
    childrenContainer.addClass("folder-children");
    folder.children.forEach((child) => {
      if (child instanceof import_obsidian6.TFolder) {
        this.buildFolderTree(child, childrenContainer);
      } else if (child instanceof import_obsidian6.TFile) {
        if (!ConversionService.isFileSupported(child.path))
          return;
        const fileItem = childrenContainer.createDiv();
        fileItem.addClass("file-item");
        const checkbox = fileItem.createEl("input", {
          type: "checkbox",
          cls: "file-checkbox"
        });
        const fileName = fileItem.createEl("label", {
          text: child.path,
          cls: "file-name"
        });
        const fileSize = fileItem.createEl("span", {
          text: this.formatFileSize(child.stat.size),
          cls: "file-size"
        });
        this.fileCheckboxes.set(child.path, checkbox);
        checkbox.addEventListener("change", () => {
          this.updateSelectedFiles();
          this.updateSelectAllState();
          this.updateFolderIndeterminateStates(containerEl);
        });
      }
    });
    folderCheckbox.addEventListener("change", () => {
      const checked = folderCheckbox.checked;
      this.toggleFolderChildren(containerEl, checked);
      this.updateSelectedFiles();
      this.updateSelectAllState();
      this.updateFolderIndeterminateStates(containerEl);
    });
  }
  /**
   * 切换文件夹内所有文件的勾选状态
   */
  toggleFolderChildren(containerEl, checked) {
    const checkboxes = containerEl.querySelectorAll("input.file-checkbox");
    checkboxes.forEach((cb) => {
      cb.checked = checked;
    });
    const subFolders = containerEl.querySelectorAll(".folder-item");
    subFolders.forEach((sub) => {
      const subFileCheckboxes = sub.querySelectorAll("input.file-checkbox");
      subFileCheckboxes.forEach((cb) => cb.checked = checked);
      const subFolderCheckbox = sub.querySelector("input.folder-checkbox");
      if (subFolderCheckbox)
        subFolderCheckbox.checked = checked;
    });
  }
  /**
   * 更新文件夹的半选状态
   */
  updateFolderIndeterminateStates(rootEl) {
    const folderItems = rootEl.querySelectorAll(".folder-item");
    folderItems.forEach((folderItem) => {
      const folderCheckbox = folderItem.querySelector("input.folder-checkbox");
      const fileCheckboxes = folderItem.querySelectorAll("input.file-checkbox");
      if (!folderCheckbox || fileCheckboxes.length === 0)
        return;
      const allChecked = Array.from(fileCheckboxes).every((cb) => cb.checked);
      const someChecked = Array.from(fileCheckboxes).some((cb) => cb.checked);
      folderCheckbox.checked = allChecked;
      folderCheckbox.indeterminate = someChecked && !allChecked;
    });
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
var import_obsidian7 = require("obsidian");
init_constants();
var SimpleSettingsTab = class extends import_obsidian7.PluginSettingTab {
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
    const statusDiv = containerEl.createDiv({ attr: { style: "margin-bottom: 20px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;" } });
    const currentModel = this.plugin.settings.currentModel;
    const modelConfig = this.plugin.settings.models[currentModel];
    const provider = modelConfig ? this.plugin.settings.providers[modelConfig.provider] : null;
    const hasApiKey = provider?.apiKey?.trim();
    const badge = statusDiv.createDiv({ attr: { style: "display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius: 20px; border: 1px solid var(--background-modifier-border); background: var(--background-secondary);" } });
    badge.createSpan({ text: "\u5F53\u524D\u6A21\u578B:", attr: { style: "opacity:0.7;" } });
    badge.createEl("strong", { text: modelConfig?.name || currentModel });
    if (modelConfig?.provider) {
      const prov = statusDiv.createDiv({ attr: { style: "padding:6px 10px; border-radius: 16px; border:1px solid var(--background-modifier-border); background: var(--background-secondary); font-size:12px;" } });
      prov.setText(`Provider: ${modelConfig.provider}${provider?.name ? ` (${provider.name})` : ""}`);
    }
    const hint = statusDiv.createDiv({ attr: { style: "flex-basis:100%; color: var(--text-muted);" } });
    hint.setText(hasApiKey ? "\u53F3\u952E\u6587\u4EF6/\u6587\u4EF6\u5939\u53EF\u4E00\u952E\u8F6C\u6362\uFF1B\u547D\u4EE4\u9762\u677F\u53EF\u641C\u7D22\u76F8\u5173\u547D\u4EE4\u3002" : "\u26A0\uFE0F \u9700\u8981\u914D\u7F6E\uFF1A\u8BF7\u5148\u586B\u5199 API Key");
    containerEl.createEl("hr");
  }
  addProviderSection(containerEl) {
    containerEl.createEl("h3", { text: "\u4F9B\u5E94\u5546\u3001API\u8BBE\u7F6E" });
    containerEl.createEl("p", {
      text: "APIKey\uFF1A\u9700\u5728\u4F9B\u5E94\u5546API\u5BC6\u94A5\u4E2D\u8BBE\u7F6EAPIKey",
      attr: { style: "color: var(--text-muted); margin-bottom: 5px;" }
    });
    containerEl.createEl("p", {
      text: "Base URL\uFF1A\u9009\u586B\u7B2C\u4E09\u65B9URL\uFF0C\u4F7F\u7528openai\u517C\u5BB9\u683C\u5F0F",
      attr: { style: "color: var(--text-muted); margin-bottom: 15px;" }
    });
    const providerTable = containerEl.createEl("table", { cls: "markdown-next-ai-config-table" });
    const thead = providerTable.createEl("thead").createEl("tr");
    thead.createEl("th", { text: "ID" });
    thead.createEl("th", { text: "Type" });
    thead.createEl("th", { text: "API Key" });
    thead.createEl("th", { text: "Get API keys" });
    thead.createEl("th", { text: "Actions" });
    const tbody = providerTable.createEl("tbody");
    Object.keys(this.plugin.settings.providers).forEach((providerId) => {
      const provider = this.plugin.settings.providers[providerId];
      const row = tbody.createEl("tr");
      row.createEl("td", { text: providerId });
      row.createEl("td", { text: provider.type || "openai" });
      const apiKeyCell = row.createEl("td", { cls: "markdown-next-ai-api-key-cell" });
      if (provider.apiKey && provider.apiKey.trim()) {
        apiKeyCell.createEl("span", {
          text: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
          attr: { style: "color: var(--text-muted); margin-right: 8px;" }
        });
      }
      const settingsBtn = apiKeyCell.createEl("button", {
        cls: "markdown-next-ai-settings-btn",
        attr: { title: "\u8BBE\u7F6EAPI Key" }
      });
      settingsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>';
      settingsBtn.onclick = () => this.showApiKeyModal(providerId);
      const linkCell = row.createEl("td", { attr: { style: "text-align: left;" } });
      const links = {
        openai: "https://platform.openai.com/api-keys",
        anthropic: "https://console.anthropic.com/",
        gemini: "https://aistudio.google.com/app/apikey",
        ollama: "https://ollama.com/"
      };
      const link = links[providerId] || this.plugin.settings.apiKeyLinks && this.plugin.settings.apiKeyLinks[providerId];
      if (link) {
        linkCell.createEl("a", {
          text: "\u83B7\u53D6API Key",
          attr: {
            href: link,
            target: "_blank",
            style: "color: var(--text-accent); text-decoration: underline; font-size: 0.9em;"
          }
        });
      } else {
        linkCell.createEl("span", { text: "-", attr: { style: "color: var(--text-muted);" } });
      }
      const actionsCell = row.createEl("td", { cls: "markdown-next-ai-actions-cell" });
      if (["openai", "anthropic", "gemini", "deepseek", "ollama"].includes(providerId)) {
        actionsCell.createEl("span", { text: "-", attr: { style: "color: var(--text-muted);" } });
      } else {
        const editBtn = actionsCell.createEl("button", { text: "\u7F16\u8F91" });
        editBtn.onclick = () => this.showEditProviderModal(providerId);
        const deleteBtn = actionsCell.createEl("button", { text: "\u5220\u9664" });
        deleteBtn.onclick = async () => {
          if (confirm(`\u786E\u5B9A\u8981\u5220\u9664\u4F9B\u5E94\u5546 "${providerId}" \uFF1F\u8FD9\u5C06\u540C\u65F6\u5220\u9664\u8BE5\u4F9B\u5E94\u5546\u4E0B\u7684\u6240\u6709\u6A21\u578B\u3002`)) {
            Object.keys(this.plugin.settings.models).forEach((modelId) => {
              if (this.plugin.settings.models[modelId].provider === providerId) {
                delete this.plugin.settings.models[modelId];
              }
            });
            delete this.plugin.settings.providers[providerId];
            await this.plugin.saveSettings();
            this.display();
          }
        };
      }
    });
    containerEl.createEl("div", { attr: { style: "margin-top: 15px; margin-bottom: 20px;" } }).createEl("button", {
      text: "+ \u6DFB\u52A0\u4F9B\u5E94\u5546",
      attr: { style: "background: var(--interactive-accent); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;" }
    }).onclick = () => this.showAddProviderModal();
    containerEl.createEl("hr");
  }
  addModelSection(containerEl) {
    const modelHeader = containerEl.createEl("div", {
      attr: { style: "display: flex; justify-content: space-between; align-items: center; margin-top: 30px; margin-bottom: 15px;" }
    });
    modelHeader.createEl("h3", { text: "\u6A21\u578B\u8BBE\u7F6E", attr: { style: "margin: 0;" } });
    modelHeader.createEl("button", {
      text: "+ \u6DFB\u52A0\u6A21\u578B",
      attr: { style: "background: var(--interactive-accent); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;" }
    }).onclick = () => this.showAddModelModal();
    const modelTable = containerEl.createEl("table", { cls: "markdown-next-ai-config-table" });
    const mThead = modelTable.createEl("thead").createEl("tr");
    mThead.createEl("th", { text: "ID" });
    mThead.createEl("th", { text: "Provider" });
    mThead.createEl("th", { text: "Model" });
    mThead.createEl("th", { text: "Enable" });
    mThead.createEl("th", { text: "Actions" });
    const mTbody = modelTable.createEl("tbody");
    const allModels = Object.values(this.plugin.settings.models);
    if (allModels.length > 0) {
      allModels.forEach((model) => {
        const row = mTbody.createEl("tr");
        row.createEl("td", { text: model.id });
        row.createEl("td", { text: model.provider });
        row.createEl("td", { text: model.model });
        const enableCell = row.createEl("td", { cls: "markdown-next-ai-enable-cell" });
        const checkbox = enableCell.createEl("input", { type: "checkbox" });
        checkbox.checked = model.enabled;
        checkbox.onchange = async () => {
          this.plugin.settings.models[model.id].enabled = checkbox.checked;
          await this.plugin.saveSettings();
          if (!checkbox.checked && this.plugin.settings.currentModel === model.id) {
            const firstEnabled = Object.keys(this.plugin.settings.models).find((id) => this.plugin.settings.models[id].enabled);
            if (firstEnabled) {
              this.plugin.settings.currentModel = firstEnabled;
              await this.plugin.saveSettings();
              this.display();
            }
          }
        };
        const mActionsCell = row.createEl("td", { cls: "markdown-next-ai-actions-cell" });
        const editBtn = mActionsCell.createEl("button", { text: "\u7F16\u8F91" });
        editBtn.onclick = () => this.showEditModelModal(model.id);
        const deleteBtn = mActionsCell.createEl("button", { text: "\u5220\u9664" });
        deleteBtn.onclick = async () => {
          if (confirm(`\u786E\u5B9A\u8981\u5220\u9664\u6A21\u578B "${model.name || model.id}" \uFF1F`)) {
            if (this.plugin.settings.currentModel === model.id) {
              const otherEnabled = Object.keys(this.plugin.settings.models).find((id) => id !== model.id && this.plugin.settings.models[id].enabled);
              this.plugin.settings.currentModel = otherEnabled || "";
            }
            delete this.plugin.settings.models[model.id];
            await this.plugin.saveSettings();
            this.display();
          }
        };
      });
    } else {
      const emptyRow = mTbody.createEl("tr");
      emptyRow.createEl("td", {
        text: "\u6682\u65E0\u6A21\u578B\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0",
        attr: { colspan: "5", style: "text-align: center; color: var(--text-muted); font-style: italic; padding: 20px;" }
      });
    }
    new import_obsidian7.Setting(containerEl).setName("\u5F53\u524D\u6A21\u578B").setDesc("\u9009\u62E9\u5F53\u524D\u4F7F\u7528\u7684AI\u6A21\u578B").addDropdown((dropdown) => {
      const enabledModels = Object.keys(this.plugin.settings.models).filter((id) => this.plugin.settings.models[id].enabled);
      enabledModels.forEach((id) => {
        const model = this.plugin.settings.models[id];
        dropdown.addOption(id, `${model.name || model.model} (${model.provider})`);
      });
      if (!enabledModels.includes(this.plugin.settings.currentModel) && enabledModels.length > 0) {
        this.plugin.settings.currentModel = enabledModels[0];
        this.plugin.saveSettings();
      }
      dropdown.setValue(this.plugin.settings.currentModel || "").onChange(async (value) => {
        this.plugin.settings.currentModel = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian7.Setting(containerEl).setName("\u6D4B\u8BD5API\u8FDE\u63A5").setDesc("\u6D4B\u8BD5\u5F53\u524DAPI\u914D\u7F6E\u662F\u5426\u6B63\u5E38").addButton(
      (button) => button.setButtonText("\u6D4B\u8BD5\u8FDE\u63A5").onClick(async () => {
        const originalText = button.buttonEl.textContent || "\u6D4B\u8BD5\u8FDE\u63A5";
        button.setButtonText("\u6D4B\u8BD5\u4E2D...");
        try {
          const result = await this.plugin.aiService.testConnection();
          if (result.success) {
            new import_obsidian7.Notice("\u2705 API\u8FDE\u63A5\u6210\u529F");
          } else {
            new import_obsidian7.Notice("\u274C API\u8FDE\u63A5\u5931\u8D25: " + (result.message || "\u672A\u77E5\u9519\u8BEF"));
          }
        } catch (error) {
          new import_obsidian7.Notice("\u274C \u6D4B\u8BD5\u5931\u8D25: " + (error?.message || String(error)));
        } finally {
          button.setButtonText(originalText);
        }
      })
    );
    containerEl.createEl("hr");
  }
  showProviderModal(mode, providerId) {
    const modal = new import_obsidian7.Modal(this.app);
    modal.titleEl.setText(mode === "add" ? "\u6DFB\u52A0\u63D0\u4F9B\u5546" : `\u7F16\u8F91\u63D0\u4F9B\u5546 ${providerId}`);
    const content = modal.contentEl.createDiv({ attr: { style: "display: flex; flex-direction: column; gap: 12px;" } });
    const provider = providerId ? this.plugin.settings.providers[providerId] : { apiKey: "", baseUrl: "", enabled: true, type: "openai", name: "" };
    let idValue = providerId || "";
    const idInput = new import_obsidian7.Setting(content).setName("ID").setDesc("\u7528\u4E8E\u5F15\u7528\u7684\u552F\u4E00\u6807\u8BC6").addText((text) => {
      text.setPlaceholder("my-provider").setValue(idValue).onChange((value) => idValue = value.trim());
      if (mode === "edit")
        text.setDisabled(true);
    });
    new import_obsidian7.Setting(content).setName("\u663E\u793A\u540D\u79F0").addText(
      (text) => text.setPlaceholder("OpenAI").setValue(provider.name || "").onChange((value) => provider.name = value.trim())
    );
    new import_obsidian7.Setting(content).setName("\u7C7B\u578B").setDesc("openai \u517C\u5BB9\u7C7B\u578B\u6807\u8BC6").addText(
      (text) => text.setPlaceholder("openai").setValue(provider.type || "openai").onChange((value) => provider.type = value.trim() || "openai")
    );
    new import_obsidian7.Setting(content).setName("Base URL").setDesc("\u53EF\u9009\uFF0COpenAI \u517C\u5BB9\u63A5\u53E3\u5730\u5740").addText(
      (text) => text.setPlaceholder("https://api.openai.com/v1").setValue(provider.baseUrl || "").onChange((value) => provider.baseUrl = value.trim())
    );
    new import_obsidian7.Setting(content).setName("API Key").addText((text) => {
      text.inputEl.type = "password";
      text.setPlaceholder("sk-...").setValue(provider.apiKey || "").onChange((value) => provider.apiKey = value.trim());
    });
    new import_obsidian7.Setting(content).setName("\u542F\u7528").addToggle(
      (toggle) => toggle.setValue(provider.enabled).onChange((value) => provider.enabled = value)
    );
    const footer = modal.contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;" } });
    const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88" });
    cancelBtn.onclick = () => modal.close();
    const saveBtn = footer.createEl("button", { text: "\u4FDD\u5B58" });
    saveBtn.onclick = async () => {
      if (!idValue) {
        new import_obsidian7.Notice("ID \u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (mode === "add" && this.plugin.settings.providers[idValue]) {
        new import_obsidian7.Notice("ID \u5DF2\u5B58\u5728");
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
  showAddProviderModal() {
    this.showProviderModal("add");
  }
  showEditProviderModal(providerId) {
    this.showProviderModal("edit", providerId);
  }
  showApiKeyModal(providerId) {
    const modal = new import_obsidian7.Modal(this.app);
    modal.titleEl.setText(`\u8BBE\u7F6E ${providerId.toUpperCase()} \u914D\u7F6E`);
    const contentEl = modal.contentEl;
    const provider = this.plugin.settings.providers[providerId] || { apiKey: "", baseUrl: "", enabled: true };
    contentEl.createEl("label", { text: "API Key:", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
    const apiKeyInput = contentEl.createEl("input", { type: "password", placeholder: "\u8BF7\u8F93\u5165API Key", attr: { style: "width: 100%; margin-bottom: 15px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" } });
    apiKeyInput.value = provider.apiKey || "";
    contentEl.createEl("label", { text: "Base URL (\u53EF\u9009):", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
    const baseUrlInput = contentEl.createEl("input", { type: "text", placeholder: "\u4F8B\u5982: https://api.example.com/v1", value: provider.baseUrl || "", attr: { style: "width: 100%; margin-bottom: 15px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" } });
    const buttonContainer = contentEl.createEl("div", { attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;" } });
    const cancelBtn = buttonContainer.createEl("button", { text: "\u53D6\u6D88", attr: { style: "padding: 6px 12px;" } });
    cancelBtn.onclick = () => modal.close();
    const saveBtn = buttonContainer.createEl("button", { text: "\u4FDD\u5B58", cls: "mod-cta", attr: { style: "padding: 6px 12px;" } });
    const saveHandler = async () => {
      if (!this.plugin.settings.providers[providerId]) {
        this.plugin.settings.providers[providerId] = { apiKey: "", baseUrl: "", enabled: true };
      }
      this.plugin.settings.providers[providerId].apiKey = apiKeyInput.value.trim();
      this.plugin.settings.providers[providerId].baseUrl = baseUrlInput.value.trim();
      if (apiKeyInput.value.trim()) {
        this.plugin.settings.providers[providerId].enabled = true;
      }
      await this.plugin.saveSettings();
      new import_obsidian7.Notice(providerId.toUpperCase() + " \u914D\u7F6E\u5DF2\u4FDD\u5B58");
      modal.close();
      this.display();
    };
    saveBtn.onclick = saveHandler;
    const keydownHandler = (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveHandler();
      }
    };
    apiKeyInput.addEventListener("keydown", keydownHandler);
    baseUrlInput.addEventListener("keydown", keydownHandler);
    modal.open();
    apiKeyInput.focus();
  }
  showModelModal(mode, modelId) {
    const modal = new import_obsidian7.Modal(this.app);
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
    new import_obsidian7.Setting(content).setName("ID").setDesc("\u552F\u4E00\u6807\u8BC6\uFF0C\u5EFA\u8BAE\u4F7F\u7528\u5C0F\u5199\u548C\u77ED\u6A2A\u7EBF").addText((text) => {
      text.setPlaceholder("gpt-4o-mini").setValue(idValue).onChange((value) => idValue = value.trim());
      if (mode === "edit")
        text.setDisabled(true);
    });
    new import_obsidian7.Setting(content).setName("\u663E\u793A\u540D\u79F0").addText(
      (text) => text.setPlaceholder("GPT-4o Mini").setValue(model.name).onChange((value) => model.name = value.trim())
    );
    new import_obsidian7.Setting(content).setName("Provider").addDropdown((drop) => {
      Object.keys(this.plugin.settings.providers).forEach((pid) => drop.addOption(pid, pid));
      drop.setValue(model.provider).onChange((value) => model.provider = value);
    });
    new import_obsidian7.Setting(content).setName("Model").setDesc("API \u6A21\u578B\u540D\u79F0\uFF0C\u4F8B\u5982 gpt-4o-mini").addText(
      (text) => text.setPlaceholder("gpt-4o-mini").setValue(model.model).onChange((value) => model.model = value.trim())
    );
    new import_obsidian7.Setting(content).setName("\u7C7B\u522B").addDropdown((drop) => {
      Object.entries(MODEL_CATEGORIES).forEach(([key, value]) => drop.addOption(String(value), key));
      drop.setValue(String(model.category)).onChange((value) => model.category = value);
    });
    new import_obsidian7.Setting(content).setName("\u542F\u7528").addToggle(
      (toggle) => toggle.setValue(model.enabled).onChange((value) => model.enabled = value)
    );
    const footer = modal.contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;" } });
    footer.createEl("button", { text: "\u53D6\u6D88" }).onclick = () => modal.close();
    footer.createEl("button", { text: "\u4FDD\u5B58" }).onclick = async () => {
      if (!idValue) {
        new import_obsidian7.Notice("\u6A21\u578B ID \u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (!model.name) {
        new import_obsidian7.Notice("\u6A21\u578B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (!model.model) {
        new import_obsidian7.Notice("Model \u5B57\u6BB5\u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (!this.plugin.settings.providers[model.provider]) {
        new import_obsidian7.Notice("\u8BF7\u9009\u62E9\u6709\u6548\u7684 Provider");
        return;
      }
      if (mode === "add" && this.plugin.settings.models[idValue]) {
        new import_obsidian7.Notice("\u6A21\u578B ID \u5DF2\u5B58\u5728");
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
  showAddModelModal() {
    this.showModelModal("add");
  }
  showEditModelModal(modelId) {
    this.showModelModal("edit", modelId);
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
    new import_obsidian7.Setting(containerEl).setName("\u56FE\u7247\u8D28\u91CF").setDesc("PDF \u8F6C\u56FE\u7247\u7684\u8D28\u91CF\uFF080.1-1.0\uFF0C\u8D8A\u9AD8\u8D8A\u6E05\u6670\u4F46\u6587\u4EF6\u8D8A\u5927\uFF09").addSlider(
      (slider) => slider.setLimits(0.1, 1, 0.1).setValue(this.plugin.settings.advancedSettings?.pdfQuality || 0.8).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.advancedSettings.pdfQuality = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u56FE\u7247\u7F29\u653E").setDesc("PDF \u8F6C\u56FE\u7247\u7684\u7F29\u653E\u6BD4\u4F8B\uFF081.0-2.0\uFF0C\u8D8A\u9AD8\u8D8A\u6E05\u6670\uFF09").addSlider(
      (slider) => slider.setLimits(1, 2, 0.1).setValue(this.plugin.settings.advancedSettings?.pdfScale || 1.5).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.advancedSettings.pdfScale = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u6BCF\u6B21\u63D0\u4EA4\u56FE\u7247\u6570\u91CF").setDesc("PDF \u8F6C\u6362\u65F6\u6279\u91CF\u63D0\u4EA4\u7ED9 AI \u7684\u56FE\u7247\u5F20\u6570\uFF08\u5EFA\u8BAE 1-5\uFF09").addText(
      (text) => text.setPlaceholder("1").setValue(String(this.plugin.settings.advancedSettings?.imagesPerRequest ?? 1)).onChange(async (value) => {
        const n = parseInt(value);
        if (!isNaN(n) && n > 0 && n <= 10) {
          this.plugin.settings.advancedSettings.imagesPerRequest = n;
          await this.plugin.saveSettings();
        }
      })
    );
    containerEl.createEl("hr");
  }
  addOutputSettings(containerEl) {
    containerEl.createEl("h3", { text: "\u{1F4BE} \u8F93\u51FA\u8BBE\u7F6E" });
    const outputSetting = new import_obsidian7.Setting(containerEl).setName("\u8F93\u51FA\u76EE\u5F55").setDesc("\u8F6C\u6362\u540E\u7684\u6587\u4EF6\u4FDD\u5B58\u4F4D\u7F6E\uFF08\u70B9\u51FB\u9009\u62E9\uFF09");
    outputSetting.addText((text) => {
      text.setPlaceholder("Handwriting Converted");
      text.setValue(this.plugin.settings.outputSettings.outputDir);
      text.setDisabled(true);
    });
    outputSetting.addButton((btn) => {
      btn.setButtonText("\u9009\u62E9...").onClick(() => this.openFolderPicker(async (folderPath) => {
        if (!folderPath)
          return;
        this.plugin.settings.outputSettings.outputDir = folderPath;
        await this.plugin.saveSettings();
        this.display();
      }));
    });
    new import_obsidian7.Setting(containerEl).setName("\u4FDD\u7559\u539F\u6587\u4EF6\u540D").setDesc("\u4F7F\u7528\u539F\u59CB PDF \u6587\u4EF6\u540D").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.outputSettings.keepOriginalName).onChange(async (value) => {
        this.plugin.settings.outputSettings.keepOriginalName = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u8F6C\u6362\u540E\u81EA\u52A8\u6253\u5F00").setDesc("\u8F6C\u6362\u5B8C\u6210\u540E\u7ACB\u5373\u6253\u5F00\u6587\u4EF6").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.outputSettings.autoOpen).onChange(async (value) => {
        this.plugin.settings.outputSettings.autoOpen = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u6807\u9898\u4E0B\u65B9\u63D2\u5165\u5185\u5BB9").setDesc("\u5728 Markdown \u6807\u9898\u4E0B\u65B9\u63D2\u5165\u7684\u81EA\u5B9A\u4E49\u5185\u5BB9\uFF08\u652F\u6301 Markdown \u683C\u5F0F\uFF0C\u7559\u7A7A\u5219\u4E0D\u63D2\u5165\uFF09").addTextArea((text) => {
      text.setPlaceholder("\u4F8B\u5982\uFF1A> \u6765\u81EA PDF \u7684\u8F6C\u6362\u5185\u5BB9\\n\u6216\uFF1A[\u8FD4\u56DE\u76EE\u5F55](#\u76EE\u5F55)").setValue(this.plugin.settings.outputSettings.contentAfterTitle || "").setDisabled(false).onChange(async (value) => {
        this.plugin.settings.outputSettings.contentAfterTitle = value;
        await this.plugin.saveSettings();
      });
      text.inputEl.rows = 3;
      text.inputEl.style.width = "100%";
      text.inputEl.readOnly = false;
      text.inputEl.tabIndex = 0;
      text.inputEl.style.pointerEvents = "auto";
    });
    containerEl.createEl("hr");
  }
  addPromptSettings(containerEl) {
    containerEl.createEl("h3", { text: "\u270D\uFE0F \u8F6C\u6362\u63D0\u793A\u8BCD" });
    const defaultPrompt = "Take the handwritten notes from this image and convert them into a clean, well-structured Markdown file. Pay attention to headings, lists, and any other formatting. Use latex for mathematical equations. For latex use the $$ syntax. Do not skip anything from the original text. Just give me the markdown, do not include other text in the response apart from the markdown file.";
    new import_obsidian7.Setting(containerEl).setName("\u81EA\u5B9A\u4E49\u63D0\u793A\u8BCD").setDesc("\u544A\u8BC9 AI \u5982\u4F55\u8F6C\u6362\u4F60\u7684\u7B14\u8BB0\uFF08\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\uFF09").addTextArea((text) => {
      text.setPlaceholder(defaultPrompt).setValue(this.plugin.settings.conversionPrompt || "").setDisabled(false).onChange(async (value) => {
        this.plugin.settings.conversionPrompt = value;
        await this.plugin.saveSettings();
      });
      text.inputEl.rows = 6;
      text.inputEl.style.width = "100%";
      text.inputEl.readOnly = false;
      text.inputEl.tabIndex = 0;
      text.inputEl.style.pointerEvents = "auto";
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
    new import_obsidian7.Setting(contentDiv).setName("\u8BF7\u6C42\u8D85\u65F6\uFF08\u79D2\uFF09").setDesc("\u5355\u4E2A\u9875\u9762\u5904\u7406\u7684\u6700\u5927\u7B49\u5F85\u65F6\u95F4").addText(
      (text) => text.setPlaceholder("60").setValue(String(this.plugin.settings.advancedSettings.timeout / 1e3)).onChange(async (value) => {
        const seconds = parseInt(value);
        if (!isNaN(seconds) && seconds > 0) {
          this.plugin.settings.advancedSettings.timeout = seconds * 1e3;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(contentDiv).setName("\u6700\u5927 Token \u6570").setDesc("AI \u54CD\u5E94\u7684\u6700\u5927\u957F\u5EA6").addText(
      (text) => text.setPlaceholder("4096").setValue(String(this.plugin.settings.maxTokens)).onChange(async (value) => {
        const tokens = parseInt(value);
        if (!isNaN(tokens) && tokens > 0) {
          this.plugin.settings.maxTokens = tokens;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(contentDiv).setName("\u5E76\u53D1\u6279\u5904\u7406\u6570\u91CF").setDesc("\u540C\u65F6\u5411 AI \u63D0\u4EA4\u7684\u6279\u6B21\uFF08\u5EFA\u8BAE 1-3\uFF09").addText(
      (text) => text.setPlaceholder("2").setValue(String(this.plugin.settings.advancedSettings?.concurrencyLimit ?? 2)).onChange(async (value) => {
        const n = parseInt(value);
        if (!isNaN(n) && n > 0 && n <= 5) {
          this.plugin.settings.advancedSettings.concurrencyLimit = n;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(contentDiv).setName("\u91CD\u8BD5\u6B21\u6570").setDesc("\u6279\u6B21\u8BF7\u6C42\u5931\u8D25\u540E\u7684\u91CD\u8BD5\u6B21\u6570\uFF08\u5EFA\u8BAE 0-3\uFF09").addText(
      (text) => text.setPlaceholder("2").setValue(String(this.plugin.settings.advancedSettings?.retryAttempts ?? 2)).onChange(async (value) => {
        const n = parseInt(value);
        if (!isNaN(n) && n >= 0 && n <= 5) {
          this.plugin.settings.advancedSettings.retryAttempts = n;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(contentDiv).setName("\u8F6C\u6362\u65F6\u81EA\u52A8\u6700\u5C0F\u5316\u8FDB\u5EA6\u7A97").setDesc("\u5F00\u59CB\u8F6C\u6362\u540E\u81EA\u52A8\u5C06\u8FDB\u5EA6\u7A97\u53E3\u6700\u5C0F\u5316\u4E3A\u53F3\u4E0B\u89D2\u6D6E\u52A8\u9762\u677F\uFF0C\u907F\u514D\u906E\u6321\u754C\u9762").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.advancedSettings?.autoMinimizeProgress ?? false).onChange(async (value) => {
        this.plugin.settings.advancedSettings.autoMinimizeProgress = value;
        await this.plugin.saveSettings();
      })
    );
  }
  addFooter(containerEl) {
    containerEl.createEl("hr");
    const footerDiv = containerEl.createDiv({
      attr: { style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;" }
    });
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
  /**
   * 打开文件夹选择器（FuzzySuggestModal），回传 vault 相对路径
   */
  openFolderPicker(onPicked) {
    const folders = [];
    const all = this.app.vault.getAllLoadedFiles();
    all.forEach((f) => {
      if (f instanceof import_obsidian7.TFolder)
        folders.push(f);
    });
    class FolderSuggest extends import_obsidian7.FuzzySuggestModal {
      constructor(items, cb, app) {
        super(app);
        this.items = items;
        this.cb = cb;
        this.setPlaceholder("\u9009\u62E9\u8F93\u51FA\u6587\u4EF6\u5939...");
      }
      chosen = false;
      getItems() {
        return this.items;
      }
      getItemText(item) {
        return item.path;
      }
      onChooseItem(item) {
        this.chosen = true;
        this.cb(item.path);
      }
      onClose() {
        if (!this.chosen)
          this.cb(null);
      }
    }
    new FolderSuggest(folders, onPicked, this.app).open();
  }
  async testConfiguration() {
    const currentModel = this.plugin.settings.currentModel;
    if (!currentModel) {
      new import_obsidian7.Notice("\u274C \u672A\u9009\u62E9\u6A21\u578B", 3e3);
      return;
    }
    const modelConfig = this.plugin.settings.models[currentModel];
    const provider = this.plugin.settings.providers[modelConfig?.provider];
    if (!provider?.apiKey) {
      new import_obsidian7.Notice("\u274C \u672A\u914D\u7F6E API Key", 3e3);
      return;
    }
    new import_obsidian7.Notice("\u{1F9EA} \u6B63\u5728\u6D4B\u8BD5\u914D\u7F6E...", 1500);
    try {
      const result = await this.plugin.aiService.testConnection();
      if (result.success) {
        new import_obsidian7.Notice("\u2705 API\u8FDE\u63A5\u6210\u529F", 3e3);
      } else {
        new import_obsidian7.Notice("\u274C \u8FDE\u63A5\u5931\u8D25: " + result.message, 4e3);
      }
    } catch (e) {
      new import_obsidian7.Notice("\u274C \u6D4B\u8BD5\u5F02\u5E38: " + (e?.message || String(e)), 4e3);
    }
  }
  async resetSettings() {
    if (!confirm("\u786E\u5B9A\u8981\u91CD\u7F6E\u6240\u6709\u8BBE\u7F6E\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002")) {
      return;
    }
    const { DEFAULT_SETTINGS: DEFAULT_SETTINGS2 } = await Promise.resolve().then(() => (init_defaults(), defaults_exports));
    this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS2));
    await this.plugin.saveSettings();
    this.display();
    new import_obsidian7.Notice("\u2705 \u8BBE\u7F6E\u5DF2\u91CD\u7F6E", 3e3);
  }
};

// src/main.ts
var HandMarkdownAIPlugin = class extends import_obsidian9.Plugin {
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
      id: "convert-folder",
      name: "\u8F6C\u6362\u6587\u4EF6\u5939\u5185\u6240\u6709\u6587\u4EF6",
      callback: () => {
        this.chooseFolderAndConvert();
      }
    });
  }
  /**
   * 注册右键菜单
   */
  registerContextMenu() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof import_obsidian9.TFile && ConversionService.isFileSupported(file.path)) {
          menu.addItem((item) => {
            item.setTitle("\u8F6C\u6362\u4E3AMarkdown").setIcon("wand").onClick(async () => {
              await this.handleConvertFile(file);
            });
          });
        }
        if (file instanceof import_obsidian9.TFile) {
          const ext = file.extension?.toLowerCase?.() || "";
          const outExt = this.settings.outputSettings.outputExtension.toLowerCase();
          const outDir = (this.settings.outputSettings.outputDir || "").replace(/^\/+/, "");
          const parentPath = file.parent?.path || "";
          const inOutputDir = outDir && (parentPath === outDir || parentPath.startsWith(outDir + "/"));
          const isOutputMarkdown = ext === outExt && inOutputDir;
          if (isOutputMarkdown) {
            menu.addItem((item) => {
              item.setTitle("\u91CD\u8BD5\u5931\u8D25\u9875\uFF08\u8F93\u51FA\u6587\u4EF6\uFF09").setIcon("refresh-ccw").onClick(() => {
                this.conversionService.retryFailedPagesFromOutput(file.path);
              });
            });
            menu.addItem((item) => {
              item.setTitle("\u91CD\u8BD5\u6307\u5B9A\u9875\uFF08\u8F93\u51FA\u6587\u4EF6\uFF09").setIcon("rotate-ccw").onClick(() => {
                const pageStr = prompt("\u8BF7\u8F93\u5165\u8981\u91CD\u8BD5\u7684\u9875\u7801\uFF1A");
                const pageNum = pageStr ? parseInt(pageStr) : NaN;
                if (!isNaN(pageNum) && pageNum > 0) {
                  this.conversionService.retrySinglePageFromOutput(file.path, void 0, pageNum);
                }
              });
            });
          }
        }
        if (file instanceof import_obsidian9.TFolder) {
          menu.addItem((item) => {
            item.setTitle("\u8F6C\u6362\u6B64\u6587\u4EF6\u5939\u5185\u6240\u6709\u6587\u4EF6").setIcon("folder").onClick(() => {
              this.convertFolder(file.path);
            });
          });
        }
      })
    );
  }
  /**
   * 统一的文件转换处理器
   * 根据上下文决定是插入到编辑器还是创建新文件
   */
  async handleConvertFile(file) {
    if (!this.conversionService.validateConfig()) {
      new import_obsidian9.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
      this.openSettings();
      return;
    }
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian9.MarkdownView);
    if (activeView && activeView.editor) {
      const editor = activeView.editor;
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      const linkInfo = this.extractImageAtCursor(line, cursor.ch);
      if (linkInfo) {
        const currentFile = activeView.file;
        const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, currentFile?.path || "");
        if (targetFile && targetFile.path === file.path) {
          await this.convertLinkInEditor(linkInfo, editor, activeView, cursor.line);
          return;
        }
      }
    }
    await this.convertFile(file.path);
  }
  /**
   * 从光标位置提取文件链接路径
   * 支持 ![[image.png]]、![alt](image.png)、[[file.pdf]] 和 [title](file.pdf) 格式
   */
  extractImageAtCursor(line, ch) {
    const wikiImageRegex = /!\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiImageRegex.exec(line)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (ch >= start && ch <= end) {
        return {
          path: match[1].split("|")[0].trim(),
          // 去掉可能的别名
          start,
          end,
          format: "wiki"
        };
      }
    }
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((match = mdImageRegex.exec(line)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (ch >= start && ch <= end) {
        return {
          path: match[2].trim(),
          start,
          end,
          format: "markdown"
        };
      }
    }
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = wikiLinkRegex.exec(line)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (ch >= start && ch <= end) {
        return {
          path: match[1].split("|")[0].trim(),
          start,
          end,
          format: "wiki"
        };
      }
    }
    const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    while ((match = mdLinkRegex.exec(line)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (ch >= start && ch <= end) {
        return {
          path: match[2].trim(),
          start,
          end,
          format: "markdown"
        };
      }
    }
    return null;
  }
  /**
   * 转换编辑器中的链接文件（图片或PDF）为Markdown文本
   * 在编辑器中直接插入到链接下方
   */
  async convertLinkInEditor(linkInfo, editor, view, lineNum) {
    try {
      if (!this.conversionService.validateConfig()) {
        new import_obsidian9.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
        this.openSettings();
        return;
      }
      new import_obsidian9.Notice("\u6B63\u5728\u8F6C\u6362\u6587\u4EF6...", 2e3);
      const currentFile = view.file;
      const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, currentFile?.path || "");
      if (!(targetFile instanceof import_obsidian9.TFile)) {
        new import_obsidian9.Notice(`\u627E\u4E0D\u5230\u6587\u4EF6: ${linkInfo.path}
\u5F53\u524D\u6587\u4EF6: ${currentFile?.path || "\u672A\u77E5"}`, 5e3);
        console.error("\u6587\u4EF6\u8DEF\u5F84\u89E3\u6790\u5931\u8D25:", {
          linkPath: linkInfo.path,
          sourcePath: currentFile?.path,
          resolvedFile: targetFile
        });
        return;
      }
      if (!ConversionService.isFileSupported(targetFile.path)) {
        new import_obsidian9.Notice(`\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u683C\u5F0F: ${targetFile.extension}`, 5e3);
        return;
      }
      const { FileProcessor: FileProcessor2 } = await Promise.resolve().then(() => (init_file_processor(), file_processor_exports));
      const fileData = await FileProcessor2.processFile(targetFile.path, this.app);
      const prompt2 = this.settings.conversionPrompt || "\u5C06\u6587\u4EF6\u4E2D\u7684\u5185\u5BB9\u8F6C\u6362\u4E3AMarkdown\u683C\u5F0F";
      const result = await this.aiService.convertFile(fileData, prompt2);
      if (result.success && result.markdown) {
        const insertLine = lineNum + 1;
        const insertText = `
${result.markdown}
`;
        editor.replaceRange(insertText, { line: insertLine, ch: 0 });
        new import_obsidian9.Notice("\u8F6C\u6362\u6210\u529F\uFF01", 3e3);
      } else {
        new import_obsidian9.Notice(`\u8F6C\u6362\u5931\u8D25: ${result.error || "\u672A\u77E5\u9519\u8BEF"}`, 5e3);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      new import_obsidian9.Notice(`\u8F6C\u6362\u5931\u8D25: ${errorMessage}`, 5e3);
      console.error("\u8F6C\u6362\u6587\u4EF6\u5931\u8D25:", error);
    }
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
   * 选择文件夹并批量转换
   */
  chooseFolderAndConvert() {
    const folders = [];
    const all = this.app.vault.getAllLoadedFiles();
    all.forEach((f) => {
      if (f instanceof import_obsidian9.TFolder)
        folders.push(f);
    });
    new class FolderSuggest extends import_obsidian9.FuzzySuggestModal {
      constructor(plugin, items) {
        super(plugin.app);
        this.plugin = plugin;
        this.items = items;
        this.setPlaceholder("\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u5939\u8FDB\u884C\u6279\u91CF\u8F6C\u6362...");
      }
      getItems() {
        return this.items;
      }
      getItemText(item) {
        return item.path;
      }
      onChooseItem(item) {
        this.plugin.convertFolder(item.path);
      }
    }(this, folders).open();
  }
  /**
   * 批量转换一个文件夹内的所有受支持文件（包含子文件夹）
   */
  async convertFolder(folderPath) {
    if (!this.conversionService.validateConfig()) {
      new import_obsidian9.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
      this.openSettings();
      return;
    }
    const files = [];
    const root = this.app.vault.getAbstractFileByPath(folderPath);
    const walk = (node) => {
      if (!node)
        return;
      if (node instanceof import_obsidian9.TFile) {
        if (ConversionService.isFileSupported(node.path))
          files.push(node.path);
      } else if (node instanceof import_obsidian9.TFolder) {
        node.children.forEach((ch) => walk(ch));
      }
    };
    walk(root);
    if (files.length === 0) {
      new import_obsidian9.Notice("\u8BE5\u6587\u4EF6\u5939\u5185\u6CA1\u6709\u53EF\u8F6C\u6362\u7684\u6587\u4EF6", 3e3);
      return;
    }
    new import_obsidian9.Notice(`\u5F00\u59CB\u6279\u91CF\u8F6C\u6362\uFF0C\u5171 ${files.length} \u4E2A\u6587\u4EF6...`, 3e3);
    await this.convertFiles(files);
  }
  /**
   * 转换文件
   * 
   * @param filePath 文件路径
   */
  async convertFile(filePath) {
    if (!this.conversionService.validateConfig()) {
      new import_obsidian9.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
      this.openSettings();
      return;
    }
    const result = await this.conversionService.convertFile(filePath);
    if (result.success) {
      new import_obsidian9.Notice(`\u8F6C\u6362\u6210\u529F\uFF01\u6587\u4EF6\u5DF2\u4FDD\u5B58\u5230: ${result.outputPath}`, 5e3);
    } else {
      new import_obsidian9.Notice(`\u8F6C\u6362\u5931\u8D25: ${result.error}`, 5e3);
    }
  }
  /**
   * 批量转换文件
   * 
   * @param filePaths 文件路径数组
   */
  async convertFiles(filePaths) {
    if (!this.conversionService.validateConfig()) {
      new import_obsidian9.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6EAI\u63D0\u4F9B\u5546", 5e3);
      this.openSettings();
      return;
    }
    const supportedFiles = filePaths.filter(
      (path) => ConversionService.isFileSupported(path)
    );
    if (supportedFiles.length === 0) {
      new import_obsidian9.Notice("\u6CA1\u6709\u652F\u6301\u7684\u6587\u4EF6", 3e3);
      return;
    }
    const { BatchProgressModal: BatchProgressModal2 } = await Promise.resolve().then(() => (init_batch_progress_modal(), batch_progress_modal_exports));
    const batch = new BatchProgressModal2(this.app);
    batch.open();
    batch.setTotals(supportedFiles.length);
    const results = await this.conversionService.convertFiles(supportedFiles, ({ current, total, message }) => {
      batch.updateProgress(current);
      batch.setStatus(`${message} (${current}/${total})`);
    });
    batch.close();
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;
    new import_obsidian9.Notice(
      `\u6279\u91CF\u8F6C\u6362\u5B8C\u6210\uFF01\u6210\u529F: ${successCount}, \u5931\u8D25: ${failCount}`,
      5e3
    );
  }
  /**
   * 打开设置
   */
  openSettings() {
    new import_obsidian9.Notice("\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u627E\u5230 Hand Markdown AI \u63D2\u4EF6\u8FDB\u884C\u914D\u7F6E", 5e3);
  }
  toggleModel() {
    const enabledModels = Object.entries(this.settings.models).filter(([_, config]) => config.enabled).map(([id, _]) => id);
    if (enabledModels.length === 0) {
      new import_obsidian9.Notice("\u6CA1\u6709\u542F\u7528\u7684\u6A21\u578B\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E", 5e3);
      return;
    }
    const currentIndex = enabledModels.indexOf(this.settings.currentModel);
    const nextIndex = (currentIndex + 1) % enabledModels.length;
    const nextModel = enabledModels[nextIndex];
    this.settings.currentModel = nextModel;
    this.saveSettings();
    const modelName = this.settings.models[nextModel]?.name || nextModel;
    new import_obsidian9.Notice(`\u5DF2\u5207\u6362\u5230\u6A21\u578B: ${modelName}`, 3e3);
  }
};
