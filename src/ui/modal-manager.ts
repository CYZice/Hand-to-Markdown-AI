import { App, Modal, Notice } from "obsidian";
import { MODEL_CATEGORIES } from "../constants";
import type Ink2VaultPlugin from "../main";
import type { ModelCategory } from "../types";

/**
 * 模态框管理器 - 处理供应商和模型配置
 */
export class ModalManager {
    private plugin: Ink2VaultPlugin;
    private app: App;

    constructor(plugin: Ink2VaultPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
    }

    /**
     * 显示供应商配置模态框
     */
    showProviderConfigModal(providerId: string): void {
        const modal = new Modal(this.app);
        modal.modalEl.addClass("ink2vault-modal");
        modal.titleEl.setText(`设置 ${providerId.toUpperCase()} 配置`);

        const { contentEl } = modal;
        const provider = this.plugin.settings.providers[providerId];

        contentEl.createEl("label", {
            text: "API Key:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });

        const apiKeyInput = contentEl.createEl("input", {
            type: "password",
            placeholder: "请输入API Key",
            attr: {
                style: "width: 100%; margin-bottom: 15px; border: 1px solid var(--background-modifier-border); border-radius: 4px; padding: 8px;"
            }
        }) as HTMLInputElement;
        apiKeyInput.value = provider?.apiKey || "";

        contentEl.createEl("label", {
            text: "Base URL (可选):",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });

        const baseUrlInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "例如: https://api.example.com/v1",
            value: provider?.baseUrl || "",
            attr: {
                style: "width: 100%; margin-bottom: 15px; border: 1px solid var(--background-modifier-border); border-radius: 4px; padding: 8px;"
            }
        }) as HTMLInputElement;

        const buttonContainer = contentEl.createEl("div", {
            attr: {
                style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;"
            }
        });

        const cancelBtn = buttonContainer.createEl("button", {
            text: "取消",
            attr: { style: "padding: 6px 12px;" }
        });
        cancelBtn.onclick = () => modal.close();

        const saveBtn = buttonContainer.createEl("button", {
            text: "保存",
            cls: "mod-cta",
            attr: { style: "padding: 6px 12px;" }
        });

        const saveHandler = async () => {
            if (!this.plugin.settings.providers[providerId]) {
                this.plugin.settings.providers[providerId] = {
                    apiKey: "",
                    baseUrl: "",
                    enabled: true,
                    name: providerId,
                    type: providerId as any
                };
            }

            this.plugin.settings.providers[providerId].apiKey = apiKeyInput.value.trim();
            this.plugin.settings.providers[providerId].baseUrl = baseUrlInput.value.trim();

            if (apiKeyInput.value.trim()) {
                this.plugin.settings.providers[providerId].enabled = true;
            }

            await this.plugin.saveSettings();
            new Notice(providerId.toUpperCase() + " 配置已保存");
            modal.close();

            // 触发重新渲染 - 设置页面会自动刷新
        };

        saveBtn.onclick = saveHandler;

        // 键盘快捷键支持
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

    /**
     * 显示添加供应商模态框
     */
    showAddProviderModal(): void {
        const modal = new Modal(this.app);
        modal.modalEl.addClass("ink2vault-modal");
        modal.titleEl.setText("添加供应商");

        const { contentEl } = modal;

        contentEl.createEl("label", {
            text: "供应商ID:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const idInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "例如: custom-provider",
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLInputElement;

        contentEl.createEl("label", {
            text: "显示名称:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const nameInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "例如: 自定义供应商",
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLInputElement;

        contentEl.createEl("label", {
            text: "类型:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const typeSelect = contentEl.createEl("select", {
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLSelectElement;

        const providerTypes = ["openai", "anthropic", "gemini", "ollama"];
        providerTypes.forEach(type => {
            typeSelect.createEl("option", { value: type, text: type.toUpperCase() });
        });

        contentEl.createEl("label", {
            text: "默认Base URL:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const baseUrlInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "例如: https://api.example.com/v1",
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLInputElement;

        const buttonContainer = contentEl.createEl("div", {
            attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;" }
        });

        const cancelBtn = buttonContainer.createEl("button", { text: "取消" });
        cancelBtn.onclick = () => modal.close();

        const saveBtn = buttonContainer.createEl("button", { text: "添加", cls: "mod-cta" });

        saveBtn.onclick = async () => {
            const id = idInput.value.trim();
            const name = nameInput.value.trim();
            const type = typeSelect.value;
            const baseUrl = baseUrlInput.value.trim();

            if (!id || !name) {
                new Notice("请填写必填字段");
                return;
            }

            if (this.plugin.settings.providers[id]) {
                new Notice("供应商ID已存在");
                return;
            }

            this.plugin.settings.providers[id] = {
                name: name,
                type: type,
                enabled: true,
                apiKey: "",
                baseUrl: baseUrl
            };

            await this.plugin.saveSettings();
            new Notice("供应商已添加");
            modal.close();

            // 触发重新渲染 - 设置页面会自动刷新
        };

        modal.open();
        idInput.focus();
    }

    /**
     * 显示编辑模型模态框
     */
    showEditModelModal(modelId: string): void {
        const modal = new Modal(this.app);
        modal.modalEl.addClass("ink2vault-modal");
        modal.titleEl.setText("编辑模型");

        const { contentEl } = modal;
        const model = this.plugin.settings.models[modelId];

        if (!model) {
            new Notice("模型不存在");
            modal.close();
            return;
        }

        contentEl.createEl("label", {
            text: "模型 ID (API参数):",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        contentEl.createEl("input", {
            type: "text",
            value: modelId,
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;", disabled: "disabled" }
        });

        contentEl.createEl("label", {
            text: "显示名称:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const nameInput = contentEl.createEl("input", {
            type: "text",
            value: model.name,
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLInputElement;

        contentEl.createEl("label", {
            text: "供应商:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const providerSelect = contentEl.createEl("select", {
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLSelectElement;

        Object.keys(this.plugin.settings.providers).forEach(pId => {
            const option = providerSelect.createEl("option", { value: pId, text: pId.toUpperCase() });
            if (pId === model.provider) option.selected = true;
        });

        const buttonContainer = contentEl.createEl("div", {
            attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;" }
        });

        const cancelBtn = buttonContainer.createEl("button", { text: "取消" });
        cancelBtn.onclick = () => modal.close();

        const saveBtn = buttonContainer.createEl("button", { text: "保存", cls: "mod-cta" });

        saveBtn.onclick = async () => {
            const name = nameInput.value.trim();
            const provider = providerSelect.value;

            if (!name) {
                new Notice("请填写必填字段");
                return;
            }

            this.plugin.settings.models[modelId] = {
                ...model,
                name: name,
                provider: provider,
                model: modelId,
                actualModel: modelId
            };

            await this.plugin.saveSettings();
            new Notice("模型已更新");
            modal.close();

            // 触发重新渲染 - 设置页面会自动刷新
        };

        modal.open();
        nameInput.focus();
    }

    /**
     * 显示添加模型模态框
     */
    showAddModelModal(category?: ModelCategory): void {
        const modal = new Modal(this.app);
        modal.modalEl.addClass("ink2vault-modal");
        modal.titleEl.setText("添加新模型");

        const { contentEl } = modal;

        contentEl.createEl("label", {
            text: "模型 ID (API参数):",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const idInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "例如: gpt-4-turbo",
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLInputElement;

        contentEl.createEl("label", {
            text: "显示名称:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const nameInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "例如: 我的自定义模型",
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLInputElement;

        contentEl.createEl("label", {
            text: "供应商:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const providerSelect = contentEl.createEl("select", {
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLSelectElement;

        Object.keys(this.plugin.settings.providers).forEach(providerId => {
            providerSelect.createEl("option", {
                value: providerId,
                text: providerId.toUpperCase()
            });
        });

        contentEl.createEl("label", {
            text: "模型类型:",
            attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" }
        });
        const categorySelect = contentEl.createEl("select", {
            attr: { style: "width: 100%; margin-bottom: 15px; padding: 8px; border: 1px solid var(--background-modifier-border); border-radius: 4px;" }
        }) as HTMLSelectElement;

        const categoryOptions = [
            { value: MODEL_CATEGORIES.MULTIMODAL, text: "多模态模型 (支持图片)" },
            { value: MODEL_CATEGORIES.TEXT, text: "文本模型" }
        ];

        categoryOptions.forEach(opt => {
            const option = categorySelect.createEl("option", { value: opt.value, text: opt.text });
            if (opt.value === category) option.selected = true;
        });

        const buttonContainer = contentEl.createEl("div", {
            attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;" }
        });

        const cancelBtn = buttonContainer.createEl("button", { text: "取消" });
        cancelBtn.onclick = () => modal.close();

        const saveBtn = buttonContainer.createEl("button", {
            text: "添加",
            cls: "mod-cta"
        });

        saveBtn.onclick = async () => {
            const id = idInput.value.trim();
            const name = nameInput.value.trim();
            const provider = providerSelect.value;
            const cat = categorySelect.value as ModelCategory;

            if (!id || !name) {
                new Notice("请填写所有必填字段");
                return;
            }

            if (this.plugin.settings.models[id]) {
                new Notice("模型 ID 已存在，请使用其他 ID");
                return;
            }

            this.plugin.settings.models[id] = {
                id: id,
                name: name,
                provider: provider,
                model: id,
                actualModel: id,
                enabled: true,
                category: cat
            };

            await this.plugin.saveSettings();
            new Notice("模型已添加");
            modal.close();

            // 触发重新渲染 - 设置页面会自动刷新
        };

        modal.open();
        idInput.focus();
    }
}