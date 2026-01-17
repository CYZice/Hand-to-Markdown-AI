import { App, FuzzySuggestModal, Modal, Notice, PluginSettingTab, Setting, TAbstractFile, TFolder } from "obsidian";
import { MODEL_CATEGORIES } from "../constants";
import type HandMarkdownAIPlugin from "../main";

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
        containerEl.createEl("h2", { text: "Hand Markdown AI" });
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

        const badge = statusDiv.createDiv({ attr: { style: "display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius: 20px; border: 1px solid var(--background-modifier-border); background: var(--background-secondary);" } });
        badge.createSpan({ text: "当前模型:", attr: { style: "opacity:0.7;" } });
        badge.createEl("strong", { text: modelConfig?.name || currentModel });
        if (modelConfig?.provider) {
            const prov = statusDiv.createDiv({ attr: { style: "padding:6px 10px; border-radius: 16px; border:1px solid var(--background-modifier-border); background: var(--background-secondary); font-size:12px;" } });
            prov.setText(`Provider: ${modelConfig.provider}${provider?.name ? ` (${provider.name})` : ''}`);
        }
        const hint = statusDiv.createDiv({ attr: { style: "flex-basis:100%; color: var(--text-muted);" } });
        hint.setText(hasApiKey ? "右键文件/文件夹可一键转换；命令面板可搜索相关命令。" : "⚠️ 需要配置：请先填写 API Key");

        containerEl.createEl("hr");
    }

    private addProviderSection(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "供应商、API设置" });
        containerEl.createEl("p", {
            text: "APIKey：需在供应商API密钥中设置APIKey",
            attr: { style: "color: var(--text-muted); margin-bottom: 5px;" }
        });
        containerEl.createEl("p", {
            text: "Base URL：选填第三方URL，使用openai兼容格式",
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
        Object.keys(this.plugin.settings.providers).forEach(providerId => {
            const provider = this.plugin.settings.providers[providerId];
            const row = tbody.createEl("tr");

            row.createEl("td", { text: providerId });
            row.createEl("td", { text: provider.type || "openai" });

            const apiKeyCell = row.createEl("td", { cls: "markdown-next-ai-api-key-cell" });
            if (provider.apiKey && provider.apiKey.trim()) {
                apiKeyCell.createEl("span", {
                    text: "••••••••",
                    attr: { style: "color: var(--text-muted); margin-right: 8px;" }
                });
            }
            const settingsBtn = apiKeyCell.createEl("button", {
                cls: "markdown-next-ai-settings-btn",
                attr: { title: "设置API Key" }
            });
            settingsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>';
            settingsBtn.onclick = () => this.showApiKeyModal(providerId);

            const linkCell = row.createEl("td", { attr: { style: "text-align: left;" } });
            const links: Record<string, string> = {
                openai: "https://platform.openai.com/api-keys",
                anthropic: "https://console.anthropic.com/",
                gemini: "https://aistudio.google.com/app/apikey",
                ollama: "https://ollama.com/"
            };
            const link = links[providerId] || (this.plugin.settings.apiKeyLinks && this.plugin.settings.apiKeyLinks[providerId]);
            if (link) {
                linkCell.createEl("a", {
                    text: "获取API Key",
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

        containerEl.createEl("div", { attr: { style: "margin-top: 15px; margin-bottom: 20px;" } })
            .createEl("button", {
                text: "+ 添加供应商",
                attr: { style: "background: var(--interactive-accent); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;" }
            }).onclick = () => this.showAddProviderModal();

        containerEl.createEl("hr");
    }

    private addModelSection(containerEl: HTMLElement) {
        const modelHeader = containerEl.createEl("div", {
            attr: { style: "display: flex; justify-content: space-between; align-items: center; margin-top: 30px; margin-bottom: 15px;" }
        });
        modelHeader.createEl("h3", { text: "模型设置", attr: { style: "margin: 0;" } });
        modelHeader.createEl("button", {
            text: "+ 添加模型",
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
            allModels.forEach(model => {
                const row = mTbody.createEl("tr");
                row.createEl("td", { text: model.id });
                row.createEl("td", { text: model.provider });
                row.createEl("td", { text: model.model });

                const enableCell = row.createEl("td", { cls: "markdown-next-ai-enable-cell" });
                const checkbox = enableCell.createEl("input", { type: "checkbox" }) as HTMLInputElement;
                checkbox.checked = model.enabled;
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
                    if (confirm(`确定要删除模型 "${model.name || model.id}" ？`)) {
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
            const emptyRow = mTbody.createEl("tr");
            emptyRow.createEl("td", {
                text: "暂无模型，点击上方按钮添加",
                attr: { colspan: "5", style: "text-align: center; color: var(--text-muted); font-style: italic; padding: 20px;" }
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
                    dropdown.addOption(id, `${model.name || model.model} (${model.provider})`);
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

        // 测试API连接（对齐 Markdown-Next-AI 的交互）
        new Setting(containerEl)
            .setName("测试API连接")
            .setDesc("测试当前API配置是否正常")
            .addButton(button => button
                .setButtonText("测试连接")
                .onClick(async () => {
                    const originalText = button.buttonEl.textContent || "测试连接";
                    button.setButtonText("测试中...");
                    try {
                        const result = await this.plugin.aiService.testConnection();
                        if (result.success) {
                            new Notice("✅ API连接成功");
                        } else {
                            new Notice("❌ API连接失败: " + (result.message || "未知错误"));
                        }
                    } catch (error: any) {
                        new Notice("❌ 测试失败: " + (error?.message || String(error)));
                    } finally {
                        button.setButtonText(originalText);
                    }
                })
            );

        containerEl.createEl("hr");
    }

    private showProviderModal(mode: "add" | "edit", providerId?: string) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(mode === "add" ? "添加提供商" : `编辑提供商 ${providerId}`);

        const content = modal.contentEl.createDiv({ attr: { style: "display: flex; flex-direction: column; gap: 12px;" } });

        const provider = providerId ? this.plugin.settings.providers[providerId] : { apiKey: "", baseUrl: "", enabled: true, type: "openai", name: "" };

        let idValue = providerId || "";

        const idInput = new Setting(content)
            .setName("ID")
            .setDesc("用于引用的唯一标识")
            .addText(text => {
                text.setPlaceholder("my-provider")
                    .setValue(idValue)
                    .onChange(value => idValue = value.trim());
                if (mode === "edit") text.setDisabled(true);
            });

        new Setting(content)
            .setName("显示名称")
            .addText(text => text
                .setPlaceholder("OpenAI")
                .setValue(provider.name || "")
                .onChange(value => provider.name = value.trim())
            );

        new Setting(content)
            .setName("类型")
            .setDesc("openai 兼容类型标识")
            .addText(text => text
                .setPlaceholder("openai")
                .setValue(provider.type || "openai")
                .onChange(value => provider.type = value.trim() || "openai")
            );

        new Setting(content)
            .setName("Base URL")
            .setDesc("可选，OpenAI 兼容接口地址")
            .addText(text => text
                .setPlaceholder("https://api.openai.com/v1")
                .setValue(provider.baseUrl || "")
                .onChange(value => provider.baseUrl = value.trim())
            );

        new Setting(content)
            .setName("API Key")
            .addText(text => {
                text.inputEl.type = "password";
                text.setPlaceholder("sk-...")
                    .setValue(provider.apiKey || "")
                    .onChange(value => provider.apiKey = value.trim());
            });

        new Setting(content)
            .setName("启用")
            .addToggle(toggle => toggle
                .setValue(provider.enabled)
                .onChange(value => provider.enabled = value)
            );

        const footer = modal.contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;" } });
        const cancelBtn = footer.createEl("button", { text: "取消" });
        cancelBtn.onclick = () => modal.close();
        const saveBtn = footer.createEl("button", { text: "保存" });
        saveBtn.onclick = async () => {
            if (!idValue) {
                new Notice("ID 不能为空");
                return;
            }
            if (mode === "add" && this.plugin.settings.providers[idValue]) {
                new Notice("ID 已存在");
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

    private showAddProviderModal(): void {
        // 使用与 Markdown-Next-AI 相同的添加供应商流程
        this.showProviderModal("add");
    }

    private showEditProviderModal(providerId: string): void {
        // 使用与 Markdown-Next-AI 相同的编辑供应商流程
        this.showProviderModal("edit", providerId);
    }

    private showApiKeyModal(providerId: string): void {
        const modal = new Modal(this.app);
        modal.titleEl.setText(`设置 ${providerId.toUpperCase()} 配置`);

        const contentEl = modal.contentEl;
        const provider = this.plugin.settings.providers[providerId] || { apiKey: "", baseUrl: "", enabled: true };

        contentEl.createEl("label", { text: "API Key:", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
        const apiKeyInput = contentEl.createEl("input", { type: "password", placeholder: "请输入API Key", attr: { style: "width: 100%; margin-bottom: 15px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" } }) as HTMLInputElement;
        apiKeyInput.value = provider.apiKey || "";

        contentEl.createEl("label", { text: "Base URL (可选):", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
        const baseUrlInput = contentEl.createEl("input", { type: "text", placeholder: "例如: https://api.example.com/v1", value: provider.baseUrl || "", attr: { style: "width: 100%; margin-bottom: 15px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" } }) as HTMLInputElement;

        const buttonContainer = contentEl.createEl("div", { attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;" } });
        const cancelBtn = buttonContainer.createEl("button", { text: "取消", attr: { style: "padding: 6px 12px;" } });
        cancelBtn.onclick = () => modal.close();
        const saveBtn = buttonContainer.createEl("button", { text: "保存", cls: "mod-cta", attr: { style: "padding: 6px 12px;" } });

        const saveHandler = async () => {
            if (!this.plugin.settings.providers[providerId]) {
                this.plugin.settings.providers[providerId] = { apiKey: "", baseUrl: "", enabled: true } as any;
            }
            this.plugin.settings.providers[providerId].apiKey = apiKeyInput.value.trim();
            this.plugin.settings.providers[providerId].baseUrl = baseUrlInput.value.trim();
            if (apiKeyInput.value.trim()) {
                this.plugin.settings.providers[providerId].enabled = true;
            }
            await this.plugin.saveSettings();
            new Notice(providerId.toUpperCase() + " 配置已保存");
            modal.close();
            this.display();
        };
        saveBtn.onclick = saveHandler;

        const keydownHandler = (e: KeyboardEvent) => {
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

    private showModelModal(mode: "add" | "edit", modelId?: string) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(mode === "add" ? "添加模型" : `编辑模型 ${modelId}`);
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

        new Setting(content)
            .setName("ID")
            .setDesc("唯一标识，建议使用小写和短横线")
            .addText(text => {
                text.setPlaceholder("gpt-4o-mini")
                    .setValue(idValue)
                    .onChange(value => idValue = value.trim());
                if (mode === "edit") text.setDisabled(true);
            });

        new Setting(content)
            .setName("显示名称")
            .addText(text => text
                .setPlaceholder("GPT-4o Mini")
                .setValue(model.name)
                .onChange(value => model.name = value.trim())
            );

        new Setting(content)
            .setName("Provider")
            .addDropdown(drop => {
                Object.keys(this.plugin.settings.providers).forEach(pid => drop.addOption(pid, pid));
                drop.setValue(model.provider)
                    .onChange(value => model.provider = value);
            });

        new Setting(content)
            .setName("Model")
            .setDesc("API 模型名称，例如 gpt-4o-mini")
            .addText(text => text
                .setPlaceholder("gpt-4o-mini")
                .setValue(model.model)
                .onChange(value => model.model = value.trim())
            );

        new Setting(content)
            .setName("类别")
            .addDropdown(drop => {
                Object.entries(MODEL_CATEGORIES).forEach(([key, value]) => drop.addOption(String(value), key));
                drop.setValue(String(model.category))
                    .onChange(value => model.category = value as any);
            });

        new Setting(content)
            .setName("启用")
            .addToggle(toggle => toggle
                .setValue(model.enabled)
                .onChange(value => model.enabled = value)
            );

        const footer = modal.contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;" } });
        footer.createEl("button", { text: "取消" }).onclick = () => modal.close();
        footer.createEl("button", { text: "保存" }).onclick = async () => {
            if (!idValue) {
                new Notice("模型 ID 不能为空");
                return;
            }
            if (!model.name) {
                new Notice("模型名称不能为空");
                return;
            }
            if (!model.model) {
                new Notice("Model 字段不能为空");
                return;
            }
            if (!this.plugin.settings.providers[model.provider]) {
                new Notice("请选择有效的 Provider");
                return;
            }
            if (mode === "add" && this.plugin.settings.models[idValue]) {
                new Notice("模型 ID 已存在");
                return;
            }

            const persisted = { ...model, id: idValue } as any;
            this.plugin.settings.models[idValue] = persisted;
            this.ensureCurrentModelValid();
            await this.plugin.saveSettings();
            this.display();
            modal.close();
        };

        modal.open();
    }

    private showAddModelModal(): void {
        this.showModelModal("add");
    }

    private showEditModelModal(modelId: string): void {
        this.showModelModal("edit", modelId);
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

        const defaultPrompt = "Take the handwritten notes from this image and convert them into a clean, well-structured Markdown file. Pay attention to headings, lists, and any other formatting. Use latex for mathematical equations. For latex use the $$ syntax. Do not skip anything from the original text. Just give me the markdown, do not include other text in the response apart from the markdown file.";

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
            text: "Hand Markdown AI v1.0.0",
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
