// 修改后的导入
import { FuzzySuggestModal, MarkdownView, Menu, MenuItem, Notice, Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import { ConversionModal } from "./conversion-modal";
import { ConversionService } from "./conversion-service";
import { DEFAULT_SETTINGS } from "./defaults";
import { AIService } from "./services/ai-service";
import type { PluginSettings } from "./types";
import { ConfirmConversionModal } from "./ui/confirm-modal";
import { SimpleSettingsTab } from "./ui/simple-settings-tab";
import { PDFProcessor } from "./utils/pdf-processor";

export default class Ink2VaultPlugin extends Plugin {
    settings: PluginSettings;
    conversionService: ConversionService;
    aiService: AIService;

    async onload() {
        console.log("加载 Ink2Vault 插件");

        await this.loadSettings();

        // 初始化 PDF Worker (Obsidian 内置)
        PDFProcessor.initWorker();

        this.aiService = new AIService(this.settings, this.app);
        this.conversionService = new ConversionService(this.app, this.settings);

        this.addSettingTab(new SimpleSettingsTab(this.app, this));

        this.registerCommands();

        this.registerContextMenu();

        this.registerEditorLinkContextMenu();

        this.registerPreviewImageContextMenu(); // 注册 markdown 预览图片的原生右键菜单

        // 根据需求移除 Ribbon 图标点击入口

        console.log("Ink2Vault 插件加载完成");
    }

    onunload() {
        console.log("卸载 Ink2Vault 插件");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        if (this.settings.useKeychain !== false) {
            await this.migrateKeysToKeychain();
        }
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

    async migrateKeysToKeychain(): Promise<void> {
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

        const hasSecretStorage = secretStorage && (typeof secretStorage.save === "function" || typeof secretStorage.setSecret === "function");
        if (!hasSecretStorage) return;

        let hasChanges = false;

        for (const providerId in this.settings.providers) {
            const provider = this.settings.providers[providerId];
            if (provider.apiKey && !provider.apiKey.startsWith("secret:")) {
                try {
                    const secretId = `ink2vault-api-key-${providerId}`;
                    const keyToSave = provider.apiKey.trim();

                    if (typeof secretStorage.save === "function") {
                        await secretStorage.save(secretId, keyToSave);
                    } else {
                        await secretStorage.setSecret(secretId, keyToSave);
                    }

                    provider.apiKey = `secret:${secretId}`;
                    hasChanges = true;
                } catch (e) {
                    console.error(`[Ink2Vault] Failed to migrate API key for ${providerId} to Keychain:`, e);
                }
            }
        }

        if (hasChanges) {
            await this.saveSettings();
            new Notice("已自动将检测到的明文 API Key 迁移至 Keychain 安全存储");
        }
    }

    /**
     * 注册命令
     */
    private registerCommands() {
        this.addCommand({
            id: "smart-convert",
            name: "转换为Markdown",
            hotkeys: [
                {
                    modifiers: ["Mod", "Alt"],
                    key: "C"
                }
            ],
            checkCallback: (checking: boolean) => {
                if (!checking) {
                    this.smartConvert();
                }
                return true;
            }
        });
    }

    private async smartConvert(target?: TAbstractFile) {
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        if (target instanceof TFolder) {
            this.openConfirmModalForSelection({ mode: "folder", folderPath: target.path });
            return;
        }

        if (target instanceof TFile) {
            if (ConversionService.isFileSupported(target.path)) {
                await this.smartConvertFile(target);
                return;
            }
        }

        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView?.editor && activeView.file) {
            const editor = activeView.editor;
            let cursor: any;
            try {
                cursor = editor.getCursor?.("from") || editor.getCursor?.();
            } catch {
                cursor = editor.getCursor?.();
            }

            if (cursor && typeof cursor.line === "number" && typeof cursor.ch === "number") {
                const line = editor.getLine(cursor.line);
                const linkInfo = this.extractImageAtCursor(line, cursor.ch);
                if (linkInfo) {
                    const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, activeView.file.path);
                    if (targetFile instanceof TFile && ConversionService.isFileSupported(targetFile.path)) {
                        await this.convertLinkInEditor(linkInfo, editor, activeView, cursor.line);
                        return;
                    }
                }
            }
        }

        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && ConversionService.isFileSupported(activeFile.path)) {
            this.openConfirmModalForSelection({ mode: "file", filePath: activeFile.path });
            return;
        }

        this.showConversionModal();
    }

    private async smartConvertFile(file: TFile) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView?.editor && activeView.file) {
            const editor = activeView.editor;
            let cursor: any;
            try {
                cursor = editor.getCursor?.("from") || editor.getCursor?.();
            } catch {
                cursor = editor.getCursor?.();
            }

            if (cursor && typeof cursor.line === "number" && typeof cursor.ch === "number") {
                const line = editor.getLine(cursor.line);
                const linkInfo = this.extractImageAtCursor(line, cursor.ch);
                if (linkInfo) {
                    const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, activeView.file.path);
                    if (targetFile && targetFile.path === file.path) {
                        await this.convertLinkInEditor(linkInfo, editor, activeView, cursor.line);
                        return;
                    }
                }
            }
        }

        this.openConfirmModalForSelection({ mode: "file", filePath: file.path });
    }

    private findImageInLine(line: string, sourcePath: string, targetFile: TFile): { path: string; start: number; end: number; format: 'wiki' | 'markdown' } | null {
        if (!line.includes("[") && !line.includes("(")) return null;

        const indices: number[] = [];

        let match;
        const wikiRegex = /!?\[\[([^\]]+)\]\]/g;
        while ((match = wikiRegex.exec(line)) !== null) {
            indices.push(match.index);
        }

        const mdRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g;
        while ((match = mdRegex.exec(line)) !== null) {
            indices.push(match.index);
        }

        for (const idx of new Set(indices)) {
            const linkInfo = this.extractImageAtCursor(line, idx);
            if (linkInfo) {
                const dest = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, sourcePath);
                if (dest && dest.path === targetFile.path) {
                    return linkInfo;
                }
            }
        }
        return null;
    }

    private async smartConvertPreviewImage(file: TFile) {
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView?.editor && activeView.file) {
            const editor = activeView.editor;
            const lineCount = editor.lineCount();
            let foundLine = -1;
            let foundLinkInfo = null;

            for (let i = 0; i < lineCount; i++) {
                const line = editor.getLine(i);
                if (!line.includes("[") && !line.includes("(")) continue;

                const linkInfo = this.findImageInLine(line, activeView.file.path, file);
                if (linkInfo) {
                    foundLine = i;
                    foundLinkInfo = linkInfo;
                    break;
                }
            }

            if (foundLinkInfo && foundLine !== -1) {
                await this.convertLinkInEditor(foundLinkInfo, editor, activeView, foundLine);
                return;
            }
        }

        this.openConfirmModalForSelection({ mode: "file", filePath: file.path });
    }

    /**
     * 注册右键菜单
     */
    private registerContextMenu() {
        // 文件浏览器右键菜单（统一处理）
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                if (file instanceof TFile && ConversionService.isFileSupported(file.path)) {
                    menu.addItem((item) => {
                        item
                            .setTitle("转换为Markdown")
                            .setIcon("wand")
                            .onClick(async () => {
                                await this.smartConvert(file);
                            });
                    });
                }
                // 仅对输出目录中的 Markdown 文件提供重试选项
                if (file instanceof TFile) {
                    const ext = file.extension?.toLowerCase?.() || "";
                    const outExt = this.settings.outputSettings.outputExtension.toLowerCase();
                    const outDir = (this.settings.outputSettings.outputDir || "").replace(/^\/+/, "");
                    const parentPath = file.parent?.path || "";
                    const inOutputDir = outDir && (parentPath === outDir || parentPath.startsWith(outDir + "/"));
                    const isOutputMarkdown = ext === outExt && inOutputDir;
                    if (isOutputMarkdown) {
                        menu.addItem((item) => {
                            item
                                .setTitle("重试转换（输入页码或留空重试全部失败页）")
                                .setIcon("rotate-ccw")
                                .onClick(() => {
                                    const pageStr = prompt("请输入要重试的页码（留空则重试所有失败页）：");
                                    if (pageStr === null) return; // 用户取消

                                    const pageNum = parseInt(pageStr);
                                    if (!isNaN(pageNum) && pageNum > 0) {
                                        this.conversionService.retrySinglePageFromOutput(file.path, undefined, pageNum);
                                    } else {
                                        this.conversionService.retryFailedPagesFromOutput(file.path);
                                    }
                                });
                        });
                    }
                }
                if (file instanceof TFolder) {
                    menu.addItem((item) => {
                        item
                            .setTitle("转换此文件夹内所有文件")
                            .setIcon("folder")
                            .onClick(() => {
                                this.smartConvert(file);
                            });
                    });
                }
            })
        );
    }

    private registerEditorLinkContextMenu() {
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu: Menu, editor: any, view: any) => {
                if (!(view instanceof MarkdownView)) return;
                if (!editor || !view?.file) return;

                let cursor: any;
                try {
                    cursor = editor.getCursor?.("from") || editor.getCursor?.();
                } catch {
                    cursor = editor.getCursor?.();
                }
                if (!cursor || typeof cursor.line !== "number" || typeof cursor.ch !== "number") return;

                const line = editor.getLine?.(cursor.line);
                if (typeof line !== "string") return;

                const linkInfo = this.extractImageAtCursor(line, cursor.ch);
                if (!linkInfo) return;

                const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, view.file.path);
                if (!(targetFile instanceof TFile)) return;
                if (!ConversionService.isFileSupported(targetFile.path)) return;

                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle("转换链接为Markdown并插入下方")
                        .setIcon("wand")
                        .onClick(async () => {
                            await this.smartConvert();
                        });
                });
            })
        );
    }



    /**
     * 注册 markdown 预览图片的原生右键菜单（支持所有图片，包括 Excalidraw 导出 PNG）
     */
    private registerPreviewImageContextMenu() {
        this.registerDomEvent(document, "contextmenu", async (evt: MouseEvent) => {
            // 只处理 markdown 预览视图或实时预览（Live Preview）视图下的图片
            const img = evt.target as HTMLImageElement;
            if (!img || img.tagName !== "IMG") return;
            const preview = img.closest(".markdown-preview-view") || img.closest(".markdown-source-view");
            if (!preview) return;

            // 获取 vault 内部图片路径
            let imgPath = (img as any).dataset?.href || img.getAttribute("src");
            if (!imgPath) return;

            // 只处理支持的图片类型
            const supported = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"];
            if (!supported.some(ext => imgPath.toLowerCase().endsWith(ext))) return;

            // 兼容 app://local/ 路径
            let vaultPath = imgPath;
            if (vaultPath.startsWith("app://local/")) {
                const parts = vaultPath.replace("app://local/", "").split("/");
                parts.shift();
                vaultPath = parts.join("/");
            }

            // 检查文件是否存在
            const file = this.app.vault.getAbstractFileByPath(vaultPath);
            if (file instanceof TFile && ConversionService.isFileSupported(file.path)) {
                // 阻止默认菜单
                evt.preventDefault();
                // 弹出自定义菜单
                const menu = new Menu();
                menu.addItem((item: MenuItem) => {
                    item.setTitle("转换为Markdown")
                        .setIcon("wand")
                        .onClick(async () => {
                            await this.smartConvertPreviewImage(file);
                        });
                });
                menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
            }
        });
    }

    /**
     * 从光标位置提取文件链接路径
     * 支持 ![[image.png]]、![alt](image.png)、[[file.pdf]] 和 [title](file.pdf) 格式
     */
    private extractImageAtCursor(line: string, ch: number): { path: string; start: number; end: number; format: 'wiki' | 'markdown' } | null {
        // 检测 Wiki 图片链接格式: ![[image.png]]
        const wikiImageRegex = /!\[\[([^\]]+)\]\]/g;
        let match;
        while ((match = wikiImageRegex.exec(line)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            if (ch >= start && ch <= end) {
                return {
                    path: match[1].split('|')[0].trim(), // 去掉可能的别名
                    start,
                    end,
                    format: 'wiki'
                };
            }
        }

        // 检测 Markdown 图片格式: ![alt](image.png)
        const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        while ((match = mdImageRegex.exec(line)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            if (ch >= start && ch <= end) {
                return {
                    path: match[2].trim(),
                    start,
                    end,
                    format: 'markdown'
                };
            }
        }

        // 检测 Wiki 文件链接格式: [[file.pdf]]
        const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
        while ((match = wikiLinkRegex.exec(line)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            if (ch >= start && ch <= end) {
                return {
                    path: match[1].split('|')[0].trim(),
                    start,
                    end,
                    format: 'wiki'
                };
            }
        }

        // 检测 Markdown 文件链接格式: [title](file.pdf)
        const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
        while ((match = mdLinkRegex.exec(line)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            if (ch >= start && ch <= end) {
                return {
                    path: match[2].trim(),
                    start,
                    end,
                    format: 'markdown'
                };
            }
        }

        return null;
    }

    /**
     * 转换编辑器中的链接文件（图片、PDF、Excalidraw）为Markdown文本
     * 在编辑器中直接插入到链接下方
     */
    private async convertLinkInEditor(
        linkInfo: { path: string; start: number; end: number; format: 'wiki' | 'markdown' },
        editor: any,
        view: any,
        lineNum: number
    ) {
        try {
            // 验证配置
            if (!this.conversionService.validateConfig()) {
                new Notice("请先在设置中配置AI提供商", 5000);
                this.openSettings();
                return;
            }

            new Notice("正在转换文件...", 2000);

            // 使用 Obsidian 的链接解析 API 来正确解析文件路径
            const currentFile = view.file;
            const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, currentFile?.path || '');

            if (!(targetFile instanceof TFile)) {
                // 如果解析失败，显示详细错误信息
                new Notice(`找不到文件: ${linkInfo.path}\n当前文件: ${currentFile?.path || '未知'}`, 5000);
                console.error('文件路径解析失败:', {
                    linkPath: linkInfo.path,
                    sourcePath: currentFile?.path,
                    resolvedFile: targetFile
                });
                return;
            }

            // 检查是否为支持的格式
            if (!ConversionService.isFileSupported(targetFile.path)) {
                new Notice(`不支持的文件格式: ${targetFile.extension}`, 5000);
                return;
            }

            // 使用 ConversionService 转换文件，但不保存到新文件
            // 我们需要直接获取转换结果
            const { FileProcessor } = await import('./file-processor');

            // 特殊处理 Excalidraw 文件：查找对应的 PNG 文件
            let fileData;
            let actualFilePath = targetFile.path;

            if (targetFile.path.endsWith('.excalidraw') || targetFile.path.endsWith('.excalidraw.md')) {
                // 生成对应的 PNG 文件路径
                // .excalidraw 或 .excalidraw.md 都对应 .excalidraw.png
                const pngPath = targetFile.path.replace(/\.excalidraw(\.md)?$/, '.excalidraw.png');
                const pngFile = this.app.vault.getAbstractFileByPath(pngPath);

                if (pngFile instanceof TFile) {
                    // PNG 文件存在，使用 PNG 继续后续逻辑
                    actualFilePath = pngPath;
                    fileData = await FileProcessor.processFile(pngPath, this.app);
                } else {
                    // PNG 文件不存在，提示用户
                    new Notice(`❌ 找不到对应的 PNG 文件\n\n期望位置: ${pngPath}\n\n请先在 Excalidraw 插件中导出 PNG，或检查文件是否存在。`, 7000);
                    return;
                }
            } else {
                // 处理普通图片和 PDF
                fileData = await FileProcessor.processFile(targetFile.path, this.app);
            }

            // 使用 AI 转换
            const prompt = this.settings.conversionPrompt || "将文件中的内容转换为Markdown格式";
            const result = await this.aiService.convertFile(fileData, prompt);

            if (result.success && result.markdown) {
                const processedMarkdown = ConversionService.postProcessConvertedMarkdown(result.markdown, this.settings);
                // 在链接下方插入转换结果
                const insertLine = lineNum + 1;
                const insertText = `\n${processedMarkdown}\n`;

                editor.replaceRange(insertText, { line: insertLine, ch: 0 });

                new Notice("转换成功！", 3000);
            } else {
                new Notice(`转换失败: ${result.error || '未知错误'}`, 5000);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`转换失败: ${errorMessage}`, 5000);
            console.error("转换文件失败:", error);
        }
    }

    /**
     * 显示转换对话框
     */
    private showConversionModal() {
        new ConversionModal(this.app, this).open();
    }

    /**
     * 显示文件选择对话框
     */
    private showFileSelectionModal() {
        // 这里可以创建一个文件选择器
        // 暂时使用转换对话框
        new ConversionModal(this.app, this).open();
    }

    /**
     * 选择文件夹并批量转换
     */
    private chooseFolderAndConvert() {
        const folders: TFolder[] = [];
        const all = this.app.vault.getAllLoadedFiles();
        all.forEach((f: TAbstractFile) => {
            if (f instanceof TFolder) folders.push(f);
        });

        new class FolderSuggest extends FuzzySuggestModal<TFolder> {
            constructor(private plugin: Ink2VaultPlugin, private items: TFolder[]) {
                super(plugin.app);
                this.setPlaceholder("选择一个文件夹进行批量转换...");
            }
            getItems(): TFolder[] { return this.items; }
            getItemText(item: TFolder): string { return item.path; }
            onChooseItem(item: TFolder) { this.plugin.convertFolder(item.path); }
        }(this, folders).open();
    }

    /**
     * 批量转换一个文件夹内的所有受支持文件（包含子文件夹）
     */
    private async convertFolder(folderPath: string) {
        // 验证配置
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }
        this.openConfirmModalForSelection({ mode: "folder", folderPath });
    }

    /**
     * 转换文件
     * 
     * @param filePath 文件路径
     */
    async convertFile(filePath: string, options?: { pdfPages?: number[] }) {
        // 验证配置
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        // 执行转换
        const result = await this.conversionService.convertFile(filePath, options);

        if (result.success) {
            new Notice(`转换成功！文件已保存到: ${result.outputPath}`, 5000);
        } else {
            new Notice(`转换失败: ${result.error}`, 5000);
        }
    }

    /**
     * 批量转换文件
     * 
     * @param filePaths 文件路径数组
     */
    async convertFiles(filePaths: string[], options?: { pdfPages?: number[] }) {
        // 验证配置
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        // 过滤不支持的文件
        const supportedFiles = filePaths.filter(path =>
            ConversionService.isFileSupported(path)
        );

        if (supportedFiles.length === 0) {
            new Notice("没有支持的文件", 3000);
            return;
        }

        // 执行批量转换（带总进度）
        const { BatchProgressModal } = await import("./ui/batch-progress-modal");
        const batch = new BatchProgressModal(this.app);
        batch.open();
        batch.setTotals(supportedFiles.length);

        const results = await this.conversionService.convertFiles(supportedFiles, ({ current, total, message }) => {
            batch.updateProgress(current);
            batch.setStatus(`${message} (${current}/${total})`);
        }, options);

        batch.close();

        // 统计结果
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        new Notice(
            `批量转换完成！成功: ${successCount}, 失败: ${failCount}`,
            5000
        );
    }

    async convertFilesMerged(filePaths: string[]) {
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        const result = await this.conversionService.convertFilesMerged(filePaths);
        if (result.success) {
            new Notice(`合并转换成功！文件已保存到: ${result.outputPath}`, 5000);
        } else if (result.error) {
            new Notice(`合并转换失败: ${result.error}`, 5000);
        }
    }

    async confirmAndConvertSelection(filePaths: string[], merge: boolean) {
        this.openConfirmModalForSelection({
            mode: merge ? "merge" : "files",
            filePaths
        });
    }

    private openConfirmModalForSelection(options: { mode: "file" | "files" | "folder" | "merge"; filePath?: string; filePaths?: string[]; folderPath?: string; }) {
        const modal = new ConfirmConversionModal(this.app, {
            mode: options.mode,
            filePath: options.filePath,
            filePaths: options.filePaths,
            folderPath: options.folderPath,
            settings: this.settings,
            onApplyOutputSettings: async (outputSettings) => {
                this.settings.outputSettings.outputDir = outputSettings.outputDir;
                this.settings.outputSettings.keepOriginalName = outputSettings.keepOriginalName;
                this.settings.outputSettings.outputExtension = outputSettings.outputExtension;
                this.settings.outputSettings.autoOpen = outputSettings.autoOpen;
                await this.saveSettings();
            },
            onConfirm: async ({ filePaths, pdfPages }) => {
                if (options.mode === "merge") {
                    await this.convertFilesMerged(filePaths);
                    return;
                }
                if (options.mode === "file") {
                    await this.convertFile(filePaths[0], { pdfPages });
                    return;
                }
                await this.convertFiles(filePaths, { pdfPages });
            }
        });
        modal.open();
    }

    /**
     * 打开设置
     */
    private openSettings() {
        const anyApp = this.app as any;
        try {
            anyApp?.setting?.open?.();
            anyApp?.setting?.openTabById?.(this.manifest.id);
        } catch {
            new Notice("请在设置中找到 Ink2Vault 插件进行配置", 5000);
        }
    }

    private toggleModel() {
        const enabledModels = Object.entries(this.settings.models)
            .filter(([_, config]) => config.enabled)
            .map(([id, _]) => id);

        if (enabledModels.length === 0) {
            new Notice("没有启用的模型，请在设置中配置", 5000);
            return;
        }

        const currentIndex = enabledModels.indexOf(this.settings.currentModel);
        const nextIndex = (currentIndex + 1) % enabledModels.length;
        const nextModel = enabledModels[nextIndex];

        this.settings.currentModel = nextModel;
        this.saveSettings();

        const modelName = this.settings.models[nextModel]?.name || nextModel;
        new Notice(`已切换到模型: ${modelName}`, 3000);
    }
}
