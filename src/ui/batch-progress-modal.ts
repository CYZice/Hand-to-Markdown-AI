import { App, Modal } from "obsidian";

export class BatchProgressModal extends Modal {
    private barEl: HTMLElement;
    private textEl: HTMLElement;
    private statusEl: HTMLElement;
    private total = 0;

    constructor(app: App) {
        super(app);
        this.modalEl.addClass("ink2vault-batch-progress");
        this.titleEl.setText("批量转换进度");
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        const container = contentEl.createDiv({ attr: { style: "min-width: 360px; padding: 10px;" } });

        const barWrap = container.createDiv({ attr: { style: "height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden;" } });
        this.barEl = barWrap.createDiv({ attr: { style: "height: 100%; width: 0%; background: var(--interactive-accent); transition: width 120ms ease;" } });

        this.textEl = container.createDiv({ attr: { style: "margin-top: 8px; font-size: 12px; opacity: .8;" } });
        this.textEl.setText("0/0");

        this.statusEl = container.createDiv({ attr: { style: "margin-top: 6px; font-size: 12px;" } });
    }

    setTotals(total: number) {
        this.total = Math.max(0, total);
        this.updateProgress(0);
    }

    updateProgress(done: number) {
        const total = this.total || 1;
        const pct = Math.min(100, Math.max(0, (done / total) * 100));
        if (this.barEl) this.barEl.style.width = pct.toFixed(2) + "%";
        if (this.textEl) this.textEl.setText(`${done}/${this.total}`);
    }

    setStatus(text: string) {
        if (this.statusEl) this.statusEl.setText(text);
    }
}