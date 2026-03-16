# Ink2Vault Workspace Instructions

Welcome to the Ink2Vault project! This is an Obsidian plugin developed in TypeScript that converts handwritten notes (PDF/JPG/PNG/Excalidraw) into Markdown format using multi-provider AI (Gemini, Claude, OpenAI). 

## 1. Project Overview & Architecture

*   **Plugin Core**: `src/main.ts` is the entry point, defining the Obsidian plugin structure, settings tabs, commands, and ribbon integration.
*   **AI Providers (`src/providers/`)**: A modular architecture for handling different AI models. Implements `BaseAIProvider` extending to `ClaudeProvider`, `GeminiProvider`, and `OpenAIProvider`.
*   **Services (`src/services/`)**: 
    *   `ai-service.ts`: Coordinates API communication.
    *   `image-handler.ts`: Prepares images for AI consumption.
*   **UI Components (`src/ui/`)**: Obsidian modals for settings (`simple-settings-tab.ts`), progress tracking (`progress-modal.ts`), batch processing (`batch-progress-modal.ts`), and confirmations (`confirm-modal.ts`).
*   **Utilities (`src/utils/`)**: Code for PDF processing (`pdf-processor.ts`) using `pdfjs-dist` and Excalidraw integration (`excalidraw-processor.ts`).

## 2. Development Workflow & Commands

This project uses `esbuild` for fast compilation.

*   **Development / Watch Mode**: 
    ```bash
    npm run dev
    ```
    This runs `esbuild.config.mjs` and watches for TypeScript changes.
*   **Production Build**: 
    ```bash
    npm run build
    ```
    This runs type-checking (`tsc -noEmit -skipLibCheck`) before executing a production build via esbuild.
*   **Version Bumping**: 
    ```bash
    npm run version
    ```
    Updates the manifest and versions safely.

## 3. Project-Specific Conventions

*   **Types & Interfaces:** Define all plugin-wide interfaces in `src/types.ts`. Avoid `any` - strongly type AI provider responses to handle specific API differences accurately.
*   **Obsidian API:** Import everything Obsidian-related directly from `obsidian`, utilizing `Notice`, `Modal`, `PluginSettingTab`, `TFile`, and `TFolder`.
*   **Asynchronous Processing:** Conversion of PDFs and batch processing can take time. Always use the built-in `progress-modal.ts` or `batch-progress-modal.ts` to ensure users are informed of long-running tasks.
*   **Error Handling:** Catch all provider-specific errors and gracefully bubble them up to the UI as an Obsidian `Notice`. Do not crash the plugin on individual file conversion failures (capture errors and allow the batch process to continue).

## 4. Potential Pitfalls

*   **PDF.js Dependency:** Be cautious when modifying `pdf-processor.ts`. `pdfjs-dist` can be tricky to bundle with `esbuild`. Check `esbuild.config.mjs` if module resolution issues occur.
*   **File Size Limits:** Some AI providers (especially for image-to-text) have strict limits on payload size. Ensure image resizing/compression (if added in `image-handler.ts`) remains within API bounds.
*   **Excalidraw & Image Previews:** Excalidraw PNG exports might require specific background detection/handling before sending to the AI.

## 5. Helpful References

*   **Plugin Configuration Defaults**: Look at `src/defaults.ts`.
*   **Research & Implementation Docs**: Found in `doc/` (e.g., `PDF_IMPLEMENTATION_GUIDE.md`, `EXCALIDRAW_INTEGRATION_GUIDE.md`) for understanding historical context and design boundaries.