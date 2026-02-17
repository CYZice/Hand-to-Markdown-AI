import { App, Notice, requestUrl } from "obsidian";
import { MODEL_CATEGORIES, SYSTEM_PROMPTS } from "../constants";
import { DEFAULT_SETTINGS } from "../defaults";
import type { APIModelConfig, ChatMessage, ConversionResult, FileData, ImageData, PluginSettings, TextContext } from "../types";

/**
 * AI 服务类
 * 负责与 AI API 进行通信，支持多种模型类型和文件转换功能
 */
export class AIService {
    private settings: PluginSettings;
    private app: App;
    private requestQueue: unknown[] = [];
    private isProcessing: boolean = false;

    constructor(settings: PluginSettings, app: App) {
        this.settings = settings;
        this.app = app;
    }

    updateSettings(settings: PluginSettings): void {
        this.settings = settings;
    }

    async resolveConfig(config: APIModelConfig): Promise<APIModelConfig> {
        if (config.apiKey && config.apiKey.startsWith("secret:")) {
            const secretId = config.apiKey.substring(7);

            let secretStorage = (this.app as any).secretStorage;
            if (!secretStorage) {
                if ((this.app as any).keychain) {
                    secretStorage = (this.app as any).keychain;
                } else if ((window as any).secretStorage) {
                    secretStorage = (window as any).secretStorage;
                } else if ((this.app as any).vault?.secretStorage) {
                    secretStorage = (this.app as any).vault.secretStorage;
                }
            }

            if (secretStorage && (typeof secretStorage.get === "function" || typeof secretStorage.getSecret === "function")) {
                try {
                    const key = typeof secretStorage.get === "function"
                        ? await secretStorage.get(secretId)
                        : await secretStorage.getSecret(secretId);
                    if (key) {
                        config.apiKey = key;
                    }
                } catch (e) {
                    console.error(`Failed to load key ${secretId} from secret storage`, e);
                }
            }
        }
        return config;
    }

    async getCurrentModelConfig(): Promise<APIModelConfig> {
        const currentModelId = this.settings.currentModel;
        if (!currentModelId) {
            throw new Error("未选择当前模型");
        }

        const modelConfig = this.settings.models[currentModelId];
        if (!modelConfig || !modelConfig.enabled) {
            throw new Error(`模型 ${currentModelId} 未启用或不存在`);
        }

        const providerConfig = this.settings.providers[modelConfig.provider];
        if (!providerConfig || !providerConfig.enabled) {
            throw new Error(`供应商 ${modelConfig.provider} 未启用或不存在`);
        }

        return this.resolveConfig({
            apiKey: providerConfig.apiKey,
            baseUrl: providerConfig.baseUrl,
            model: modelConfig.actualModel || modelConfig.model || modelConfig.id
        });
    }

