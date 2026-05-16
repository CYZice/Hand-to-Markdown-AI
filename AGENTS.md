# Repository Guidelines

## Project Structure & Module Organization

Ink2Vault is an Obsidian plugin written in TypeScript. The plugin entry point is `src/main.ts`; conversion flow lives in `src/conversion-service.ts`, `src/file-processor.ts`, and `src/conversion-modal.ts`. AI providers are in `src/providers/`, shared services in `src/services/`, UI modals and settings tabs in `src/ui/`, and format helpers in `src/utils/`. Shared interfaces are in `src/types.ts`; defaults and constants are in `src/defaults.ts` and `src/constants.ts`.

Root-level `main.js`, `manifest.json`, and `styles.css` are packaged plugin assets. Research and architecture notes are under `doc/`. Agent prompt files are in `agents/`.

## Build, Test, and Development Commands

Run `npm install` to install dependencies. Use `npm run dev` for local development; it starts the esbuild watcher and rebuilds `main.js` when TypeScript changes.

Use `npm run build` before releases or pull requests. It runs `tsc -noEmit -skipLibCheck` and creates a production bundle.

Use `npm version patch`, `npm version minor`, or `npm version major` to update package metadata; `npm run version` updates `manifest.json` and `versions.json`.

## Coding Style & Naming Conventions

Use TypeScript with strict null checks and `noImplicitAny`; avoid `any` unless an external API shape is genuinely unknown. Prefer interfaces in `src/types.ts` for plugin-wide data. Follow the existing four-space indentation style, semicolons, and focused modules.

Name classes and Obsidian UI components in `PascalCase`, functions and variables in `camelCase`, and files in lowercase kebab form such as `batch-progress-modal.ts`. Import Obsidian APIs directly from `obsidian`.

## Testing Guidelines

There is no dedicated automated test suite yet. Treat `npm run build` as the required verification step. For behavior changes, manually test inside an Obsidian vault by copying or linking `main.js`, `manifest.json`, and `styles.css` into `.obsidian/plugins/Ink2Vault/`.

Exercise affected flows directly: image/PDF conversion, batch folder conversion, provider settings, retry handling, and preview/source mode context menus as relevant.

## Commit & Pull Request Guidelines

Recent history uses short, imperative commits, with both conventional prefixes (`chore:`, `feat/fix:`) and concise release labels. Prefer messages like `fix: handle failed PDF page retry` or `chore: update plugin metadata`.

Pull requests should include a summary, user-visible impact, verification steps, and screenshots or recordings for UI changes. Link related issues when available. Do not include API keys, vault-private content, or unrelated generated files.

## Security & Configuration Tips

Provider API keys belong in Obsidian plugin settings, never in source, docs, screenshots, or test fixtures. Be careful when logging provider errors: include status and actionable context, but avoid request bodies or secret headers.
