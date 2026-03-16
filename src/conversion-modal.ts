import { App, Modal, Notice, TFile, TFolder } from "obsidian";
import { ConversionService } from "./conversion-service";
import HandMarkdownAIPlugin from "./main";

/**
 * 文件转换对话框
 * 允许用户选择要转换的文件
 */
export class ConversionModal extends Modal {
    private plugin: HandMarkdownAIPlugin;
    private selectedFiles: TFile[] = [];
    private fileCheckboxes: Map<string, HTMLInputElement> = new Map();
    private folderCheckboxes: Map<string, HTMLInputElement> = new Map();
    private mergeSelected = false;

    constructor(app: App, plugin: HandMarkdownAIPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.empty();
        contentEl.addClass("ink2vault-modal");

        // 标题
        contentEl.createEl("h2", {
            text: "转换手写笔记",
            cls: "modal-title"
        });

        // 说明
        const descEl = contentEl.createEl("p", {
            text: "选择要转换的手写笔记文件（支持PNG、JPG、JPEG、PDF等格式）",
            cls: "modal-description"
        });

        // 获取支持的文件
        const supportedFiles = this.getSupportedFiles();

        if (supportedFiles.length === 0) {
            // 没有支持的文件
            const noFilesEl = contentEl.createEl("div", {
                text: "未找到支持的文件。请确保vault中有PNG、JPG、JPEG或PDF格式的文件。",
                cls: "no-files-message"
            });

            // 关闭按钮
            const closeButton = contentEl.createEl("button", {
                text: "关闭",
                cls: "mod-cancel"
            });
            closeButton.onclick = () => {
                this.close();
            };

            return;
        }

        // 文件列表容器
        const fileListContainer = contentEl.createDiv();
        fileListContainer.addClass("file-list-container");

        // 添加全选/取消全选
        const selectAllContainer = fileListContainer.createDiv();
        selectAllContainer.addClass("select-all-container");

        const selectAllCheckbox = selectAllContainer.createEl("input", {
            type: "checkbox",
            cls: "select-all-checkbox"
        });
        const selectAllLabel = selectAllContainer.createEl("label", {
            text: "全选",
            cls: "select-all-label"
        });

        // 全选/取消全选逻辑
        selectAllCheckbox.addEventListener("change", () => {
            const isChecked = selectAllCheckbox.checked;
            this.fileCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            this.updateSelectedFiles();
        });

        // 文件夹树形列表（与仓库类似）
        const treeContainer = fileListContainer.createDiv();
        treeContainer.addClass("file-tree-container");
        const rootFolder = this.app.vault.getRoot();
        this.buildFolderTree(rootFolder, treeContainer);

        // 统计信息
        const statsEl = contentEl.createDiv();
        statsEl.addClass("file-stats");
        statsEl.textContent = `已选择 ${this.selectedFiles.length} / ${supportedFiles.length} 个文件`;

        const mergeContainer = contentEl.createDiv();
        mergeContainer.addClass("merge-option-container");
        const mergeCheckbox = mergeContainer.createEl("input", { type: "checkbox" }) as HTMLInputElement;
        const mergeLabel = mergeContainer.createEl("label", { text: "合并为单个Markdown（仅图片）" });
        mergeCheckbox.addEventListener("change", () => {
            this.mergeSelected = mergeCheckbox.checked;
        });

        // 按钮容器
        const buttonContainer = contentEl.createDiv();
        buttonContainer.addClass("modal-button-container");

        // 取消按钮
        const cancelButton = buttonContainer.createEl("button", {
            text: "取消",
            cls: "mod-cancel"
        });
        cancelButton.onclick = () => {
            this.close();
        };

        // 转换按钮
        const convertButton = buttonContainer.createEl("button", {
            text: "开始转换",
            cls: "mod-cta"
        });
        convertButton.onclick = async () => {
            if (this.selectedFiles.length === 0) {
                new Notice("请至少选择一个文件", 3000);
                return;
            }

            this.close();

            // 执行转换
            const filePaths = this.selectedFiles.map(file => file.path);
            await this.plugin.confirmAndConvertSelection(filePaths, this.mergeSelected);
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
    private updateSelectedFiles() {
        this.selectedFiles = [];
        this.fileCheckboxes.forEach((checkbox, filePath) => {
            if (checkbox.checked) {
                const file = this.app.vault.getAbstractFileByPath(filePath);
                if (file instanceof TFile) {
                    this.selectedFiles.push(file);
                }
            }
        });

        // 更新统计信息
        const statsEl = this.contentEl.querySelector(".file-stats");
        if (statsEl) {
            const supportedFiles = this.getSupportedFiles();
            statsEl.textContent = `已选择 ${this.selectedFiles.length} / ${supportedFiles.length} 个文件`;
        }
    }

    /**
     * 更新全选复选框状态
     */
    private updateSelectAllState() {
        const selectAllCheckbox = this.contentEl.querySelector(
            ".select-all-checkbox"
        ) as HTMLInputElement;

        if (selectAllCheckbox) {
            const allChecked = Array.from(this.fileCheckboxes.values()).every(
                checkbox => checkbox.checked
            );
            const someChecked = Array.from(this.fileCheckboxes.values()).some(
                checkbox => checkbox.checked
            );

            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
        }
    }

    /**
     * 构建文件夹树
     */
    private buildFolderTree(folder: TFolder, containerEl: HTMLElement) {
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

        // 遍历子项
        folder.children.forEach(child => {
            if (child instanceof TFolder) {
                this.buildFolderTree(child, childrenContainer);
            } else if (child instanceof TFile) {
                if (!ConversionService.isFileSupported(child.path)) return;

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

        // 文件夹复选框级联
        folderCheckbox.addEventListener("change", () => {
            const checked = folderCheckbox.checked;
            // 勾选/取消本文件夹内所有受支持的文件
            this.toggleFolderChildren(folderEl, checked);
            this.updateSelectedFiles();
            this.updateSelectAllState();
            this.updateFolderIndeterminateStates(containerEl);
        });
    }

    /**
     * 切换文件夹内所有文件的勾选状态
     */
    private toggleFolderChildren(containerEl: HTMLElement, checked: boolean) {
        const checkboxes = containerEl.querySelectorAll("input.file-checkbox") as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(cb => {
            cb.checked = checked;
        });
        // 子文件夹递归处理
        const subFolders = containerEl.querySelectorAll(".folder-item");
        subFolders.forEach(sub => {
            const subFileCheckboxes = sub.querySelectorAll("input.file-checkbox") as NodeListOf<HTMLInputElement>;
            subFileCheckboxes.forEach(cb => cb.checked = checked);
            const subFolderCheckbox = sub.querySelector("input.folder-checkbox") as HTMLInputElement;
            if (subFolderCheckbox) subFolderCheckbox.checked = checked;
        });
    }

    /**
     * 更新文件夹的半选状态
     */
    private updateFolderIndeterminateStates(rootEl: HTMLElement) {
        const folderItems = rootEl.querySelectorAll(".folder-item");
        folderItems.forEach(folderItem => {
            const folderCheckbox = folderItem.querySelector("input.folder-checkbox") as HTMLInputElement;
            const fileCheckboxes = folderItem.querySelectorAll("input.file-checkbox") as NodeListOf<HTMLInputElement>;
            if (!folderCheckbox || fileCheckboxes.length === 0) return;

            const allChecked = Array.from(fileCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(fileCheckboxes).some(cb => cb.checked);

            folderCheckbox.checked = allChecked;
            folderCheckbox.indeterminate = someChecked && !allChecked;
        });
    }

    /**
     * 获取支持的文件列表
     */
    private getSupportedFiles(): TFile[] {
        const files: TFile[] = [];

        // 遍历vault中的所有文件
        this.app.vault.getFiles().forEach(file => {
            if (ConversionService.isFileSupported(file.path)) {
                files.push(file);
            }
        });

        // 按文件名排序
        files.sort((a, b) => a.path.localeCompare(b.path));

        return files;
    }

    /**
     * 格式化文件大小
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 B";

        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    }
}
