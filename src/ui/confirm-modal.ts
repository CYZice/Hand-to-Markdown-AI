import { App, Modal, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { ConversionService } from "../conversion-service";
import { FileProcessor } from "../file-processor";
import { PDFProcessor } from "../utils/pdf-processor";
import type { PluginSettings } from "../types";

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

    constructor(app: App, options: ConfirmOptions) {
        super(app);
        this.options = options;
        this.modalEl.addClass("hand-markdown-ai-modal");
        this.titleEl.setText("确认转换");
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const summary = contentEl.createDiv({ attr: { style: "margin-bottom: 12px; font-size: 13px;" } });
        summary.setText(this.getModeText());

        const rangeSection = contentEl.createDiv({ attr: { style: "margin-bottom: 12px;" } });

        if (this.options.mode === "folder") {
            rangeSection.createEl("div", { text: `文件夹：${this.options.folderPath || ""}`, attr: { style: "margin-bottom: 8px;" } });

            const subfolderRow = rangeSection.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px; margin-bottom: 8px;" } });
            const subfolderCheckbox = subfolderRow.createEl("input", { type: "checkbox" }) as HTMLInputElement;
            subfolderCheckbox.checked = this.includeSubfolders;
            subfolderRow.createEl("label", { text: "包含子文件夹" });
            subfolderCheckbox.addEventListener("change", () => {
                this.includeSubfolders = subfolderCheckbox.checked;
                this.refreshCounts();
            });

            const typeRow = rangeSection.createDiv({ attr: { style: "display:flex; align-items:center; gap:12px;" } });
            const imageCheckbox = typeRow.createEl("input", { type: "checkbox" }) as HTMLInputElement;
            imageCheckbox.checked = this.includeImages;
            typeRow.createEl("label", { text: "图片" });
            imageCheckbox.addEventListener("change", () => {
                this.includeImages = imageCheckbox.checked;
                this.refreshCounts();
            });

            const pdfCheckbox = typeRow.createEl("input", { type: "checkbox" }) as HTMLInputElement;
            pdfCheckbox.checked = this.includePdfs;
            typeRow.createEl("label", { text: "PDF" });
            pdfCheckbox.addEventListener("change", () => {
                this.includePdfs = pdfCheckbox.checked;
                this.refreshCounts();
                this.togglePdfSection();
            });
        }

        this.countsEl = contentEl.createDiv({ attr: { style: "margin-bottom: 12px; font-size: 12px; opacity:.85;" } });
        this.refreshCounts();

        this.pdfSectionEl = contentEl.createDiv({ attr: { style: "margin-bottom: 12px; display:none;" } });
        this.buildPdfSection(this.pdfSectionEl);
        await this.initPdfInfo();
        this.togglePdfSection();

        const outputSection = contentEl.createDiv({ attr: { style: "margin-bottom: 12px;" } });
        outputSection.createEl("div", { text: "输出设置", attr: { style: "margin-bottom: 6px; font-weight:600;" } });
        this.outputInfoEl = outputSection.createDiv({ attr: { style: "font-size: 12px; opacity:.85; display:flex; flex-direction:column; gap:4px;" } });
        this.renderOutputInfo();

        const estimateSection = contentEl.createDiv({ attr: { style: "margin-bottom: 12px;" } });
        estimateSection.createEl("div", { text: "成本预估", attr: { style: "margin-bottom: 6px; font-weight:600;" } });
        this.estimateEl = estimateSection.createDiv({ attr: { style: "font-size: 12px; opacity:.85; display:flex; flex-direction:column; gap:4px;" } });
        this.refreshEstimate();

        const buttonRow = contentEl.createDiv({ attr: { style: "display:flex; justify-content:flex-end; gap:10px; margin-top: 16px;" } });
        const cancelBtn = buttonRow.createEl("button", { text: "返回" }) as HTMLButtonElement;
        cancelBtn.onclick = () => this.close();

        this.confirmBtn = buttonRow.createEl("button", { text: "开始转换", cls: "mod-cta" }) as HTMLButtonElement;
        this.confirmBtn.onclick = async () => {
            const result = this.buildResult();
            if (!result) return;
            await this.options.onConfirm(result);
            this.close();
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    private getModeText(): string {
        switch (this.options.mode) {
            case "folder":
                return "转换范围：文件夹";
            case "merge":
                return "转换方式：多图合并为单个Markdown";
            case "files":
                return "转换范围：多文件";
            case "file":
            default:
                return "转换范围：单文件";
        }
    }

    private buildPdfSection(container: HTMLElement) {
        container.createEl("div", { text: "PDF页范围", attr: { style: "margin-bottom: 6px; font-weight:600;" } });
        this.pdfInfoEl = container.createDiv({ attr: { style: "margin-bottom: 8px; font-size: 12px; opacity:.8;" } });
        this.pdfInfoEl.setText("读取页数中...");

        const modeRow = container.createDiv({ attr: { style: "display:flex; flex-direction:column; gap:6px;" } });

        const allRow = modeRow.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px;" } });
        const allRadio = allRow.createEl("input", { attr: { type: "radio", name: "pdf-range", value: "all" } }) as HTMLInputElement;
        allRadio.checked = true;
        allRow.createEl("label", { text: "全部页" });
        allRadio.addEventListener("change", () => {
            if (allRadio.checked) this.pdfMode = "all";
            this.refreshEstimate();
        });

        const rangeRow = modeRow.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px;" } });
        const rangeRadio = rangeRow.createEl("input", { attr: { type: "radio", name: "pdf-range", value: "range" } }) as HTMLInputElement;
        rangeRow.createEl("label", { text: "页码范围" });
        const rangeStart = rangeRow.createEl("input", { type: "number", placeholder: "起始", attr: { style: "width: 80px;" } }) as HTMLInputElement;
        const rangeEnd = rangeRow.createEl("input", { type: "number", placeholder: "结束", attr: { style: "width: 80px;" } }) as HTMLInputElement;
        rangeStart.addEventListener("input", () => { this.pdfRangeStart = rangeStart.value; this.refreshEstimate(); });
        rangeEnd.addEventListener("input", () => { this.pdfRangeEnd = rangeEnd.value; this.refreshEstimate(); });
        rangeRadio.addEventListener("change", () => {
            if (rangeRadio.checked) this.pdfMode = "range";
            this.refreshEstimate();
        });

        const listRow = modeRow.createDiv({ attr: { style: "display:flex; align-items:center; gap:8px;" } });
        const listRadio = listRow.createEl("input", { attr: { type: "radio", name: "pdf-range", value: "list" } }) as HTMLInputElement;
        listRow.createEl("label", { text: "指定页" });
        const listInput = listRow.createEl("input", { type: "text", placeholder: "1,3,5-7", attr: { style: "flex:1;" } }) as HTMLInputElement;
        listInput.addEventListener("input", () => { this.pdfList = listInput.value; this.refreshEstimate(); });
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
                        this.pdfInfoEl.setText(`总页数：${info.numPages}`);
                    }
                    this.refreshEstimate();
                } catch {
                    if (this.pdfInfoEl) {
                        this.pdfInfoEl.setText("无法读取页数");
                    }
                }
            }
        } else if (this.pdfInfoEl) {
            this.pdfInfoEl.setText("多PDF文件，页数不做校验");
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
        this.countsEl.setText(`图片 ${images} | PDF ${pdfs} | 总计 ${total}`);
        if (this.confirmBtn) {
            this.confirmBtn.disabled = total === 0;
        }
        this.refreshEstimate();
    }

    private renderOutputInfo() {
        if (!this.outputInfoEl) return;
        const { outputSettings } = this.options.settings;
        this.outputInfoEl.empty();
        const outputDir = (outputSettings.outputDir || "").trim();
        const outputDirText = outputDir ? outputDir : "Vault 根目录";
        const namingText = outputSettings.keepOriginalName ? "保持原文件名" : "优先AI标题，其次时间戳";
        this.outputInfoEl.createDiv({ text: `输出目录：${outputDirText}` });
        this.outputInfoEl.createDiv({ text: `文件扩展名：.${outputSettings.outputExtension}` });
        this.outputInfoEl.createDiv({ text: `命名策略：${namingText}` });
        this.outputInfoEl.createDiv({ text: "同名处理：自动加序号，不覆盖" });
        this.outputInfoEl.createDiv({ text: `自动打开：${outputSettings.autoOpen ? "是" : "否"}` });
        if (this.options.mode === "merge") {
            this.outputInfoEl.createDiv({ text: "合并输出：首个文件名 + -merged" });
        }
    }

    private refreshEstimate() {
        if (!this.estimateEl) return;
        const imageCount = this.getImageCount();
        const pdfTargets = this.getPdfTargets();
        const pdfInfo = this.getPdfPageCountInfo();
        const imagesPerRequest = this.options.settings.advancedSettings?.imagesPerRequest || 1;
        this.estimateEl.empty();

        const pdfText = pdfTargets.length === 0
            ? "PDF页：0"
            : pdfInfo.count === null
                ? "PDF页：未知"
                : `PDF页：${pdfInfo.count}${pdfInfo.approx ? "（估算）" : ""}`;
        this.estimateEl.createDiv({ text: `图片：${imageCount}` });
        this.estimateEl.createDiv({ text: pdfText });

        if (pdfTargets.length > 0 && pdfInfo.count === null) {
            const minBatches = imageCount > 0 ? Math.ceil(imageCount / imagesPerRequest) : 0;
            const prefix = minBatches > 0 ? `≥ ${minBatches}` : "无法估算";
            this.estimateEl.createDiv({ text: `预计AI请求：${prefix} 批（不含PDF）` });
            this.estimateEl.createDiv({ text: `每批图片数：${imagesPerRequest}` });
            return;
        }

        const totalImages = imageCount + (pdfInfo.count || 0);
        const batches = totalImages > 0 ? Math.ceil(totalImages / imagesPerRequest) : 0;
        this.estimateEl.createDiv({ text: `预计AI请求：${batches} 批` });
        this.estimateEl.createDiv({ text: `每批图片数：${imagesPerRequest}` });
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
            return this.options.filePaths ? this.options.filePaths.slice() : [];
        }
        if (this.options.mode === "folder") {
            return this.collectFolderFiles(this.options.folderPath || "", this.includeSubfolders);
        }
        return [];
    }

    private collectFolderFiles(folderPath: string, includeSubfolders: boolean): string[] {
        const root = this.app.vault.getAbstractFileByPath(folderPath);
        const files: string[] = [];
        const walk = (node: TAbstractFile | null) => {
            if (!node) return;
            if (node instanceof TFile) {
                if (ConversionService.isFileSupported(node.path)) {
                    files.push(node.path);
                }
            } else if (node instanceof TFolder) {
                node.children.forEach(child => {
                    if (includeSubfolders || child instanceof TFile) {
                        walk(child);
                    }
                });
            }
        };
        walk(root);
        return files;
    }

    private isPdf(path: string): boolean {
        return FileProcessor.getFileMimeType(path) === "application/pdf";
    }

    private isImageLike(path: string): boolean {
        const lower = path.toLowerCase();
        if (lower.endsWith(".excalidraw") || lower.endsWith(".excalidraw.md")) return true;
        const mime = FileProcessor.getFileMimeType(path);
        return !!mime && mime.startsWith("image/");
    }

    private buildResult(): ConfirmResult | null {
        const files = this.getFilteredFiles();
        if (files.length === 0) {
            new Notice("没有可转换的文件", 3000);
            return null;
        }
        if (this.options.mode === "merge") {
            const hasPdf = files.some(path => this.isPdf(path));
            if (hasPdf) {
                new Notice("合并仅支持图片文件", 3000);
                return null;
            }
        }

        const pdfTargets = files.filter(path => this.isPdf(path));
        let pdfPages: number[] | undefined;

        if (pdfTargets.length > 0 && this.pdfMode !== "all") {
            if (this.pdfMode === "range") {
                const start = parseInt(this.pdfRangeStart);
                const end = parseInt(this.pdfRangeEnd);
                if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
                    new Notice("页码范围不合法", 3000);
                    return null;
                }
                pdfPages = [];
                for (let i = start; i <= end; i++) {
                    pdfPages.push(i);
                }
            } else if (this.pdfMode === "list") {
                const parsed = this.parsePageList(this.pdfList);
                if (parsed.length === 0) {
                    new Notice("请输入有效页码列表", 3000);
                    return null;
                }
                pdfPages = parsed;
            }

            if (pdfPages && this.pdfTotalPages) {
                const outOfRange = pdfPages.some(p => p < 1 || p > this.pdfTotalPages!);
                if (outOfRange) {
                    new Notice("页码超出范围", 3000);
                    return null;
                }
            }
        }

        return { filePaths: files, pdfPages };
    }

    private parsePageList(input: string): number[] {
        const tokens = input.split(",").map(t => t.trim()).filter(Boolean);
        const pages: number[] = [];
        tokens.forEach(token => {
            if (token.includes("-")) {
                const [startStr, endStr] = token.split("-").map(s => s.trim());
                const start = parseInt(startStr);
                const end = parseInt(endStr);
                if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
                    for (let i = start; i <= end; i++) {
                        pages.push(i);
                    }
                }
            } else {
                const num = parseInt(token);
                if (!isNaN(num) && num > 0) {
                    pages.push(num);
                }
            }
        });
        return Array.from(new Set(pages)).sort((a, b) => a - b);
    }
}
