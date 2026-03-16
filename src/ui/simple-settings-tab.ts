import { App, FuzzySuggestModal, Modal, Notice, PluginSettingTab, Setting, TAbstractFile, TFolder, requestUrl, type RequestUrlParam } from "obsidian";
import { MODEL_CATEGORIES, PROVIDER_TYPES } from "../constants";
import { DEFAULT_CONVERSION_PROMPT } from "../defaults";
import type HandMarkdownAIPlugin from "../main";
import type { APIModelConfig, ModelCategory } from "../types";

class ModelInputSuggest {
    private inputEl: HTMLInputElement;
    private popup: HTMLElement | null = null;
    private items: { id: string; name: string }[] = [];
    private onSelect: (item: { id: string; name: string }) => void;

    constructor(inputEl: HTMLInputElement, items: { id: string; name: string }[], onSelect: (item: { id: string; name: string }) => void) {
        this.inputEl = inputEl;
        this.items = items;
        this.onSelect = onSelect;

        this.inputEl.addEventListener("input", this.onInput.bind(this));
        this.inputEl.addEventListener("focus", this.onInput.bind(this));
        this.inputEl.addEventListener("blur", () => setTimeout(() => this.close(), 200));
    }

    setItems(items: { id: string; name: string }[]) {
        this.items = items;
    }

    open() {
        this.onInput();
    }

    private onInput() {
        const value = this.inputEl.value.toLowerCase();
        const matches = this.items.filter(i =>
            i.id.toLowerCase().includes(value) ||
            i.name.toLowerCase().includes(value)
        );

        this.close();
        if (matches.length > 0) {
            this.showSuggestions(matches);
        }
    }

