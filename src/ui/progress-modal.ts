import { App, Modal } from "obsidian";

/**
 * 简单进度模态框：展示 PDF 渲染与 AI 转换两条进度条
 */
export class ProgressModal extends Modal {
    private titleElRef: HTMLElement;
    private renderBarEl: HTMLElement;
    private renderTextEl: HTMLElement;
    private aiBarEl: HTMLElement;
    private aiTextEl: HTMLElement;
    private statusEl: HTMLElement;
    private cancelBtnEl: HTMLButtonElement | null = null;
    private cancelled = false;
    private actionsEl: HTMLElement | null = null;
    private minimizeBtnEl: HTMLButtonElement | null = null;

    // 浮动非阻塞状态
    private overlayEl: HTMLElement | null = null;
    private overlayRenderBarEl: HTMLElement | null = null;
    private overlayAiBarEl: HTMLElement | null = null;
    private overlayTextEl: HTMLElement | null = null;
    private overlayCancelBtnEl: HTMLButtonElement | null = null;
    private isMinimized = false;

    private totalPages = 0;
    private totalJobs = 0;

    // 保存当前进度，防止还原时刷新
    private currentRenderProgress = 0;
    private currentAIProgress = 0;
    private currentStatus = "初始化...";

    constructor(app: App) {
        super(app);
        this.modalEl.addClass("hand-markdown-ai-progress-modal");
        this.titleEl.setText("正在转换 PDF → Markdown");
        this.titleElRef = this.titleEl;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const container = contentEl.createDiv({
            attr: { style: "min-width: 420px; padding: 6px;" }
        });

        // PDF 渲染进度
        container.createEl("h4", { text: "PDF 渲染进度" });
        const renderBar = container.createDiv({
            attr: { style: "height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden;" }
        });
        this.renderBarEl = renderBar.createDiv({
            attr: { style: "height: 100%; width: 0%; background: var(--interactive-accent); transition: width 120ms ease;" }
        });
        this.renderTextEl = container.createDiv({
            attr: { style: "margin-top: 6px; font-size: 12px; opacity: 0.8;" }
        });

        // AI 转换进度
        container.createEl("h4", { text: "AI 转换进度" });
        const aiBar = container.createDiv({
            attr: { style: "height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden;" }
        });
        this.aiBarEl = aiBar.createDiv({
            attr: { style: "height: 100%; width: 0%; background: var(--text-accent); transition: width 120ms ease;" }
        });
        this.aiTextEl = container.createDiv({
            attr: { style: "margin-top: 6px; font-size: 12px; opacity: 0.8;" }
        });

        // 状态文本
        this.statusEl = container.createDiv({
            attr: { style: "margin-top: 10px; font-size: 12px;" }
        });
        this.statusEl.setText("初始化...");

        this.actionsEl = container.createDiv({ attr: { style: "display:flex; justify-content:flex-end; gap:8px; margin-top:12px;" } });
        this.cancelBtnEl = this.actionsEl.createEl("button", { text: "取消" }) as HTMLButtonElement;
        this.cancelBtnEl.onclick = () => {
            this.cancelled = true;
            this.setStatus("已请求取消，正在停止...");
        };

        this.minimizeBtnEl = this.actionsEl.createEl("button", { text: "最小化" }) as HTMLButtonElement;
        this.minimizeBtnEl.onclick = () => {
            this.minimize();
        };
    }

    setTotals(totalPages: number, totalJobs: number) {
        this.totalPages = Math.max(0, totalPages);
        this.totalJobs = Math.max(0, totalJobs);
        this.updateRenderProgress(0);
        this.updateAIProgress(0);
    }

    updateRenderProgress(donePages: number) {
        this.currentRenderProgress = donePages;
        const total = this.totalPages || 1;
        const pct = Math.min(100, Math.max(0, (donePages / total) * 100));
        // 更新模态窗口进度条
        if (this.renderBarEl) this.renderBarEl.style.width = pct.toFixed(2) + "%";
        if (this.renderTextEl) this.renderTextEl.setText(`已渲染 ${donePages}/${this.totalPages} 页`);
        // 同步更新浮动面板进度条
        if (this.overlayRenderBarEl) this.overlayRenderBarEl.style.width = pct.toFixed(2) + "%";
    }

    updateAIProgress(doneJobs: number) {
        this.currentAIProgress = doneJobs;
        const total = this.totalJobs || 1;
        const pct = Math.min(100, Math.max(0, (doneJobs / total) * 100));
        // 更新模态窗口进度条
        if (this.aiBarEl) this.aiBarEl.style.width = pct.toFixed(2) + "%";
        if (this.aiTextEl) this.aiTextEl.setText(`已完成批次 ${doneJobs}/${this.totalJobs}`);
        // 同步更新浮动面板进度条
        if (this.overlayAiBarEl) this.overlayAiBarEl.style.width = pct.toFixed(2) + "%";
    }

    setStatus(text: string) {
        this.currentStatus = text;
        if (this.statusEl) this.statusEl.setText(text);
        // 同步更新浮动面板状态文本
        if (this.overlayTextEl && this.isMinimized) {
            this.overlayTextEl.setText(text);
        }
    }

    isCancelled(): boolean {
        return this.cancelled;
    }

