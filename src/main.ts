// 修改后的导入
import { FuzzySuggestModal, MarkdownView, Menu, MenuItem, Notice, Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import { ConversionModal } from "./conversion-modal";
import { ConversionService } from "./conversion-service";
import { DEFAULT_SETTINGS } from "./defaults";
import { AIService } from "./services/ai-service";
import type { PluginSettings } from "./types";
import { SimpleSettingsTab } from "./ui/simple-settings-tab";
import { PDFProcessor } from "./utils/pdf-processor";

export default class HandMarkdownAIPlugin extends Plugin {
    settings: PluginSettings;
    conversionService: ConversionService;
    aiService: AIService;

    async onload() {
        console.log("加载 Hand Markdown AI 插件");

        await this.loadSettings();

        // 初始化 PDF Worker (Obsidian 内置)
        PDFProcessor.initWorker();

        this.aiService = new AIService(this.settings, this.app);
        this.conversionService = new ConversionService(this.app, this.settings);

        this.addSettingTab(new SimpleSettingsTab(this.app, this));

        this.registerCommands();

        this.registerContextMenu();


        this.registerPreviewImageContextMenu(); // 注册 markdown 预览图片的原生右键菜单

        // 根据需求移除 Ribbon 图标点击入口

        console.log("Hand Markdown AI 插件加载完成");
    }

    onunload() {
        console.log("卸载 Hand Markdown AI 插件");
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
    private registerCommands() {
        // 转换当前文件
        this.addCommand({
            id: "convert-current-file",
            name: "转换当前文件",
            hotkeys: [
                {
                    modifiers: ["Mod", "Alt"],
                    key: "C"
                }
            ],
            checkCallback: (checking: boolean) => {
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

        // 选择文件夹并批量转换
        this.addCommand({
            id: "convert-folder",
            name: "转换文件夹内所有文件",
            callback: () => {
                this.chooseFolderAndConvert();
            }
        });
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
                                await this.handleConvertFile(file);
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
                                .setTitle("重试失败页（输出文件）")
                                .setIcon("refresh-ccw")
                                .onClick(() => {
                                    this.conversionService.retryFailedPagesFromOutput(file.path);
                                });
                        });
                        menu.addItem((item) => {
                            item
                                .setTitle("重试指定页（输出文件）")
                                .setIcon("rotate-ccw")
                                .onClick(() => {
                                    const pageStr = prompt("请输入要重试的页码：");
                                    const pageNum = pageStr ? parseInt(pageStr) : NaN;
                                    if (!isNaN(pageNum) && pageNum > 0) {
                                        this.conversionService.retrySinglePageFromOutput(file.path, undefined, pageNum);
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
                                this.convertFolder(file.path);
                            });
                    });
                }
            })
        );
    }



    /**
     * 注册 markdown 预览图片的原生右键菜单（支持所有图片，包括 Excalidraw 导出 PNG）
     */
    private registerPreviewImageContextMenu() {
        this.registerDomEvent(document, "contextmenu", async (evt: MouseEvent) => {
            // 只处理 markdown 预览视图下的图片
            const img = evt.target as HTMLImageElement;
            if (!img || img.tagName !== "IMG") return;
            const preview = img.closest(".markdown-preview-view");
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
                            await this.handleConvertFile(file);
                        });
                });
                menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
            }
        });
    }

    /**
     * 统一的文件转换处理器
     * 根据上下文决定是插入到编辑器还是创建新文件
     */
    private async handleConvertFile(file: TFile) {
        // 验证配置
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        // 检查当前活动编辑器中是否有该文件的链接被选中
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && activeView.editor) {
            const editor = activeView.editor;
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const linkInfo = this.extractImageAtCursor(line, cursor.ch);

            // 如果光标在链接上，且链接指向当前文件，则插入到编辑器
            if (linkInfo) {
                const currentFile = activeView.file;
                const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkInfo.path, currentFile?.path || '');

                if (targetFile && targetFile.path === file.path) {
                    // 在编辑器中插入
                    await this.convertLinkInEditor(linkInfo, editor, activeView, cursor.line);
                    return;
                }
            }
        }

        // 否则创建新文件
        await this.convertFile(file.path);
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
                // 在链接下方插入转换结果
                const insertLine = lineNum + 1;
                const insertText = `\n${result.markdown}\n`;

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
            constructor(private plugin: HandMarkdownAIPlugin, private items: TFolder[]) {
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

        const files: string[] = [];
        const root = this.app.vault.getAbstractFileByPath(folderPath);
        const walk = (node: TAbstractFile | null) => {
            if (!node) return;
            if (node instanceof TFile) {
                if (ConversionService.isFileSupported(node.path)) files.push(node.path);
            } else if (node instanceof TFolder) {
                node.children.forEach(ch => walk(ch));
            }
        };
        walk(root);

        if (files.length === 0) {
            new Notice("该文件夹内没有可转换的文件", 3000);
            return;
        }

        new Notice(`开始批量转换，共 ${files.length} 个文件...`, 3000);
        await this.convertFiles(files);
    }

    /**
     * 转换文件
     * 
     * @param filePath 文件路径
     */
    async convertFile(filePath: string) {
        // 验证配置
        if (!this.conversionService.validateConfig()) {
            new Notice("请先在设置中配置AI提供商", 5000);
            this.openSettings();
            return;
        }

        // 执行转换
        const result = await this.conversionService.convertFile(filePath);

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
    async convertFiles(filePaths: string[]) {
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
        });

        batch.close();

        // 统计结果
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        new Notice(
            `批量转换完成！成功: ${successCount}, 失败: ${failCount}`,
            5000
        );
    }

    /**
     * 打开设置
     */
    private openSettings() {
        // Obsidian会自动在设置中显示插件设置
        // 用户可以通过 Ctrl/Cmd + , 打开设置
        new Notice("请在设置中找到 Hand Markdown AI 插件进行配置", 5000);
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