    /**
     * 测试当前 Provider/Model 的 API 连接（对齐 Markdown-Next-AI）
     */
    async testConnection(): Promise<{ success: boolean; message?: string }> {
        try {
            const config = await this.getCurrentModelConfig();
            if (!config.apiKey || !config.apiKey.trim()) {
                return { success: false, message: "未配置 API Key" };
            }

            const url = this.buildApiUrl(config.baseUrl, "/chat/completions");
            const response = await requestUrl({
                url: url,
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
        } catch (error: any) {
            return { success: false, message: error?.message || String(error) };
        }
    }

    isVisionModel(model?: string): boolean {
        const currentModelId = this.settings.currentModel;
        const modelConfig = this.settings.models[currentModelId];

        if (!modelConfig) return false;

        let category = modelConfig.category;
        if (!category && modelConfig.type) {
            category = modelConfig.type === "image" ? MODEL_CATEGORIES.IMAGE : MODEL_CATEGORIES.TEXT;
        }

        return category === MODEL_CATEGORIES.VISION;
    }

    isThinkingModel(model: string | null = null): boolean {
        const currentModelId = this.settings.currentModel;
        const modelConfig = this.settings.models[currentModelId];

        if (!modelConfig) return false;

        let category = modelConfig.category;
        if (!category && modelConfig.type) {
            category = modelConfig.type === "image" ? MODEL_CATEGORIES.IMAGE : MODEL_CATEGORIES.TEXT;
        }

        return category === MODEL_CATEGORIES.THINKING;
    }

    normalizeBaseUrl(url: string): string {
        if (!url) return "";
        return url.replace(/\/$/, "");
    }

    buildApiUrl(baseUrlInput: string, endpoint: string): string {
        const baseUrl = this.normalizeBaseUrl(baseUrlInput);
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

    private normalizeImageUrl(input: { base64?: string; url?: string; mimeType?: string; type?: string }): string {
        const raw = input.base64 || input.url || "";
        if (!raw) return "";
        if (raw.startsWith("data:")) return raw;
        if (/^https?:\/\//i.test(raw)) return raw;
        const mimeType = input.mimeType || input.type || "image/png";
        return `data:${mimeType};base64,${raw}`;
    }

    getMaxTokens(mode: string): number {
        return this.settings.maxTokens || DEFAULT_SETTINGS.maxTokens;
    }

    async sendRequest(
        mode: string,
        context: TextContext,
        prompt: string = "",
        images: ImageData[] = [],
        chatHistory: ChatMessage[] = [],
        onStream: ((data: { content: string; thinking: string; fullContent: string; isComplete: boolean }) => void) | null = null
    ): Promise<{ content: string; thinking?: string; usage: Record<string, unknown>; imageData?: unknown }> {
        const config = await this.getCurrentModelConfig();

        if (!config.apiKey) {
            throw new Error("请先配置API Key");
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
                throw new Error("不支持图片生成模型，请选择文本生成模型进行文本修改。");
            }
            return this.handleImageGeneration(prompt, config, context.cursorPosition);
        }

        const isThinking = category === MODEL_CATEGORIES.THINKING || this.isThinkingModel(config.model);
        const isStreaming = onStream && typeof onStream === "function";
        const isMultimodal = category === MODEL_CATEGORIES.MULTIMODAL;
        const isVision = category === MODEL_CATEGORIES.VISION || this.isVisionModel(config.model);

        if (images && images.length > 0 && !(isMultimodal || isVision)) {
            new Notice(`当前模型 ${config.model} 不支持图片和附件，请切换到多模态模型或视觉模型`);
            images = [];
        }

        let systemPrompt = SYSTEM_PROMPTS[mode] || "";

        let userPrompt = "";
        if (mode === "continue") {
            if (context.selectedText && context.selectedText.trim()) {
                userPrompt = `需要修改的完整内容：${context.selectedText}\n\n修改要求：${prompt}`;
            } else {
                userPrompt = `以下是光标前的上下文内容：\n${context.beforeText}\n\n请从光标位置开始续写，只生成新内容，不要重复上述内容。续写要求：${prompt}`;
            }
        } else {
            userPrompt = `上下文：${context.beforeText}\n\n选中文本：${context.selectedText}\n\n后续内容：${context.afterText}`;
            if (prompt) {
                userPrompt += `\n\n特殊要求：${prompt}`;
            }
        }

        if (context.additionalContext && context.additionalContext.trim()) {
            userPrompt += `\n\n【重要提示：以下是必须参考的文档内容，请务必基于这些内容进行回复，不得忽略】\n\n=== 必读参考文档 ===\n${context.additionalContext}\n=== 参考文档结束 ===\n\n【请确保你的回复完全基于上述文档内容，必须引用和使用文档中的信息】`;
        }

        if (context.contextContent && context.contextContent.trim()) {
            userPrompt += `\n\n【重要提示：以下是必须参考的文档内容，请务必基于这些内容进行回复，不得忽略】\n\n=== 必读参考文档 ===\n${context.contextContent}\n=== 参考文档结束 ===\n\n【请确保你的回复完全基于上述文档内容，必须引用和使用文档中的信息】`;
        }

        const apiUrl = this.buildApiUrl(config.baseUrl, "/chat/completions");

        const messages: ChatMessage[] = [
            { role: "system", content: systemPrompt }
        ];

        if (chatHistory && chatHistory.length > 0) {
            chatHistory.forEach(msg => {
                if (msg.role === "user" || msg.role === "assistant") {
                    messages.push({
                        role: msg.role,
                        content: msg.content
                    });
                }
            });
        }

        if (images && images.length > 0) {
            userPrompt += `\n\n附加图片：共${images.length}张图片`;

            const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
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
                content: content
            });
        } else {
            messages.push({
                role: "user",
                content: userPrompt
            });
        }

        const requestBody: Record<string, unknown> = {
            model: config.model,
            messages: messages,
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

            const response = await requestUrl({
                url: apiUrl,
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
                throw: false
            });

            if (response.status !== 200) {
                const errorText = response.text;

                if (response.status === 429) {
                    if (errorText.includes("quota") || errorText.includes("insufficient_quota")) {
                        throw new Error("API配额已用完，请检查您的账户余额和计费详情。");
                    } else {
                        throw new Error("API请求频率过高，请稍后再试。");
                    }
                }

                throw new Error(`API请求失败: ${response.status} ${errorText}`);
            }

            const data = response.json;

            if (!data.choices || data.choices.length === 0) {
                throw new Error("API返回数据格式错误：缺少choices数组");
            }

            const choice = data.choices[0];
            if (!choice.message) {
                throw new Error("API返回数据格式错误：缺少message对象");
            }

            let content = "";
            if (choice.message.content) {
                content = choice.message.content.trim();
            } else if (choice.text) {
                content = choice.text.trim();
            } else if (choice.message.text) {
                content = choice.message.text.trim();
            } else {
                throw new Error("API返回数据格式错误：找不到内容字段");
            }

            const usage = data.usage || {};

            return {
                content: content,
                usage: usage
            };
        } catch (error) {
            throw error;
        }
    }

    async handleStreamRequest(
        apiUrl: string,
        headers: Record<string, string>,
        requestBody: Record<string, unknown>,
        onStream: (data: { content: string; thinking: string; fullContent: string; isComplete: boolean }) => void
    ): Promise<{ content: string; thinking: string; usage: Record<string, unknown> }> {
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();

                if (response.status === 429) {
                    if (errorText.includes("quota") || errorText.includes("insufficient_quota")) {
                        throw new Error("API配额已用完，请检查您的账户余额和计费详情。");
                    } else {
                        throw new Error("API请求频率过高，请稍后再试。");
                    }
                }

                throw new Error(`API请求失败: ${response.status} ${errorText}`);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();

            let buffer = "";
            let thinking = "";
            let streamedContent = "";
            let fullContent = "";

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

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
                                        thinking: thinking,
                                        fullContent: fullContent,
                                        isComplete: false
                                    });
                                }

                                if (delta?.content) {
                                    const contentChunk = delta.content;
                                    streamedContent += contentChunk;
                                    fullContent += contentChunk;
                                    onStream({
                                        content: streamedContent,
                                        thinking: thinking,
                                        fullContent: fullContent,
                                        isComplete: false
                                    });
                                }

                                if (delta?.text) {
                                    const textChunk = delta.text;
                                    streamedContent += textChunk;
                                    fullContent += textChunk;
                                    onStream({
                                        content: streamedContent,
                                        thinking: thinking,
                                        fullContent: fullContent,
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
                    thinking: thinking,
                    fullContent: fullContent,
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

    async handleImageGeneration(
        prompt: string,
        config: APIModelConfig,
        cursorPosition: { line: number; ch: number } | null = null
    ): Promise<{ content: string; imageData: unknown; usage: Record<string, unknown> }> {
        if (!prompt || !prompt.trim()) {
            throw new Error("请输入图片描述");
        }

        const apiUrl = this.buildApiUrl(config.baseUrl, "/images/generations");
        const model = config.model;

        const requestBody: Record<string, unknown> = {
            model: model,
            prompt: prompt.trim(),
            response_format: "b64_json",
            n: 1,
            size: (this.settings as any).imageGenerationSize || "1024x1024"
        };

        if (model.includes("dall-e") && model === "dall-e-3") {
            requestBody.quality = "standard";
            requestBody.style = "vivid";
        }

        try {
            const response = await requestUrl({
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
                        throw new Error("API配额已用完，请检查您的账户余额和计费详情。");
                    } else {
                        throw new Error("API请求频率过高，请稍后再试。");
                    }
                }

                if (response.status === 401) {
                    throw new Error("API密钥无效，请检查配置。");
                }

                throw new Error(`图片生成API请求失败: ${response.status} ${errorText}`);
            }

            const data = response.json;

            if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
                throw new Error("图片生成API返回数据格式错误");
            }

            const imageData = data.data[0];
            let base64Data: string | null = null;

            if (imageData.b64_json) {
                base64Data = imageData.b64_json;
            } else {
                throw new Error("图片生成API返回数据中缺少图片内容");
            }

            if (!base64Data) {
                throw new Error("图片生成API返回数据中缺少图片内容");
            }

            try {
                const fileName = `image_${Date.now()}.png`;
                const savePath = (this.settings as any).imageSavePath || "Extras/附件";
                const fullPath = savePath + "/" + fileName;

                try {
                    const folder = this.app.vault.getAbstractFileByPath(savePath);
                    if (!folder) {
                        await this.app.vault.createFolder(savePath);
                    }
                } catch (e) {
                    try {
                        await (this.app.vault.adapter as any).mkdir(savePath);
                    } catch (mkdirError) {
                        console.error("创建目录失败:", mkdirError);
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
                    imageData: imageData,
                    usage: {}
                };
            } catch (saveError) {
                console.error("保存图片失败:", saveError);
                throw new Error("图片保存失败");
            }
        } catch (error) {
            throw error;
        }
    }

    async convertFile(
        fileData: FileData,
        prompt?: string,
        onStream?: (data: { content: string; isComplete: boolean }) => void
    ): Promise<ConversionResult> {
        const startTime = Date.now();

        try {
            const config = await this.getCurrentModelConfig();

            if (!config.apiKey) {
                throw new Error("请先配置API Key");
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
                throw new Error(`当前模型 ${config.model} 不支持图片识别，请切换到多模态模型或视觉模型`);
            }

            const conversionPrompt = prompt || this.settings.conversionPrompt || SYSTEM_PROMPTS.convert;

            const apiUrl = this.buildApiUrl(config.baseUrl, "/chat/completions");

            const messages: ChatMessage[] = [
                { role: "system", content: conversionPrompt }
            ];

            const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
                { type: "text", text: "请将图片中的手写笔记转换为结构化的Markdown格式。" }
            ];

            content.push({
                type: "image_url",
                image_url: {
                    url: this.normalizeImageUrl(fileData)
                }
            });

            messages.push({
                role: "user",
                content: content
            });

            const requestBody: Record<string, unknown> = {
                model: config.model,
                messages: messages,
                temperature: 0.3,
                max_tokens: this.settings.maxTokens || 4096
            };

            // 如果提供了 onStream 回调，启用流式输出
            if (onStream && typeof onStream === "function") {
                requestBody.stream = true;
                return await this.convertFileStream(apiUrl, config, requestBody, fileData, startTime, onStream);
            }

            const response = await requestUrl({
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
                        throw new Error("API配额已用完，请检查您的账户余额和计费详情。");
                    } else {
                        throw new Error("API请求频率过高，请稍后再试。");
                    }
                }

                throw new Error(`API请求失败: ${response.status} ${errorText}`);
            }

            const data = response.json;

            if (!data.choices || data.choices.length === 0) {
                throw new Error("API返回数据格式错误：缺少choices数组");
            }

            const choice = data.choices[0];
            if (!choice.message) {
                throw new Error("API返回数据格式错误：缺少message对象");
            }

            let markdown = "";
            if (choice.message.content) {
                markdown = choice.message.content.trim();
            } else if (choice.text) {
                markdown = choice.text.trim();
            } else if (choice.message.text) {
                markdown = choice.message.text.trim();
            } else {
                throw new Error("API返回数据格式错误：找不到内容字段");
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
                tokensUsed: usage.total_tokens as number
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("文件转换失败:", error);

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
    async convertImageBatch(
        files: FileData[],
        prompt?: string
    ): Promise<ConversionResult> {
        const startTime = Date.now();

        try {
            const config = await this.getCurrentModelConfig();
            if (!config.apiKey) {
                throw new Error("请先配置API Key");
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
                throw new Error(`当前模型 ${config.model} 不支持图片识别，请切换到多模态模型或视觉模型`);
            }

            const conversionPrompt = prompt || this.settings.conversionPrompt || SYSTEM_PROMPTS.convert;
            const apiUrl = this.buildApiUrl(config.baseUrl, "/chat/completions");

            const messages: ChatMessage[] = [
                { role: "system", content: conversionPrompt }
            ];

            const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
                { type: "text", text: "请将以下图片（可能是连续页）中的手写笔记合并转换为结构化的Markdown。" }
            ];

            files.forEach(file => {
                content.push({
                    type: "image_url",
                    image_url: { url: this.normalizeImageUrl(file) }
                });
            });

            messages.push({ role: "user", content });

            const requestBody: Record<string, unknown> = {
                model: config.model,
                messages,
                temperature: 0.3,
                max_tokens: this.settings.maxTokens || 4096
            };

            const response = await requestUrl({
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
                        throw new Error("API配额已用完，请检查您的账户余额和计费详情。");
                    } else {
                        throw new Error("API请求频率过高，请稍后再试。");
                    }
                }
                throw new Error(`API请求失败: ${response.status} ${errorText}`);
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
                tokensUsed: usage.total_tokens as number
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
    private async convertFileStream(
        apiUrl: string,
        config: APIModelConfig,
        requestBody: Record<string, unknown>,
        fileData: FileData,
        startTime: number,
        onStream: (data: { content: string; isComplete: boolean }) => void
    ): Promise<ConversionResult> {
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
                    throw new Error(errorText.includes("quota") ? "API配额已用完" : "API请求频率过高");
                }
                throw new Error(`API请求失败: ${response.status} ${errorText}`);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let streamedContent = "";

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") break;

                            try {
                                const parsed = JSON.parse(data);
                                const delta = parsed.choices?.[0]?.delta;

                                if (delta?.content) {
                                    streamedContent += delta.content;
                                    onStream({ content: streamedContent, isComplete: false });
                                }
                            } catch (e) {
                                // 忽略解析错误
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

    async convertFiles(
        fileDataList: FileData[],
        prompt?: string,
        onProgress?: (current: number, total: number, fileName: string) => void
    ): Promise<ConversionResult[]> {
        const results: ConversionResult[] = [];
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

    validateConfig(): boolean {
        try {
            const currentModelId = this.settings.currentModel;
            if (!currentModelId) return false;

            const modelConfig = this.settings.models[currentModelId];
            if (!modelConfig || !modelConfig.enabled) return false;

            const providerConfig = this.settings.providers[modelConfig.provider];
            if (!providerConfig || !providerConfig.enabled) return false;

            const apiKey = providerConfig.apiKey;
            const baseUrl = providerConfig.baseUrl;
            const model = modelConfig.actualModel || modelConfig.model || modelConfig.id;

            return !!(apiKey && baseUrl && model);
        } catch (error) {
            return false;
        }
    }
}