    private showSuggestions(matches: { id: string; name: string }[]) {
        const rect = this.inputEl.getBoundingClientRect();
        this.popup = document.body.createEl("div");

        this.popup.className = "menu";
        Object.assign(this.popup.style, {
            position: "fixed",
            top: `${rect.bottom + 5}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: "var(--layer-menu)",
            display: "block"
        });

        matches.forEach(item => {
            const el = this.popup!.createEl("div", { cls: "menu-item" });
            el.createEl("div", { cls: "menu-item-title", text: item.id });

            el.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onSelect(item);
                this.close();
            });

            el.addEventListener("mouseenter", () => {
                el.addClass("selected");
            });
            el.addEventListener("mouseleave", () => {
                el.removeClass("selected");
            });
        });
    }

    close() {
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }
    }
}

/**
 * 简化版设置界面 - 只保留核心必要设置
 */
export class SimpleSettingsTab extends PluginSettingTab {
    plugin: HandMarkdownAIPlugin;

    constructor(app: App, plugin: HandMarkdownAIPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass("ink2vault-settings");

        this.ensureCurrentModelValid();

        // 标题和状态
        this.addHeader(containerEl);

        // 供应商与模型
        this.addProviderSection(containerEl);
        this.addModelSection(containerEl);
        this.addPdfSettings(containerEl);
        this.addOutputSettings(containerEl);
        this.addPromptSettings(containerEl);

        // 高级选项（折叠）
        this.addAdvancedOptions(containerEl);

        // 底部操作
        this.addFooter(containerEl);
    }

    private addHeader(containerEl: HTMLElement) {
        containerEl.createEl("h2", { text: "Ink2Vault" });
        containerEl.createEl("p", {
            text: "将 PDF 和手写笔记转换为 Markdown 格式",
            attr: { style: "color: var(--text-muted); margin-bottom: 20px;" }
        });

        // 状态指示器
        const statusDiv = containerEl.createDiv({ attr: { style: "margin-bottom: 20px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;" } });
        const currentModel = this.plugin.settings.currentModel;
        const modelConfig = this.plugin.settings.models[currentModel];
        const provider = modelConfig ? this.plugin.settings.providers[modelConfig.provider] : null;
        const hasApiKey = provider?.apiKey?.trim();
        const canConvertFile = modelConfig?.category === MODEL_CATEGORIES.MULTIMODAL || modelConfig?.category === MODEL_CATEGORIES.VISION;

        const badge = statusDiv.createDiv({ attr: { style: "display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius: 20px; border: 1px solid var(--background-modifier-border); background: var(--background-secondary);" } });
        badge.createSpan({ text: "当前模型:", attr: { style: "opacity:0.7;" } });
        badge.createEl("strong", { text: modelConfig?.name || currentModel });
        if (modelConfig?.provider) {
            const prov = statusDiv.createDiv({ attr: { style: "padding:6px 10px; border-radius: 16px; border:1px solid var(--background-modifier-border); background: var(--background-secondary); font-size:12px;" } });
            prov.setText(`Provider: ${modelConfig.provider}${provider?.name ? ` (${provider.name})` : ''}`);
        }
        const capability = statusDiv.createDiv({ attr: { style: "padding:6px 10px; border-radius: 16px; border:1px solid var(--background-modifier-border); background: var(--background-secondary); font-size:12px;" } });
        capability.setText(canConvertFile ? "支持转换（识图）" : "⚠️ 不支持转换（需多模态/视觉模型）");
        const hint = statusDiv.createDiv({ attr: { style: "flex-basis:100%; color: var(--text-muted);" } });
        hint.setText(hasApiKey ? "右键文件/文件夹可一键转换；命令面板可搜索相关命令。" : "⚠️ 需要配置：请先填写 API Key");

        containerEl.createEl("hr");
    }

    private addProviderSection(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "供应商、API设置" });

        new Setting(containerEl)
            .setName("使用 Obsidian Keychain 安全存储")
            .setDesc("开启后，新配置的 API Key 将存储在系统钥匙串中 (推荐)")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useKeychain ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.useKeychain = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        await this.plugin.migrateKeysToKeychain();
                        this.display();
                    }
                }));

        const providerHeader = containerEl.createEl("div", {
            attr: { style: "display:flex;justify-content:space-between;align-items:center;margin-top:10px;margin-bottom:8px;" }
        });
        providerHeader.createEl("h4", { text: "供应商" });
        providerHeader.createEl("button", {
            text: "+ 添加供应商",
            attr: { style: "background: var(--interactive-accent); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;" }
        }).onclick = () => this.showAddProviderModal();

        const providerTable = containerEl.createEl("table", { cls: "markdown-next-ai-config-table" });
        const thead = providerTable.createEl("thead").createEl("tr");
        thead.createEl("th", { text: "ID / Name" });
        thead.createEl("th", { text: "Type" });
        thead.createEl("th", { text: "Actions" });

        const tbody = providerTable.createEl("tbody");
        Object.keys(this.plugin.settings.providers).forEach(providerId => {
            const provider = this.plugin.settings.providers[providerId];
            const row = tbody.createEl("tr");
            row.createEl("td", { text: providerId });
            row.createEl("td", { text: provider.type || "openai" });

            const actionsCell = row.createEl("td", { cls: "markdown-next-ai-actions-cell" });
            if (["openai", "anthropic", "gemini", "deepseek", "ollama"].includes(providerId)) {
                const editBtn = actionsCell.createEl("button", { text: "编辑" });
                editBtn.onclick = () => this.showEditProviderModal(providerId);
            } else {
                const editBtn = actionsCell.createEl("button", { text: "编辑" });
                editBtn.onclick = () => this.showEditProviderModal(providerId);
                const deleteBtn = actionsCell.createEl("button", { text: "删除" });
                deleteBtn.onclick = async () => {
                    if (confirm(`确定要删除供应商 "${providerId}" ？这将同时删除该供应商下的所有模型。`)) {
                        Object.keys(this.plugin.settings.models).forEach(modelId => {
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
    }

    private addModelSection(containerEl: HTMLElement) {
        const modelHeader = containerEl.createEl("div", { attr: { style: "display:flex;justify-content:space-between;align-items:center;margin-top:20px;margin-bottom:8px;" } });
        modelHeader.createEl("h4", { text: "模型设置" });
        modelHeader.createEl("button", {
            text: "+ 添加模型",
            attr: { style: "background: var(--interactive-accent); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;" }
        }).onclick = () => this.showAddModelModal();

        const modelTable = containerEl.createEl("table", { cls: "markdown-next-ai-config-table" });
        const mHead = modelTable.createEl("thead").createEl("tr");
        mHead.createEl("th", { text: "ID / Model" });
        mHead.createEl("th", { text: "Provider" });
        mHead.createEl("th", { text: "Enable" });
        mHead.createEl("th", { text: "Actions" });

        const mBody = modelTable.createEl("tbody");
        const modelsList = Object.values(this.plugin.settings.models);

        if (modelsList.length > 0) {
            modelsList.forEach(model => {
                const row = mBody.createEl("tr");
                row.createEl("td", { text: model.model || model.id });
                row.createEl("td", { text: model.provider });

                const enableCell = row.createEl("td", { cls: "markdown-next-ai-enable-cell" });
                const checkbox = enableCell.createEl("input", { type: "checkbox" }) as HTMLInputElement;
                checkbox.checked = !!model.enabled;
                checkbox.onchange = async () => {
                    this.plugin.settings.models[model.id].enabled = checkbox.checked;
                    await this.plugin.saveSettings();
                    if (!checkbox.checked && this.plugin.settings.currentModel === model.id) {
                        const firstEnabled = Object.keys(this.plugin.settings.models).find(id => this.plugin.settings.models[id].enabled);
                        if (firstEnabled) {
                            this.plugin.settings.currentModel = firstEnabled;
                            await this.plugin.saveSettings();
                            this.display();
                        }
                    }
                };

                const mActionsCell = row.createEl("td", { cls: "markdown-next-ai-actions-cell" });
                const editBtn = mActionsCell.createEl("button", { text: "编辑" });
                editBtn.onclick = () => this.showEditModelModal(model.id);
                const deleteBtn = mActionsCell.createEl("button", { text: "删除" });
                deleteBtn.onclick = async () => {
                    if (confirm(`确定要删除模型 "${model.name}" ？`)) {
                        if (this.plugin.settings.currentModel === model.id) {
                            const otherEnabled = Object.keys(this.plugin.settings.models).find(id => id !== model.id && this.plugin.settings.models[id].enabled);
                            this.plugin.settings.currentModel = otherEnabled || "";
                        }
                        delete this.plugin.settings.models[model.id];
                        await this.plugin.saveSettings();
                        this.display();
                    }
                };
            });
        } else {
            const emptyRow = mBody.createEl("tr");
            emptyRow.createEl("td", {
                text: "暂无模型，点击上方按钮添加",
                attr: { colspan: "4", style: "text-align: center; color: var(--text-muted); font-style: italic; padding: 20px;" }
            });
        }

        new Setting(containerEl)
            .setName("当前模型")
            .setDesc("选择当前使用的AI模型")
            .addDropdown(dropdown => {
                const enabledModels = Object.keys(this.plugin.settings.models)
                    .filter(id => this.plugin.settings.models[id].enabled);

                enabledModels.forEach(id => {
                    const model = this.plugin.settings.models[id];
                    dropdown.addOption(id, `${model.name} (${model.provider})`);
                });

                if (!enabledModels.includes(this.plugin.settings.currentModel) && enabledModels.length > 0) {
                    this.plugin.settings.currentModel = enabledModels[0];
                    this.plugin.saveSettings();
                }

                dropdown.setValue(this.plugin.settings.currentModel || "")
                    .onChange(async (value) => {
                        this.plugin.settings.currentModel = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private updateApiKeyDesc(setting: Setting, type: string) {
        const descEl = setting.descEl;
        descEl.empty();
        descEl.createSpan({ text: "请输入 API Key " });

        const links: Record<string, string> = {
            openai: "https://platform.openai.com/api-keys",
            anthropic: "https://console.anthropic.com/",
            gemini: "https://aistudio.google.com/app/apikey",
            deepseek: "https://platform.deepseek.com/api_keys",
            ollama: "https://ollama.com/"
        };

        const link = links[type];

        if (link) {
            descEl.createEl("a", {
                text: "(获取 Key)",
                attr: { href: link, target: "_blank", style: "color: var(--text-accent);" }
            });
        }
    }

    private showAddProviderModal(): void {
        const modal = new Modal(this.app);
        modal.titleEl.setText("添加供应商 (Add Provider)");
        const { contentEl } = modal;

        let id = "";
        let type = "openai";
        let apiKey = "";
        let baseUrl = "";
        let useKeychain = this.plugin.settings.useKeychain ?? true;

        const secretStorage = (this.app as any).secretStorage || (this.app as any).keychain || (window as any).secretStorage || (this.app as any).vault?.secretStorage;
        const hasSecretStorage = secretStorage && (typeof secretStorage.save === "function" || typeof secretStorage.setSecret === "function");
        if (!hasSecretStorage) useKeychain = false;

        new Setting(contentEl)
            .setName("ID / Name")
            .setDesc("唯一的供应商标识符 (例如: my-openai)")
            .addText(text => text
                .setPlaceholder("openai-1")
                .onChange(v => id = v.trim()));

        const typeSetting = new Setting(contentEl)
            .setName("类型 (Type)")
            .setDesc("API 协议类型")
            .addDropdown(dropdown => {
                PROVIDER_TYPES.forEach((t: any) =>
                    dropdown.addOption(t.id, t.name)
                );
                dropdown.setValue(type)
                    .onChange(v => {
                        type = v;
                        this.updateApiKeyDesc(apiKeySetting, type);
                        const defaultUrl = PROVIDER_TYPES.find((p: any) => p.id === v)?.defaultBaseUrl;
                        if (defaultUrl && !baseUrl && baseUrlComp) {
                            baseUrl = defaultUrl;
                            baseUrlComp.setValue(defaultUrl);
                        }
                    });
            });

        const apiKeySetting = new Setting(contentEl)
            .setName("API Key")
            .setDesc("请输入 API Key");

        let apiKeyComp: any;
        apiKeySetting.addText(text => {
            apiKeyComp = text;
            text.inputEl.type = "password";
            text.setPlaceholder(useKeychain ? "将在保存时存储到 Keychain" : "请输入 API Key")
                .onChange(v => apiKey = v.trim());
        });
        this.updateApiKeyDesc(apiKeySetting, type);

        let baseUrlComp: any;
        new Setting(contentEl)
            .setName("Base URL")
            .setDesc("可选：设置自定义 Base URL")
            .addText(text => {
                baseUrlComp = text;
                text.setPlaceholder("https://api.example.com/v1")
                    .setValue(PROVIDER_TYPES.find((p: any) => p.id === type)?.defaultBaseUrl || "")
                    .onChange(v => baseUrl = v.trim());
                baseUrl = PROVIDER_TYPES.find((p: any) => p.id === type)?.defaultBaseUrl || "";
            });

        const btns = contentEl.createEl("div", { attr: { style: "display:flex;justify-content:flex-end;gap:10px;margin-top:15px;" } });
        const cancelBtn = btns.createEl("button", { text: "取消" });
        cancelBtn.onclick = () => modal.close();

        const saveBtn = btns.createEl("button", { text: "保存", cls: "mod-cta" });
        saveBtn.onclick = async () => {
            if (!id) {
                new Notice("ID 不能为空");
                return;
            }
            if (this.plugin.settings.providers[id]) {
                new Notice("该 ID 已存在");
                return;
            }

            this.plugin.settings.providers[id] = {
                name: id,
                type: type as any,
                apiKey: "",
                baseUrl: baseUrl,
                enabled: true
            };

            if (apiKey) {
                if (useKeychain && hasSecretStorage) {
                    const secretId = `ink2vault-api-key-${id}`;
                    try {
                        if (typeof secretStorage.save === "function") {
                            await secretStorage.save(secretId, apiKey);
                        } else {
                            await secretStorage.setSecret(secretId, apiKey);
                        }
                        this.plugin.settings.providers[id].apiKey = `secret:${secretId}`;
                    } catch (e) {
                        console.error("Keychain save failed", e);
                        new Notice("Keychain 保存失败，已使用普通存储");
                        this.plugin.settings.providers[id].apiKey = apiKey;
                    }
                } else {
                    this.plugin.settings.providers[id].apiKey = apiKey;
                }
            }

            await this.plugin.saveSettings();
            this.display();
            modal.close();
        };

        modal.open();
    }

    private showEditProviderModal(providerId: string): void {
        const modal = new Modal(this.app);
        modal.titleEl.setText(`编辑供应商: ${providerId}`);
        const { contentEl } = modal;
        const provider = this.plugin.settings.providers[providerId];

        let type = provider.type || "openai";
        let apiKey = provider.apiKey || "";
        let baseUrl = provider.baseUrl || "";

        let useKeychain = this.plugin.settings.useKeychain ?? true;
        const secretStorage = (this.app as any).secretStorage || (this.app as any).keychain || (window as any).secretStorage || (this.app as any).vault?.secretStorage;
        const hasSecretStorage = secretStorage && (typeof secretStorage.save === "function" || typeof secretStorage.setSecret === "function");

        if (apiKey.startsWith("secret:")) {
            useKeychain = true;
        } else if (!apiKey && (this.plugin.settings.useKeychain ?? true) && hasSecretStorage) {
            useKeychain = true;
        }

        const otherProvidersWithSecrets = Object.entries(this.plugin.settings.providers)
            .filter(([id, p]: [string, any]) => id !== providerId && p.apiKey && p.apiKey.startsWith("secret:"))
            .map(([id, p]: [string, any]) => ({ id, name: p.name || id, secretRef: p.apiKey }));

        const apiKeySetting = new Setting(contentEl)
            .setName("API Key")
            .setDesc("请输入 API Key");

        new Setting(contentEl)
            .setName("类型 (Type)")
            .setDesc("API 协议类型")
            .addDropdown(dropdown => {
                PROVIDER_TYPES.forEach((t: any) =>
                    dropdown.addOption(t.id, t.name)
                );
                dropdown.setValue(type)
                    .onChange(v => {
                        type = v;
                        this.updateApiKeyDesc(apiKeySetting, type);
                    });
            });

        let apiKeyComp: any;
        if (otherProvidersWithSecrets.length > 0) {
            new Setting(contentEl)
                .setName("复用已有 Key")
                .setDesc("选择复用其他供应商已配置的 Keychain 密钥")
                .addDropdown(dropdown => {
                    dropdown.addOption("", "不复用 (默认)");
                    otherProvidersWithSecrets.forEach(p => dropdown.addOption(p.secretRef, `${p.name} (${p.id})`));
                    if (apiKey && apiKey.startsWith("secret:") && otherProvidersWithSecrets.some(p => p.secretRef === apiKey)) {
                        dropdown.setValue(apiKey);
                    }
                    dropdown.onChange(value => {
                        if (value) {
                            apiKey = value;
                            useKeychain = true;
                            if (apiKeyComp) {
                                apiKeyComp.setValue("");
                                apiKeyComp.setPlaceholder(`已复用 ${otherProvidersWithSecrets.find(p => p.secretRef === value)?.name} 的 Key`);
                                apiKeyComp.setDisabled(true);
                            }
                        } else {
                            apiKey = "";
                            if (apiKeyComp) {
                                apiKeyComp.setDisabled(false);
                                apiKeyComp.setPlaceholder(useKeychain ? "将在保存时存储到 Keychain" : "请输入 API Key");
                            }
                        }
                    });
                });
        }

        apiKeySetting.addText(text => {
            apiKeyComp = text;
            text.inputEl.type = "password";

            const isReusing = apiKey.startsWith("secret:") && otherProvidersWithSecrets.some(p => p.secretRef === apiKey);
            if (isReusing) {
                text.setPlaceholder(`已复用 ${otherProvidersWithSecrets.find(p => p.secretRef === apiKey)?.name} 的 Key`);
                text.setDisabled(true);
            } else if (apiKey.startsWith("secret:")) {
                text.setPlaceholder("已存储在 Keychain 中 (修改以覆盖)");
            } else {
                text.setPlaceholder(useKeychain ? "将在保存时存储到 Keychain" : "请输入 API Key");
                text.setValue(apiKey);
            }

            text.onChange(v => {
                apiKey = v.trim();
            });
        });
        this.updateApiKeyDesc(apiKeySetting, type);

        new Setting(contentEl)
            .setName("Base URL")
            .setDesc("可选：设置自定义 Base URL")
            .addText(text => text
                .setPlaceholder("https://api.example.com/v1")
                .setValue(baseUrl)
                .onChange(v => baseUrl = v.trim()));

        const btns = contentEl.createEl("div", { attr: { style: "display:flex;justify-content:flex-end;gap:10px;margin-top:15px;" } });
        btns.createEl("button", { text: "取消" }).onclick = () => modal.close();

        const saveBtn = btns.createEl("button", { text: "保存", cls: "mod-cta" });
        saveBtn.onclick = async () => {
            this.plugin.settings.providers[providerId].name = providerId;
            this.plugin.settings.providers[providerId].type = type as any;
            this.plugin.settings.providers[providerId].baseUrl = baseUrl;

            const isReusing = apiKey.startsWith("secret:") && otherProvidersWithSecrets.some(p => p.secretRef === apiKey);
            if (isReusing) {
                this.plugin.settings.providers[providerId].apiKey = apiKey;
            }
            else if (apiKey && !apiKey.startsWith("secret:")) {
                if (useKeychain && hasSecretStorage) {
                    const secretId = `ink2vault-api-key-${providerId}`;
                    try {
                        if (typeof secretStorage.save === "function") {
                            await secretStorage.save(secretId, apiKey);
                        } else {
                            await secretStorage.setSecret(secretId, apiKey);
                        }
                        this.plugin.settings.providers[providerId].apiKey = `secret:${secretId}`;
                    } catch (e) {
                        new Notice("Keychain 保存失败，已使用普通存储");
                        this.plugin.settings.providers[providerId].apiKey = apiKey;
                    }
                } else {
                    this.plugin.settings.providers[providerId].apiKey = apiKey;
                }
            }
            else if (apiKey === "") {
                this.plugin.settings.providers[providerId].apiKey = "";
            }

            await this.plugin.saveSettings();
            this.display();
            modal.close();
        };

        modal.open();
    }

    private async fetchModels(providerId: string): Promise<{ id: string; name: string }[] | null> {
        const provider = this.plugin.settings.providers[providerId];
        if (!provider) {
            new Notice("Provider not found");
            return null;
        }

        const type = provider.type || "openai";
        let url = "";
        const headers: Record<string, string> = {};

        const tempConfig: APIModelConfig = {
            apiKey: provider.apiKey || "",
            baseUrl: provider.baseUrl || "",
            model: "fetch-models-temp"
        };

        let apiKey = "";
        try {
            const resolvedConfig = await this.plugin.aiService.resolveConfig(tempConfig);
            apiKey = resolvedConfig.apiKey;
        } catch (e) {
            new Notice("Failed to resolve API Key");
            return null;
        }

        if (type === "ollama") {
            let baseUrl = provider.baseUrl || "http://localhost:11434";
            if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
            url = `${baseUrl}/api/tags`;
        } else if (type === "anthropic") {
            url = "https://api.anthropic.com/v1/models";
            if (apiKey) headers["x-api-key"] = apiKey;
            headers["anthropic-version"] = "2023-06-01";
        } else if (type === "gemini") {
            url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        } else {
            let baseUrl = provider.baseUrl || "https://api.openai.com/v1";
            if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
            if (!baseUrl.endsWith("/v1")) baseUrl += "/v1";
            url = `${baseUrl}/models`;
            if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
        }

        try {
            const req: RequestUrlParam = { url, method: "GET", headers, throw: false };
            const resp = await requestUrl(req);
            if (resp.status >= 400) {
                new Notice(`Error fetching models: ${resp.status} ${resp.text.slice(0, 100)}`);
                return null;
            }

            const data = resp.json;
            const models: { id: string; name: string }[] = [];

            if (type === "ollama") {
                if (data.models && Array.isArray(data.models)) {
                    data.models.forEach((m: any) => {
                        models.push({ id: m.name, name: m.name });
                    });
                }
            } else if (type === "gemini") {
                if (data.models && Array.isArray(data.models)) {
                    data.models.forEach((m: any) => {
                        let id = m.name;
                        if (id.startsWith("models/")) id = id.replace("models/", "");
                        models.push({ id, name: m.displayName || id });
                    });
                }
            } else {
                const list = data.data || data.models || [];
                if (Array.isArray(list)) {
                    list.forEach((m: any) => {
                        models.push({ id: m.id, name: m.id });
                    });
                }
            }

            if (models.length === 0) {
                new Notice("No models found in response.");
                return null;
            }

            return models;
        } catch (e: any) {
            new Notice(`Request failed: ${e?.message || String(e)}`);
            return null;
        }
    }

    private showAddModelModal(category: ModelCategory = MODEL_CATEGORIES.MULTIMODAL): void {
        const modal = new Modal(this.app);
        modal.titleEl.setText("添加模型 (Add Model)");
        const { contentEl } = modal;

        let providerId = Object.keys(this.plugin.settings.providers)[0] || "";
        let apiModelId = "";
        let internalId = "";

        let apiModelIdInput: any;
        let internalIdInput: any;
        let suggest: ModelInputSuggest;

        new Setting(contentEl)
            .setName("供应商 (Provider)")
            .setDesc("选择调用该模型使用的服务商账户")
            .addDropdown(dropdown => {
                Object.keys(this.plugin.settings.providers).forEach(pId => {
                    const p = this.plugin.settings.providers[pId];
                    dropdown.addOption(pId, `${p.name || pId} (${p.type || "openai"})`);
                });
                dropdown.setValue(providerId);
                dropdown.onChange((value) => {
                    providerId = value;
                    if (suggest) suggest.setItems([]);
                });
            });

        contentEl.createEl("hr", { attr: { style: "margin: 20px 0; border-color: var(--background-modifier-border);" } });

        new Setting(contentEl)
            .setName("模型 API ID (Model ID)")
            .setDesc("点击右侧按钮获取模型列表，或手动输入")
            .addText(text => {
                apiModelIdInput = text;
                text.setPlaceholder("e.g. gpt-4o")
                    .onChange(v => {
                        apiModelId = v.trim();
                        if (!internalId && apiModelId) {
                            internalId = `${providerId}-${apiModelId}`.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
                            if (internalIdInput) internalIdInput.setValue(internalId);
                        }
                    });

                suggest = new ModelInputSuggest(text.inputEl, [], (item) => {
                    apiModelId = item.id;
                    if (apiModelIdInput) apiModelIdInput.setValue(apiModelId);

                    if (!internalId) {
                        internalId = `${providerId}-${apiModelId}`.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
                        if (internalIdInput) internalIdInput.setValue(internalId);
                    }
                });
            })
            .addButton(btn => btn
                .setButtonText("获取 / Fetch")
                .setIcon("refresh-ccw")
                .setTooltip("从 API 获取可用模型列表")
                .onClick(async () => {
                    const models = await this.fetchModels(providerId);
                    if (models) {
                        suggest.setItems(models);
                        suggest.open();
                        new Notice(`已获取 ${models.length} 个可用模型`);
                        apiModelIdInput.inputEl.focus();
                    }
                }));

        const advancedDetails = contentEl.createEl("details");
        advancedDetails.createEl("summary", { text: "高级设置 (Advanced: Internal ID)", attr: { style: "color: var(--text-muted); cursor: pointer; margin-bottom: 10px;" } });

        new Setting(advancedDetails)
            .setName("插件内部 ID")
            .setDesc("插件配置中使用的唯一键值，通常无需修改")
            .addText(text => {
                internalIdInput = text;
                text.onChange(v => internalId = v.trim());
            });

        const btns = contentEl.createEl("div", { attr: { style: "display:flex;gap:10px;margin-top:20px;justify-content:flex-end;" } });
        btns.createEl("button", { text: "取消" }).onclick = () => modal.close();
        const save = btns.createEl("button", { text: "添加模型", cls: "mod-cta" });
        save.onclick = async () => {
            if (!apiModelId || !internalId) {
                new Notice("请填写完整信息 (API ID)");
                return;
            }
            if (this.plugin.settings.models[internalId]) {
                new Notice("该内部 ID 已存在，请在高级设置中修改 ID");
                return;
            }
            this.plugin.settings.models[internalId] = {
                id: internalId,
                name: apiModelId,
                provider: providerId,
                model: apiModelId,
                enabled: true,
                category
            } as any;
            this.ensureCurrentModelValid();
            await this.plugin.saveSettings();
            modal.close();
            this.display();
            new Notice(`已添加模型: ${apiModelId}`);
        };

        modal.open();
    }

    private showEditModelModal(modelId: string): void {
        const modal = new Modal(this.app);
        const m = this.plugin.settings.models[modelId];
        modal.titleEl.setText(`编辑模型: ${m.model || m.id}`);
        const { contentEl } = modal;

        let providerId = m.provider;
        let apiModelId = m.model || "";

        let apiModelIdInput: any;
        let suggest: ModelInputSuggest;

        new Setting(contentEl)
            .setName("供应商 (Provider)")
            .setDesc("更改该模型所属的服务商")
            .addDropdown(dropdown => {
                Object.keys(this.plugin.settings.providers).forEach(pId => {
                    dropdown.addOption(pId, pId);
                });
                dropdown.setValue(providerId);
                dropdown.onChange(v => {
                    providerId = v;
                    if (suggest) suggest.setItems([]);
                });
            });

        contentEl.createEl("hr", { attr: { style: "margin: 20px 0; border-color: var(--background-modifier-border);" } });

        new Setting(contentEl)
            .setName("模型 API ID")
            .setDesc("点击右侧按钮获取模型列表，或手动输入")
            .addText(text => {
                apiModelIdInput = text;
                text.setValue(apiModelId).onChange(v => apiModelId = v.trim());

                suggest = new ModelInputSuggest(text.inputEl, [], (item) => {
                    apiModelId = item.id;
                    if (apiModelIdInput) apiModelIdInput.setValue(apiModelId);
                });
            })
            .addButton(btn => btn
                .setButtonText("获取 / Fetch")
                .setIcon("refresh-ccw")
                .setTooltip("从 API 获取可用模型列表")
                .onClick(async () => {
                    const models = await this.fetchModels(providerId);
                    if (models) {
                        suggest.setItems(models);
                        suggest.open();
                        new Notice(`已获取 ${models.length} 个可用模型`);
                        apiModelIdInput.inputEl.focus();
                    }
                }));

        const btns = contentEl.createEl("div", { attr: { style: "display:flex;gap:10px;margin-top:20px;justify-content:flex-end;" } });
        btns.createEl("button", { text: "取消" }).onclick = () => modal.close();
        const save = btns.createEl("button", { text: "保存更改", cls: "mod-cta" });
        save.onclick = async () => {
            if (!apiModelId) {
                new Notice("信息不能为空");
                return;
            }
            this.plugin.settings.models[modelId] = {
                ...m,
                provider: providerId,
                model: apiModelId,
                name: apiModelId
            } as any;
            this.ensureCurrentModelValid();
            await this.plugin.saveSettings();
            modal.close();
            this.display();
        };
        modal.open();
    }

    private ensureCurrentModelValid() {
        const enabledModels = Object.entries(this.plugin.settings.models)
            .filter(([_, m]) => m.enabled);
        const hasCurrent = enabledModels.some(([id]) => id === this.plugin.settings.currentModel);
        if (!hasCurrent) {
            this.plugin.settings.currentModel = enabledModels[0]?.[0] || "";
        }
    }

    private addPdfSettings(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "📄 PDF 处理" });

        new Setting(containerEl)
            .setName("图片质量")
            .setDesc("PDF 转图片的质量（0.1-1.0，越高越清晰但文件越大）")
            .addSlider(slider => slider
                .setLimits(0.1, 1.0, 0.1)
                .setValue(this.plugin.settings.advancedSettings?.pdfQuality || 0.8)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.advancedSettings.pdfQuality = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("图片缩放")
            .setDesc("PDF 转图片的缩放比例（1.0-2.0，越高越清晰）")
            .addSlider(slider => slider
                .setLimits(1.0, 2.0, 0.1)
                .setValue(this.plugin.settings.advancedSettings?.pdfScale || 1.5)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.advancedSettings.pdfScale = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("每次提交图片数量")
            .setDesc("PDF 转换时批量提交给 AI 的图片张数（建议 1-5）")
            .addText(text => text
                .setPlaceholder("1")
                .setValue(String(this.plugin.settings.advancedSettings?.imagesPerRequest ?? 1))
                .onChange(async (value) => {
                    const n = parseInt(value);
                    if (!isNaN(n) && n > 0 && n <= 10) {
                        this.plugin.settings.advancedSettings.imagesPerRequest = n;
                        await this.plugin.saveSettings();
                    } else if (value.trim()) {
                        new Notice("请输入 1-10 的整数");
                    }
                })
            );

        containerEl.createEl("hr");
    }

    private addOutputSettings(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "💾 输出设置" });

        const outputSetting = new Setting(containerEl)
            .setName("输出目录")
            .setDesc("转换后的文件保存位置（点击选择）");

        outputSetting.addText(text => {
            text.setPlaceholder("Handwriting Converted");
            text.setValue(this.plugin.settings.outputSettings.outputDir);
            text.setDisabled(true);
        });
        outputSetting.addButton(btn => {
            btn.setButtonText("选择...").onClick(() => this.openFolderPicker(async (folderPath) => {
                if (!folderPath) return;
                this.plugin.settings.outputSettings.outputDir = folderPath;
                await this.plugin.saveSettings();
                this.display();
            }));
        });

        new Setting(containerEl)
            .setName("保留原文件名")
            .setDesc("使用原始 PDF 文件名")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.outputSettings.keepOriginalName)
                .onChange(async (value) => {
                    this.plugin.settings.outputSettings.keepOriginalName = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("转换后自动打开")
            .setDesc("转换完成后立即打开文件")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.outputSettings.autoOpen)
                .onChange(async (value) => {
                    this.plugin.settings.outputSettings.autoOpen = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("插入分割线")
            .setDesc("在 PDF 多批次输出之间插入 --- 分割线")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.outputSettings.insertPageSeparator ?? false)
                .onChange(async (value) => {
                    this.plugin.settings.outputSettings.insertPageSeparator = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("移除 Page 标题")
            .setDesc("在 AI 输出中移除 # Page N / ## Page N 标题行")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.outputSettings.removePageHeadings ?? false)
                .onChange(async (value) => {
                    this.plugin.settings.outputSettings.removePageHeadings = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("标题下方插入内容")
            .setDesc("在 Markdown 标题下方插入的自定义内容（支持 Markdown 格式，留空则不插入）")
            .addTextArea(text => {
                text.setPlaceholder("例如：> 来自 PDF 的转换内容\\n或：[返回目录](#目录)")
                    .setValue(this.plugin.settings.outputSettings.contentAfterTitle || "")
                    .setDisabled(false)
                    .onChange(async (value) => {
                        this.plugin.settings.outputSettings.contentAfterTitle = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 3;
                text.inputEl.style.width = "100%";
                text.inputEl.readOnly = false;
                text.inputEl.tabIndex = 0;
                (text.inputEl as HTMLElement).style.pointerEvents = "auto";
            });

        containerEl.createEl("hr");
    }

    private addPromptSettings(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "✍️ 转换提示词" });

        const defaultPrompt = DEFAULT_CONVERSION_PROMPT;

        new Setting(containerEl)
            .setName("自定义提示词")
            .setDesc("告诉 AI 如何转换你的笔记（留空使用默认）")
            .addTextArea(text => {
                text.setPlaceholder(defaultPrompt)
                    .setValue(this.plugin.settings.conversionPrompt || "")
                    .setDisabled(false)
                    .onChange(async (value) => {
                        this.plugin.settings.conversionPrompt = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 6;
                text.inputEl.style.width = "100%";
                // 确保可编辑与可聚焦
                text.inputEl.readOnly = false;
                text.inputEl.tabIndex = 0;
                (text.inputEl as HTMLElement).style.pointerEvents = "auto";
            });

        containerEl.createEl("hr");
    }

    private addAdvancedOptions(containerEl: HTMLElement) {
        const detailsEl = containerEl.createEl("details", {
            attr: { style: "margin: 20px 0;" }
        });
        detailsEl.createEl("summary", {
            text: "⚙️ 高级选项",
            attr: { style: "cursor: pointer; font-size: 1.1em; font-weight: 600; margin-bottom: 10px;" }
        });

        const contentDiv = detailsEl.createDiv({ attr: { style: "margin-top: 15px;" } });

        new Setting(contentDiv)
            .setName("请求超时（秒）")
            .setDesc("单个页面处理的最大等待时间")
            .addText(text => text
                .setPlaceholder("60")
                .setValue(String(this.plugin.settings.advancedSettings.timeout / 1000))
                .onChange(async (value) => {
                    const seconds = parseInt(value);
                    if (!isNaN(seconds) && seconds > 0) {
                        this.plugin.settings.advancedSettings.timeout = seconds * 1000;
                        await this.plugin.saveSettings();
                    }
                })
            );

        new Setting(contentDiv)
            .setName("最大 Token 数")
            .setDesc("AI 响应的最大长度")
            .addText(text => text
                .setPlaceholder("4096")
                .setValue(String(this.plugin.settings.maxTokens))
                .onChange(async (value) => {
                    const tokens = parseInt(value);
                    if (!isNaN(tokens) && tokens > 0) {
                        this.plugin.settings.maxTokens = tokens;
                        await this.plugin.saveSettings();
                    }
                })
            );

        new Setting(contentDiv)
            .setName("并发批处理数量")
            .setDesc("同时向 AI 提交的批次（建议 1-3）")
            .addText(text => text
                .setPlaceholder("2")
                .setValue(String(this.plugin.settings.advancedSettings?.concurrencyLimit ?? 2))
                .onChange(async (value) => {
                    const n = parseInt(value);
                    if (!isNaN(n) && n > 0 && n <= 5) {
                        this.plugin.settings.advancedSettings.concurrencyLimit = n;
                        await this.plugin.saveSettings();
                    }
                })
            );

        new Setting(contentDiv)
            .setName("重试次数")
            .setDesc("批次请求失败后的重试次数（建议 0-3）")
            .addText(text => text
                .setPlaceholder("2")
                .setValue(String(this.plugin.settings.advancedSettings?.retryAttempts ?? 2))
                .onChange(async (value) => {
                    const n = parseInt(value);
                    if (!isNaN(n) && n >= 0 && n <= 5) {
                        this.plugin.settings.advancedSettings.retryAttempts = n;
                        await this.plugin.saveSettings();
                    }
                })
            );

        new Setting(contentDiv)
            .setName("转换时自动最小化进度窗")
            .setDesc("开始转换后自动将进度窗口最小化为右下角浮动面板，避免遮挡界面")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.advancedSettings?.autoMinimizeProgress ?? false)
                .onChange(async (value) => {
                    this.plugin.settings.advancedSettings.autoMinimizeProgress = value;
                    await this.plugin.saveSettings();
                })
            );

    }

    private addFooter(containerEl: HTMLElement) {
        containerEl.createEl("hr");

        const footerDiv = containerEl.createDiv({
            attr: { style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;" }
        });

        // 重置设置
        const resetBtn = footerDiv.createEl("button", {
            text: "🔄 重置设置",
            attr: {
                style: "padding: 8px 16px; border: 1px solid var(--text-error); background: transparent; color: var(--text-error); border-radius: 6px; cursor: pointer;"
            }
        });
        resetBtn.onclick = () => this.resetSettings();

        // 版本信息
        containerEl.createEl("p", {
            text: "Ink2Vault v1.0.0",
            attr: { style: "text-align: center; color: var(--text-muted); margin-top: 20px; font-size: 0.85em;" }
        });
    }

    /**
     * 打开文件夹选择器（FuzzySuggestModal），回传 vault 相对路径
     */
    private openFolderPicker(onPicked: (folderPath: string | null) => void) {
        const folders: TFolder[] = [];
        const all = this.app.vault.getAllLoadedFiles();
        all.forEach((f: TAbstractFile) => { if (f instanceof TFolder) folders.push(f); });

        class FolderSuggest extends FuzzySuggestModal<TFolder> {
            private chosen = false;
            constructor(private items: TFolder[], private cb: (path: string | null) => void, app: App) { super(app); this.setPlaceholder("选择输出文件夹..."); }
            getItems(): TFolder[] { return this.items; }
            getItemText(item: TFolder): string { return item.path; }
            onChooseItem(item: TFolder): void { this.chosen = true; this.cb(item.path); }
            onClose(): void { if (!this.chosen) this.cb(null); }
        }

        new FolderSuggest(folders, onPicked, this.app).open();
    }

    private async testConfiguration() {
        const currentModel = this.plugin.settings.currentModel;
        if (!currentModel) {
            new Notice("❌ 未选择模型", 3000);
            return;
        }

        const modelConfig = this.plugin.settings.models[currentModel];
        const provider = this.plugin.settings.providers[modelConfig?.provider];

        if (!provider?.apiKey) {
            new Notice("❌ 未配置 API Key", 3000);
            return;
        }

        new Notice("🧪 正在测试配置...", 1500);

        try {
            const result = await this.plugin.aiService.testConnection();
            if (result.success) {
                new Notice("✅ API连接成功", 3000);
            } else {
                new Notice("❌ 连接失败: " + result.message, 4000);
            }
        } catch (e: any) {
            new Notice("❌ 测试异常: " + (e?.message || String(e)), 4000);
        }
    }

    private async resetSettings() {
        if (!confirm("确定要重置所有设置吗？此操作不可撤销。")) {
            return;
        }

        const { DEFAULT_SETTINGS } = await import("../defaults");
        this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        await this.plugin.saveSettings();
        this.display();

        new Notice("✅ 设置已重置", 3000);
    }
}