    /**
     * 在完成后提供操作按钮：重试失败页、重试指定页、关闭
     */
    showCompletionActions(actions: {
        onRetryAll?: () => Promise<void> | void;
        onRetrySingle?: (pageNum: number) => Promise<void> | void;
        onClose?: () => Promise<void> | void;
    }) {
        if (!this.actionsEl) return;
        // 禁用取消按钮
        if (this.cancelBtnEl) {
            this.cancelBtnEl.disabled = true;
            this.cancelBtnEl.textContent = "已完成";
        }

        const retryAllBtn = this.actionsEl.createEl("button", { text: "重试失败页" }) as HTMLButtonElement;
        retryAllBtn.onclick = async () => {
            try { await actions.onRetryAll?.(); } catch (e) { }
        };

        const singleWrap = this.actionsEl.createDiv({ attr: { style: "display:flex; align-items:center; gap:6px;" } });
        const singleInput = singleWrap.createEl("input", { attr: { type: "number", min: "1", placeholder: "页码" } }) as HTMLInputElement;
        const retrySingleBtn = singleWrap.createEl("button", { text: "重试指定页" }) as HTMLButtonElement;
        retrySingleBtn.onclick = async () => {
            const n = parseInt(singleInput.value);
            if (!isNaN(n) && n > 0) {
                try { await actions.onRetrySingle?.(n); } catch (e) { }
            }
        };

        const closeBtn = this.actionsEl.createEl("button", { text: "关闭" }) as HTMLButtonElement;
        closeBtn.onclick = async () => {
            try { await actions.onClose?.(); } finally { this.close(); }
        };
    }

    /** 将进度窗口最小化为右下角浮动面板（不阻塞操作） */
    minimize() {
        if (this.isMinimized) return;
        this.isMinimized = true;
        // 关闭模态以解除阻塞
        try { super.close(); } catch (_) { }

        // 创建浮动面板
        this.overlayEl = document.createElement("div");
        this.overlayEl.className = "hand-markdown-ai-progress-overlay";
        this.overlayEl.setAttr("style",
            "position:fixed; right:16px; bottom:16px; z-index:9999;" +
            "background: var(--background-primary); box-shadow: var(--shadow-s);" +
            "border: 1px solid var(--background-modifier-border); border-radius: 8px;" +
            "padding: 10px; width: 280px;"
        );

        const title = this.overlayEl.createEl("div", { text: "PDF → Markdown 进度", attr: { style: "font-weight:600; margin-bottom:6px;" } });

        // 渲染进度条
        const rLabel = this.overlayEl.createEl("div", { text: "渲染", attr: { style: "font-size:12px; opacity:.8;" } });
        const rBar = this.overlayEl.createDiv({ attr: { style: "height:8px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden; margin-top:4px;" } });
        this.overlayRenderBarEl = rBar.createDiv({ attr: { style: "height:100%; width:0%; background: var(--interactive-accent); transition: width 120ms ease;" } });

        // AI 进度条
        const aLabel = this.overlayEl.createEl("div", { text: "AI", attr: { style: "font-size:12px; opacity:.8; margin-top:8px;" } });
        const aBar = this.overlayEl.createDiv({ attr: { style: "height:8px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden; margin-top:4px;" } });
        this.overlayAiBarEl = aBar.createDiv({ attr: { style: "height:100%; width:0%; background: var(--text-accent); transition: width 120ms ease;" } });

        this.overlayTextEl = this.overlayEl.createEl("div", { text: "处理中...", attr: { style: "margin-top:6px; font-size:12px;" } });

        const row = this.overlayEl.createDiv({ attr: { style: "display:flex; justify-content:flex-end; gap:6px; margin-top:8px;" } });
        // 取消按钮（浮动）
        this.overlayCancelBtnEl = row.createEl("button", { text: "取消" }) as HTMLButtonElement;
        this.overlayCancelBtnEl.onclick = () => {
            this.cancelled = true;
            this.setStatus("已请求取消，正在停止...");
        };
        // 还原按钮
        const restoreBtn = row.createEl("button", { text: "还原" }) as HTMLButtonElement;
        restoreBtn.onclick = () => this.restore();

        document.body.appendChild(this.overlayEl);
    }

    /** 还原为模态窗口 */
    restore() {
        if (!this.isMinimized) return;
        this.isMinimized = false;
        // 移除浮动面板
        if (this.overlayEl && this.overlayEl.parentElement) {
            this.overlayEl.parentElement.removeChild(this.overlayEl);
        }
        this.overlayEl = null;
        this.overlayRenderBarEl = null;
        this.overlayAiBarEl = null;
        this.overlayTextEl = null;
        this.overlayCancelBtnEl = null;
        // 重新打开模态
        try { super.open(); } catch (_) { }

        // 还原进度值，防止刷新
        this.updateRenderProgress(this.currentRenderProgress);
        this.updateAIProgress(this.currentAIProgress);
        this.setStatus(this.currentStatus);
    }

    /** 重载 close：确保浮动面板也被移除 */
    close(): void {
        if (this.overlayEl && this.overlayEl.parentElement) {
            this.overlayEl.parentElement.removeChild(this.overlayEl);
        }
        this.overlayEl = null;
        super.close();
    }
}
