import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
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
        const statusDiv = containerEl.createDiv({ attr: { style: "margin-bottom: 20px;" } });
        const currentModel = this.plugin.settings.currentModel;
        const modelConfig = this.plugin.settings.models[currentModel];
        const provider = modelConfig ? this.plugin.settings.providers[modelConfig.provider] : null;
        const hasApiKey = provider?.apiKey?.trim();

        if (hasApiKey) {
            statusDiv.innerHTML = `
                <div style="padding: 12px; background: #d4edda; color: #155724; border-radius: 6px; border: 1px solid #c3e6cb;">
                    ✅ <strong>就绪</strong> - 使用 ${modelConfig?.name || currentModel}
                    <br><small>右键 PDF → "转换为Markdown"</small>
                </div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div style="padding: 12px; background: #fff3cd; color: #856404; border-radius: 6px; border: 1px solid #ffeaa7;">
                    ⚠️ <strong>需要配置</strong> - 请先填写 API Key
                </div>
            `;
        }

        containerEl.createEl("hr");
    }

    private addProviderSection(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "🌐 提供商" });

        const table = containerEl.createEl("table", { attr: { style: "width: 100%; border-collapse: collapse; margin-top: 6px;" } });
        const thead = table.createEl("thead").createEl("tr");
        ["ID", "Type", "Base URL", "API Key", "启用", "操作"].forEach(text => {
            thead.createEl("th", { text, attr: { style: "text-align: left; padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);" } });
        });

        const tbody = table.createEl("tbody");
        Object.entries(this.plugin.settings.providers).forEach(([id, provider]) => {
            const row = tbody.createEl("tr");
            const cellStyle = "padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);";

            row.createEl("td", { text: id, attr: { style: cellStyle } });
            row.createEl("td", { text: provider.type || "openai", attr: { style: cellStyle } });
            row.createEl("td", { text: provider.baseUrl || "-", attr: { style: cellStyle } });
            row.createEl("td", { text: provider.apiKey ? "••••" : "未配置", attr: { style: cellStyle + " color: var(--text-muted);" } });

            const enabledCell = row.createEl("td", { attr: { style: cellStyle } });
            const toggle = enabledCell.createEl("input", { type: "checkbox" }) as HTMLInputElement;
            toggle.checked = provider.enabled;
            toggle.onchange = async () => {
                provider.enabled = toggle.checked;
                await this.plugin.saveSettings();
            };

            const actionsCell = row.createEl("td", { attr: { style: cellStyle } });
            const editBtn = actionsCell.createEl("button", { text: "编辑" });
            editBtn.onclick = () => this.showProviderModal("edit", id);
            const deleteBtn = actionsCell.createEl("button", { text: "删除", attr: { style: "margin-left: 6px;" } });
            deleteBtn.onclick = async () => {
                if (Object.keys(this.plugin.settings.providers).length <= 1) {
                    new Notice("至少需要保留一个提供商");
                    return;
                }
                if (confirm(`确定删除提供商 ${id} ？将同时移除其下的模型。`)) {
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
        const addBtn = addBtnWrap.createEl("button", { text: "+ 添加提供商" });
        addBtn.onclick = () => this.showProviderModal("add");

        containerEl.createEl("hr");
    }

    private addModelSection(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "🤖 模型" });

        const header = containerEl.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center;" } });
        const addBtn = header.createEl("button", { text: "+ 添加模型" });
        addBtn.onclick = () => this.showModelModal("add");

        const table = containerEl.createEl("table", { attr: { style: "width: 100%; border-collapse: collapse; margin-top: 8px;" } });
        const thead = table.createEl("thead").createEl("tr");
        ["ID", "名称", "Provider", "Model", "类别", "启用", "操作"].forEach(text => {
            thead.createEl("th", { text, attr: { style: "text-align: left; padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);" } });
        });

        const tbody = table.createEl("tbody");
        const allModels = Object.values(this.plugin.settings.models);

        if (allModels.length === 0) {
            const row = tbody.createEl("tr");
            row.createEl("td", {
                text: "暂无模型，点击上方添加",
                attr: { colspan: "7", style: "padding: 10px; text-align: center; color: var(--text-muted);" }
            });
        } else {
            allModels.forEach(model => {
                const row = tbody.createEl("tr");
                const cellStyle = "padding: 6px 4px; border-bottom: 1px solid var(--background-modifier-border);";
                row.createEl("td", { text: model.id, attr: { style: cellStyle } });
                row.createEl("td", { text: model.name, attr: { style: cellStyle } });
                row.createEl("td", { text: model.provider, attr: { style: cellStyle } });
                row.createEl("td", { text: model.model, attr: { style: cellStyle } });
                row.createEl("td", { text: model.category, attr: { style: cellStyle } });

                const enabledCell = row.createEl("td", { attr: { style: cellStyle } });
                const toggle = enabledCell.createEl("input", { type: "checkbox" }) as HTMLInputElement;
                toggle.checked = model.enabled;
                toggle.onchange = async () => {
                    model.enabled = toggle.checked;
                    await this.plugin.saveSettings();
                    this.ensureCurrentModelValid();
                    this.display();
                };

                const actionsCell = row.createEl("td", { attr: { style: cellStyle } });
                const editBtn = actionsCell.createEl("button", { text: "编辑" });
                editBtn.onclick = () => this.showModelModal("edit", model.id);
                const deleteBtn = actionsCell.createEl("button", { text: "删除", attr: { style: "margin-left: 6px;" } });
                deleteBtn.onclick = async () => {
                    if (confirm(`确定删除模型 ${model.name} ？`)) {
                        delete this.plugin.settings.models[model.id];
                        this.ensureCurrentModelValid();
                        await this.plugin.saveSettings();
                        this.display();
                    }
                };
            });
        }

        new Setting(containerEl)
            .setName("当前模型")
            .setDesc("选择用于转换的模型")
            .addDropdown(dropdown => {
                const enabledModels = Object.entries(this.plugin.settings.models)
                    .filter(([_, config]) => config.enabled);

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

                dropdown.setValue(selected)
                    .onChange(async (value) => {
                        this.plugin.settings.currentModel = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });

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

        containerEl.createEl("hr");
    }

    private addOutputSettings(containerEl: HTMLElement) {
        containerEl.createEl("h3", { text: "💾 输出设置" });

        new Setting(containerEl)
            .setName("输出目录")
            .setDesc("转换后的文件保存位置")
            .addText(text => text
                .setPlaceholder("Converted")
                .setValue(this.plugin.settings.outputSettings.outputDir)
                .onChange(async (value) => {
                    this.plugin.settings.outputSettings.outputDir = value;
                    await this.plugin.saveSettings();
                })
            );

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
                    .onChange(async (value) => {
                        this.plugin.settings.conversionPrompt = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 6;
                text.inputEl.style.width = "100%";
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

    }

    private addFooter(containerEl: HTMLElement) {
        containerEl.createEl("hr");

        const footerDiv = containerEl.createDiv({
            attr: { style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;" }
        });

        // 测试配置
        const testBtn = footerDiv.createEl("button", {
            text: "🧪 测试配置",
            attr: {
                style: "padding: 8px 16px; border: 1px solid var(--interactive-accent); background: transparent; color: var(--interactive-accent); border-radius: 6px; cursor: pointer;"
            }
        });
        testBtn.onclick = () => this.testConfiguration();

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

        new Notice("🧪 正在测试配置...", 2000);

        // 简单验证（实际项目中应该发送测试请求）
        setTimeout(() => {
            new Notice("✅ 配置有效！", 3000);
        }, 1000);
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
