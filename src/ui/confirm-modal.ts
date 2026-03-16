import { App, Modal, Notice, TAbstractFile, TFile, TFolder, setIcon } from "obsidian";
import { ConversionService } from "../conversion-service";
import { FileProcessor } from "../file-processor";
import { PDFProcessor } from "../utils/pdf-processor";
import type { PluginSettings } from "../types";
import { FolderSuggestModal } from "./folder-suggest-modal";

type ConfirmMode = "file" | "files" | "folder" | "merge";

type ConfirmResult = {
    filePaths: string[];
    pdfPages?: number[];
};

type ConfirmOptions = {
    mode: ConfirmMode;
    filePath?: string;
    filePaths?: string[];
    folderPath?: string;
    settings: PluginSettings;
    onApplyOutputSettings?: (outputSettings: {
        outputDir: string;
        keepOriginalName: boolean;
        outputExtension: string;
        autoOpen: boolean;
    }) => void | Promise<void>;
    onConfirm: (result: ConfirmResult) => void | Promise<void>;
};

export class ConfirmConversionModal extends Modal {
    private options: ConfirmOptions;
    private includeSubfolders = true;
    private includeImages = true;
    private includePdfs = true;
    private pdfMode: "all" | "range" | "list" = "all";
    private pdfRangeStart = "";
    private pdfRangeEnd = "";
    private pdfList = "";
    private pdfTotalPages: number | null = null;
    private countsEl: HTMLElement | null = null;
    private confirmBtn: HTMLButtonElement | null = null;
    private pdfSectionEl: HTMLElement | null = null;
    private pdfInfoEl: HTMLElement | null = null;
    private estimateEl: HTMLElement | null = null;
    private outputInfoEl: HTMLElement | null = null;
    private draftOutputSettings: {
        outputDir: string;
        keepOriginalName: boolean;
        outputExtension: string;
        autoOpen: boolean;
    };

    constructor(app: App, options: ConfirmOptions) {
        super(app);
        this.options = options;
        const s = options.settings.outputSettings;
        this.draftOutputSettings = {
            outputDir: s.outputDir || "",
            keepOriginalName: !!s.keepOriginalName,
            outputExtension: s.outputExtension || "md",
            autoOpen: !!s.autoOpen
        };
        this.modalEl.addClass("ink2vault-modal");
        this.titleEl.setText("确认转换");
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // 1. 顶部摘要
        const summary = contentEl.createDiv({ cls: "confirm-modal-summary" });
        summary.setText(this.getModeText());

        // 2. 转换范围与对象 (仅文件夹模式显示)
        if (this.options.mode === "folder") {
            const rangeSection = contentEl.createDiv({ cls: "confirm-modal-section" });
            rangeSection.createEl("div", { text: "转换范围", cls: "confirm-modal-header" });
            
            const folderRow = rangeSection.createDiv({ cls: "confirm-modal-row" });
            folderRow.createDiv({ text: "文件夹", cls: "confirm-modal-label" });
            folderRow.createDiv({ text: this.options.folderPath || "/", cls: "confirm-modal-value", attr: { style: "font-family: monospace;" } });

            const filterRow = rangeSection.createDiv({ cls: "confirm-modal-row" });
            filterRow.createDiv({ text: "包含", cls: "confirm-modal-label" });
            const filterGroup = filterRow.createDiv({ cls: "confirm-modal-input-group" });

            const subfolderLabel = filterGroup.createEl("label", { attr: { style: "display:flex; align-items:center; gap:4px; margin-right:12px;" } });
            const subfolderCheckbox = subfolderLabel.createEl("input", { type: "checkbox" });
            subfolderCheckbox.checked = this.includeSubfolders;
            subfolderLabel.createSpan({ text: "子文件夹" });
            subfolderCheckbox.addEventListener("change", () => {
                this.includeSubfolders = subfolderCheckbox.checked;
                this.refreshCounts();
            });

            const imageLabel = filterGroup.createEl("label", { attr: { style: "display:flex; align-items:center; gap:4px; margin-right:12px;" } });
            const imageCheckbox = imageLabel.createEl("input", { type: "checkbox" });
            imageCheckbox.checked = this.includeImages;
            imageLabel.createSpan({ text: "图片" });
            imageCheckbox.addEventListener("change", () => {
                this.includeImages = imageCheckbox.checked;
                this.refreshCounts();
            });

            const pdfLabel = filterGroup.createEl("label", { attr: { style: "display:flex; align-items:center; gap:4px;" } });
            const pdfCheckbox = pdfLabel.createEl("input", { type: "checkbox" });
            pdfCheckbox.checked = this.includePdfs;
            pdfLabel.createSpan({ text: "PDF" });
            pdfCheckbox.addEventListener("change", () => {
                this.includePdfs = pdfCheckbox.checked;
                this.refreshCounts();
                this.togglePdfSection();
            });
        }

        // 3. 统计信息 (简单显示)
        this.countsEl = contentEl.createDiv({ attr: { style: "margin-bottom: 16px; font-size: 0.9em; color: var(--text-muted);" } });
        this.refreshCounts();

        // 4. PDF 设置
        this.pdfSectionEl = contentEl.createDiv({ cls: "confirm-modal-section", attr: { style: "display:none;" } });
        this.buildPdfSection(this.pdfSectionEl);
        await this.initPdfInfo();
        this.togglePdfSection();

        // 5. 输出设置
        const outputSection = contentEl.createDiv({ cls: "confirm-modal-section" });
        outputSection.createEl("div", { text: "输出设置", cls: "confirm-modal-header" });
        this.outputInfoEl = outputSection.createDiv();
        this.renderOutputControls();

        // 6. 底部摘要与预估
        const footerSection = contentEl.createDiv({ cls: "confirm-modal-footer-summary" });
        this.estimateEl = footerSection.createDiv();
        this.refreshEstimate();

        // 7. 按钮
        const buttonRow = contentEl.createDiv({ attr: { style: "display:flex; justify-content:flex-end; gap:10px; margin-top: 16px;" } });
        const cancelBtn = buttonRow.createEl("button", { text: "返回" });
        cancelBtn.onclick = () => this.close();

        this.confirmBtn = buttonRow.createEl("button", { text: "开始转换", cls: "mod-cta" });
        this.confirmBtn.onclick = async () => {
            const result = this.buildResult();
            if (!result) return;
            const applied = this.applyDraftOutputSettings();
            try {
                await Promise.resolve(this.options.onApplyOutputSettings?.(applied));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                new Notice(`保存输出设置失败: ${errorMessage}`, 5000);
                return;
            }
            this.close();
            Promise.resolve(this.options.onConfirm(result)).catch((error) => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                new Notice(`开始转换失败: ${errorMessage}`, 5000);
                console.error("Start conversion failed:", error);
            });
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    private getModeText(): string {
        switch (this.options.mode) {
            case "folder":
                return "您正在转换一个文件夹下的文件。";
            case "merge":
                return "您正在将多个图片合并转换为单个 Markdown 文档。";
            case "files":
                return "您正在批量转换多个选定的文件。";
            case "file":
            default:
                return "您正在转换单个文件。";
        }
    }

    private buildPdfSection(container: HTMLElement) {
        container.createEl("div", { text: "PDF页范围", cls: "confirm-modal-header" });
        this.pdfInfoEl = container.createDiv({ attr: { style: "margin-bottom: 8px; font-size: 0.85em; opacity:.8;" } });
        this.pdfInfoEl.setText("读取页数中...");

        const modeGroup = container.createDiv({ cls: "confirm-modal-input-group", attr: { style: "flex-direction: column; align-items: flex-start; gap: 8px;" } });

        // 全部页
        const allRow = modeGroup.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px;" } });
        const allRadio = allRow.createEl("input", { attr: { type: "radio", name: "pdf-range", value: "all" } });
        allRadio.checked = true;
        allRow.createEl("label", { text: "全部页" });
        allRadio.addEventListener("change", () => {
            if (allRadio.checked) this.pdfMode = "all";
            this.refreshEstimate();
        });

        // 范围
        const rangeRow = modeGroup.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px;" } });
        const rangeRadio = rangeRow.createEl("input", { attr: { type: "radio", name: "pdf-range", value: "range" } });
        rangeRow.createEl("label", { text: "页码范围" });
        const rangeStart = rangeRow.createEl("input", { type: "number", placeholder: "起始", cls: "confirm-modal-input-sm", attr: { style: "width: 70px;" } });
        rangeRow.createSpan({ text: "-" });
        const rangeEnd = rangeRow.createEl("input", { type: "number", placeholder: "结束", cls: "confirm-modal-input-sm", attr: { style: "width: 70px;" } });
        
        rangeStart.addEventListener("input", () => { this.pdfRangeStart = rangeStart.value; this.refreshEstimate(); rangeRadio.checked = true; this.pdfMode = "range"; });
        rangeEnd.addEventListener("input", () => { this.pdfRangeEnd = rangeEnd.value; this.refreshEstimate(); rangeRadio.checked = true; this.pdfMode = "range"; });
        rangeRadio.addEventListener("change", () => {
            if (rangeRadio.checked) this.pdfMode = "range";
            this.refreshEstimate();
        });

        // 指定页
        const listRow = modeGroup.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px; width: 100%;" } });
        const listRadio = listRow.createEl("input", { attr: { type: "radio", name: "pdf-range", value: "list" } });
        listRow.createEl("label", { text: "指定页" });
        const listInput = listRow.createEl("input", { type: "text", placeholder: "例如: 1,3,5-7", attr: { style: "flex:1;" } });
        
        listInput.addEventListener("input", () => { this.pdfList = listInput.value; this.refreshEstimate(); listRadio.checked = true; this.pdfMode = "list"; });
        listRadio.addEventListener("change", () => {
            if (listRadio.checked) this.pdfMode = "list";
            this.refreshEstimate();
        });
    }

    private async initPdfInfo() {
        const pdfTargets = this.getPdfTargets();
        if (pdfTargets.length === 1) {
            const pdfPath = pdfTargets[0];
            const file = this.app.vault.getAbstractFileByPath(pdfPath);
            if (file instanceof TFile) {
                try {
                    const buffer = await this.app.vault.readBinary(file);
                    const info = await PDFProcessor.getPdfInfo(buffer);
                    this.pdfTotalPages = info.numPages;
                    if (this.pdfInfoEl) {
                        this.pdfInfoEl.setText(`当前PDF总页数：${info.numPages}`);
                    }
                    this.refreshEstimate();
                } catch {
                    if (this.pdfInfoEl) {
                        this.pdfInfoEl.setText("无法读取PDF页数");
                    }
                }
            }
        } else if (this.pdfInfoEl) {
            this.pdfInfoEl.setText(`已选择 ${pdfTargets.length} 个PDF文件，页码范围将应用于所有文件`);
        }
    }

    private togglePdfSection() {
        if (!this.pdfSectionEl) return;
        const pdfTargets = this.getPdfTargets();
        if (pdfTargets.length > 0 && (this.options.mode !== "merge")) {
            this.pdfSectionEl.style.display = "";
        } else {
            this.pdfSectionEl.style.display = "none";
        }
        this.refreshEstimate();
    }

    private refreshCounts() {
        if (!this.countsEl) return;
        const { images, pdfs, total } = this.getCounts();
        this.countsEl.setText(`已选：图片 ${images} 张 | PDF ${pdfs} 个 | 总计 ${total} 个文件`);
        if (this.confirmBtn) {
            this.confirmBtn.disabled = total === 0;
        }
        this.refreshEstimate();
    }

    private renderOutputControls() {
        if (!this.outputInfoEl) return;
        this.outputInfoEl.empty();

        // 1. 输出目录 (带选择按钮)
        const dirRow = this.outputInfoEl.createDiv({ cls: "confirm-modal-row" });
        dirRow.createDiv({ text: "输出目录", cls: "confirm-modal-label" });
        const dirGroup = dirRow.createDiv({ cls: "confirm-modal-input-group" });
        
        const dirInput = dirGroup.createEl("input", {
            type: "text",
            value: this.draftOutputSettings.outputDir,
            placeholder: "留空 = Vault 根目录"
        });
        dirInput.style.flex = "1";
        
        const folderBtn = dirGroup.createEl("div", { cls: "confirm-modal-folder-btn", attr: { "aria-label": "选择目录" } });
        setIcon(folderBtn, "folder");
        folderBtn.onclick = () => {
            new FolderSuggestModal(this.app, (folder) => {
                dirInput.value = folder.path;
                this.draftOutputSettings.outputDir = folder.path;
                // 触发 input 事件以确保可能有其他监听器感知
                dirInput.dispatchEvent(new Event("input"));
            }).open();
        };

        dirInput.addEventListener("input", () => {
            this.draftOutputSettings.outputDir = dirInput.value;
        });

        // 2. 文件扩展名
        const extRow = this.outputInfoEl.createDiv({ cls: "confirm-modal-row" });
        extRow.createDiv({ text: "扩展名", cls: "confirm-modal-label" });
        const extGroup = extRow.createDiv({ cls: "confirm-modal-input-group" });
        
        const extInput = extGroup.createEl("input", {
            type: "text",
            value: this.draftOutputSettings.outputExtension,
            placeholder: "md",
            attr: { style: "width: 100px;" }
        });
        
        const syncExt = () => {
            const next = this.sanitizeExtension(extInput.value);
            this.draftOutputSettings.outputExtension = next;
            extInput.value = next;
        };
        extInput.addEventListener("blur", syncExt);
        extInput.addEventListener("change", syncExt);

        // 3. 命名策略
        const namingRow = this.outputInfoEl.createDiv({ cls: "confirm-modal-row" });
        namingRow.createDiv({ text: "命名策略", cls: "confirm-modal-label" });
        const namingGroup = namingRow.createDiv({ cls: "confirm-modal-input-group" });
        
        const namingSelect = namingGroup.createEl("select", { attr: { style: "flex:1;" } });
        namingSelect.createEl("option", { value: "original", text: "保持原文件名" });
        namingSelect.createEl("option", { value: "ai", text: "优先AI标题，其次时间戳" });
        namingSelect.value = this.draftOutputSettings.keepOriginalName ? "original" : "ai";
        namingSelect.addEventListener("change", () => {
            this.draftOutputSettings.keepOriginalName = namingSelect.value === "original";
        });

        // 4. 自动打开
        const autoOpenRow = this.outputInfoEl.createDiv({ cls: "confirm-modal-row" });
        autoOpenRow.createDiv({ text: "", cls: "confirm-modal-label" }); // Empty label for alignment
        const autoOpenGroup = autoOpenRow.createDiv({ cls: "confirm-modal-input-group" });
        
        const autoOpenLabel = autoOpenGroup.createEl("label", { attr: { style: "display:flex; align-items:center; gap:8px; cursor:pointer;" } });
        const autoOpenCheckbox = autoOpenLabel.createEl("input", { type: "checkbox" });
        autoOpenCheckbox.checked = this.draftOutputSettings.autoOpen;
        autoOpenLabel.createSpan({ text: "转换后自动打开文件" });
        
        autoOpenCheckbox.addEventListener("change", () => {
            this.draftOutputSettings.autoOpen = autoOpenCheckbox.checked;
        });

        // 5. 额外信息
        if (this.options.mode === "merge") {
            const infoRow = this.outputInfoEl.createDiv({ cls: "confirm-modal-row", attr: { style: "margin-top:8px;" } });
            infoRow.createDiv({ text: "", cls: "confirm-modal-label" });
            infoRow.createDiv({ text: "合并输出：首个文件名 + -merged", attr: { style: "font-size: 0.85em; opacity: 0.7;" } });
        }
    }

    private sanitizeOutputDir(dir: string): string {
        const trimmed = (dir || "").trim();
        if (!trimmed) return "";
        return trimmed.replace(/^\/+/, "").replace(/\/+$/, "");
    }

    private sanitizeExtension(ext: string): string {
        const trimmed = (ext || "").trim().replace(/^\./, "");
        const cleaned = trimmed.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
        return cleaned || "md";
    }

    private applyDraftOutputSettings(): { outputDir: string; keepOriginalName: boolean; outputExtension: string; autoOpen: boolean } {
        const applied = {
            outputDir: this.sanitizeOutputDir(this.draftOutputSettings.outputDir),
            keepOriginalName: !!this.draftOutputSettings.keepOriginalName,
            outputExtension: this.sanitizeExtension(this.draftOutputSettings.outputExtension),
            autoOpen: !!this.draftOutputSettings.autoOpen
        };
        this.options.settings.outputSettings.outputDir = applied.outputDir;
        this.options.settings.outputSettings.keepOriginalName = applied.keepOriginalName;
        this.options.settings.outputSettings.outputExtension = applied.outputExtension;
        this.options.settings.outputSettings.autoOpen = applied.autoOpen;
        return applied;
    }

    private refreshEstimate() {
        if (!this.estimateEl) return;
        const imageCount = this.getImageCount();
        const pdfTargets = this.getPdfTargets();
        const pdfInfo = this.getPdfPageCountInfo();
        const imagesPerRequest = this.options.settings.advancedSettings?.imagesPerRequest || 1;
        
        this.estimateEl.empty();
        
        // 顶部总览
        const totalFiles = this.getCounts().total;
        
        const summaryItem = this.estimateEl.createDiv({ cls: "confirm-modal-footer-item", attr: { style: "margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--background-modifier-border);" } });
        summaryItem.createDiv({ text: "本次转换任务摘要" });
        
        const detailsItem = this.estimateEl.createDiv({ cls: "confirm-modal-footer-item" });
        detailsItem.createDiv({ text: "待处理图片" });
        detailsItem.createDiv({ text: `${imageCount} 张`, cls: "confirm-modal-footer-value" });

        const pdfItem = this.estimateEl.createDiv({ cls: "confirm-modal-footer-item" });
        pdfItem.createDiv({ text: "待处理PDF页" });
        const pdfText = pdfTargets.length === 0
            ? "0 页"
            : pdfInfo.count === null
                ? "未知"
                : `${pdfInfo.count} 页${pdfInfo.approx ? " (估算)" : ""}`;
        pdfItem.createDiv({ text: pdfText, cls: "confirm-modal-footer-value" });

        const requestItem = this.estimateEl.createDiv({ cls: "confirm-modal-footer-item", attr: { style: "margin-top: 8px;" } });
        requestItem.createDiv({ text: "预计消耗AI请求" });
        
        let batchText = "";
        if (pdfTargets.length > 0 && pdfInfo.count === null) {
            const minBatches = imageCount > 0 ? Math.ceil(imageCount / imagesPerRequest) : 0;
            batchText = minBatches > 0 ? `≥ ${minBatches} 批 (不含PDF)` : "无法估算";
        } else {
            const totalImages = imageCount + (pdfInfo.count || 0);
            const batches = totalImages > 0 ? Math.ceil(totalImages / imagesPerRequest) : 0;
            batchText = `${batches} 批`;
        }
        requestItem.createDiv({ text: batchText, cls: "confirm-modal-footer-value", attr: { style: "color: var(--interactive-accent);" } });
    }

    private getImageCount(): number {
        return this.getFilteredFiles().filter(path => this.isImageLike(path) && !this.isPdf(path)).length;
    }

    private getPdfPageCountInfo(): { count: number | null; approx: boolean } {
        const pdfTargets = this.getPdfTargets();
        if (pdfTargets.length === 0) return { count: 0, approx: false };

        if (this.pdfMode === "all") {
            if (pdfTargets.length === 1 && this.pdfTotalPages) {
                return { count: this.pdfTotalPages, approx: false };
            }
            return { count: null, approx: pdfTargets.length > 1 };
        }

        if (this.pdfMode === "range") {
            const start = parseInt(this.pdfRangeStart);
            const end = parseInt(this.pdfRangeEnd);
            if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
                return { count: null, approx: pdfTargets.length > 1 };
            }
            const count = end - start + 1;
            return pdfTargets.length > 1
                ? { count: count * pdfTargets.length, approx: true }
                : { count, approx: false };
        }

        const parsed = this.parsePageList(this.pdfList);
        if (parsed.length === 0) return { count: null, approx: pdfTargets.length > 1 };
        const listCount = parsed.length;
        return pdfTargets.length > 1
            ? { count: listCount * pdfTargets.length, approx: true }
            : { count: listCount, approx: false };
    }

    private getCounts(): { images: number; pdfs: number; total: number } {
        const files = this.getFilteredFiles();
        let images = 0;
        let pdfs = 0;
        files.forEach(path => {
            if (this.isPdf(path)) pdfs++;
            else if (this.isImageLike(path)) images++;
        });
        return { images, pdfs, total: files.length };
    }

    private getPdfTargets(): string[] {
        return this.getFilteredFiles().filter(path => this.isPdf(path));
    }

    private getFilteredFiles(): string[] {
        const baseFiles = this.getBaseFiles();
        if (this.options.mode !== "folder") {
            return baseFiles;
        }
        return baseFiles.filter(path => {
            const isPdf = this.isPdf(path);
            const isImage = this.isImageLike(path);
            if (isPdf && this.includePdfs) return true;
            if (isImage && this.includeImages) return true;
            return false;
        });
    }

    private getBaseFiles(): string[] {
        if (this.options.mode === "file") {
            return this.options.filePath ? [this.options.filePath] : [];
        }
        if (this.options.mode === "files" || this.options.mode === "merge") {
            return this.options.filePaths || [];
        }
        if (this.options.mode === "folder") {
            const folderPath = this.options.folderPath;
            if (!folderPath) return [];
            const folder = this.app.vault.getAbstractFileByPath(folderPath);
            if (!(folder instanceof TFolder)) return [];
            
            const files: string[] = [];
            const traverse = (f: TFolder) => {
                f.children.forEach(child => {
                    if (child instanceof TFile) {
                        files.push(child.path);
                    } else if (child instanceof TFolder && this.includeSubfolders) {
                        traverse(child);
                    }
                });
            };
            traverse(folder);
            return files;
        }
        return [];
    }

    private isImageLike(path: string): boolean {
        return /\.(png|jpg|jpeg|webp)$/i.test(path);
    }

    private isPdf(path: string): boolean {
        return /\.pdf$/i.test(path);
    }

    private parsePageList(listStr: string): number[] {
        const pages = new Set<number>();
        const parts = listStr.split(/[,;]/);
        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            if (trimmed.includes("-")) {
                const [startStr, endStr] = trimmed.split("-");
                const start = parseInt(startStr);
                const end = parseInt(endStr);
                if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
                    for (let i = start; i <= end; i++) pages.add(i);
                }
            } else {
                const p = parseInt(trimmed);
                if (!isNaN(p) && p > 0) pages.add(p);
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    }

    private buildResult(): ConfirmResult | null {
        // Validate PDF range
        const pdfTargets = this.getPdfTargets();
        let pdfPages: number[] | undefined;

        if (pdfTargets.length > 0 && this.options.mode !== "merge") {
            if (this.pdfMode === "range") {
                const start = parseInt(this.pdfRangeStart);
                const end = parseInt(this.pdfRangeEnd);
                if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
                    new Notice("请输入有效的页码范围");
                    return null;
                }
                pdfPages = [];
                for (let i = start; i <= end; i++) pdfPages.push(i);
            } else if (this.pdfMode === "list") {
                const parsed = this.parsePageList(this.pdfList);
                if (parsed.length === 0) {
                    new Notice("请输入有效的指定页码");
                    return null;
                }
                pdfPages = parsed;
            }
        }

        return {
            filePaths: this.getFilteredFiles(),
            pdfPages
        };
    }
}
