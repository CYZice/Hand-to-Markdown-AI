# Excalidraw 转 PNG 的实现逻辑分析与复用方案

## 一、Obsidian Excalidraw 插件的转换实现

### 1. 核心导出流程

#### 1.1 关键函数：`getPNG()`

**位置**：`src/utils/utils.ts` (line 413+)

```typescript
export async function getPNG (
  scene: any,
  exportSettings: ExportSettings,
  padding: number,
  scale: number = 1,
): Promise<Blob> {
  try {
    if(exportSettings.isMask) {
      const cropObject = new CropImage(scene.elements, scene.files);
      const blob = await cropObject.getCroppedPNG();
      cropObject.destroy();
      return blob;
    }

    return await exportToBlob({
      elements: scene.elements.filter((el:ExcalidrawElement)=>el.isDeleted !== true),
      appState: {
        ...scene.appState,
        exportBackground: exportSettings.withBackground,
        exportWithDarkMode: exportSettings.withTheme
          ? scene.appState?.theme !== "light"
          : false,
        ...exportSettings.frameRendering
        ? {frameRendering: exportSettings.frameRendering}
        : {},
      },
      files: filterFiles(scene.files),
      exportPadding: exportSettings.frameRendering?.enabled ? 0 : padding,
      mimeType: "image/png",
      getDimensions: (width: number, height: number) => ({
        width: width * scale,
        height: height * scale,
        scale,
      }),
    });
  } catch (error) {
    new Notice(t("ERROR_PNG_TOO_LARGE"));
    errorlog({ where: "Utils.getPNG", error });
    return null;
  }
}
```

**关键点**：
- ✅ 输入：Excalidraw `scene` 对象（包含 `elements` 和 `appState`）
- ✅ 使用 Excalidraw 库的 `exportToBlob()` 函数（来自 `@zsviczian/excalidraw`）
- ✅ 输出：PNG 格式的 `Blob` 对象
- ✅ 支持缩放、背景、主题等配置

#### 1.2 关键函数：`getSVG()`

**位置**：`src/utils/utils.ts` (line 341+)

```typescript
export async function getSVG (
  scene: any,
  exportSettings: ExportSettings,
  padding: number,
  srcFile: TFile|null,
): Promise<SVGSVGElement> {
  // ... 元素处理逻辑 ...
  
  svg = await exportToSvg({
    elements: elements.filter((el:ExcalidrawElement)=>el.isDeleted !== true),
    appState: {
      ...scene.appState,
      exportBackground: exportSettings.withBackground,
      exportWithDarkMode: exportSettings.withTheme
        ? scene.appState?.theme !== "light"
        : false,
      ...exportSettings.frameRendering
      ? {frameRendering: exportSettings.frameRendering}
      : {},
    },
    files: scene.files,
    exportPadding: exportSettings.frameRendering?.enabled ? 0 : padding,
    exportingFrame: null,
    renderEmbeddables: true,
    skipInliningFonts: exportSettings.skipInliningFonts,
  });
  
  return svg;
}
```

**关键点**：
- ✅ 使用 `exportToSvg()` 生成 SVG
- ✅ 返回 SVG 元素对象

#### 1.3 转换链

```
Excalidraw JSON 文件
    ↓
解析 JSON 为 scene 对象
    ↓
调用 getPNG() / getSVG()
    ↓
使用 exportToBlob() / exportToSvg()（来自 Excalidraw 库）
    ↓
返回 PNG Blob / SVG 元素
```

### 2. 依赖库分析

#### 2.1 关键依赖

在 `package.json` 中：

```json
{
  "dependencies": {
    "@zsviczian/excalidraw": "0.18.0-67",
    // ... 其他依赖 ...
  }
}
```

**关键导入**（在 `constants.ts` 中）：

```typescript
import {
  exportToSvg,
  exportToBlob,
  // ... 其他导出 ...
} from "@zsviczian/excalidraw";
```

这是修改版的 Excalidraw 库，提供了导出功能。

#### 2.2 ExportSettings 类型

```typescript
interface ExportSettings {
  isMask: boolean;                    // 是否为遮罩导出
  withBackground: boolean;            // 是否包含背景
  withTheme: boolean;                 // 是否应用主题
  frameRendering?: {
    enabled: boolean;
    // ... frame 配置
  };
  skipInliningFonts?: boolean;        // 是否跳过字体内联
}
```

### 3. Excalidraw Scene 对象结构

从代码推断的 Scene 结构：

```typescript
interface ExcalidrawScene {
  elements: ExcalidrawElement[];      // 绘图元素数组
  appState: {
    theme?: 'light' | 'dark';         // 主题
    exportBackground: boolean;        // 背景
    exportWithDarkMode: boolean;      // 深色模式
    // ... 其他状态 ...
  };
  files: Record<string, BinaryFileData>; // 嵌入的文件
}
```

---

## 二、复用到 Hand-Markdown-AI 的方案

### 方案 A：直接复用 Excalidraw 库（推荐）

#### 步骤 1：安装依赖

在 Hand-Markdown-AI 的 `package.json` 中添加：

```json
{
  "dependencies": {
    "@zsviczian/excalidraw": "0.18.0-67"
  }
}
```

#### 步骤 2：创建 ExcalidrawProcessor

**文件**：`src/utils/excalidraw-processor.ts`

```typescript
import { App, Notice, TFile } from "obsidian";
import { exportToBlob, exportToSvg } from "@zsviczian/excalidraw";
import { FileData } from "./types";

export class ExcalidrawProcessor {
  /**
   * 将 Excalidraw JSON 文件转换为 PNG Base64
   */
  static async convertExcalidrawToPng(
    jsonContent: string,
    filePath: string,
    options?: {
      scale?: number;
      withBackground?: boolean;
      withDarkMode?: boolean;
    }
  ): Promise<FileData> {
    try {
      // 1. 解析 JSON
      const scene = JSON.parse(jsonContent);

      // 2. 调用 exportToBlob
      const blob = await exportToBlob({
        elements: scene.elements.filter((el: any) => !el.isDeleted),
        appState: {
          ...scene.appState,
          exportBackground: options?.withBackground ?? true,
          exportWithDarkMode: options?.withDarkMode ?? false,
        },
        files: scene.files || {},
        exportPadding: 10,
        mimeType: "image/png",
        getDimensions: (width: number, height: number) => {
          const scale = options?.scale ?? 1;
          return {
            width: width * scale,
            height: height * scale,
            scale,
          };
        },
      });

      if (!blob) {
        throw new Error("Failed to generate PNG from Excalidraw");
      }

      // 3. 转换为 Base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = this.arrayBufferToBase64(arrayBuffer);

      // 4. 返回 FileData
      const fileName = filePath.split("/").pop()?.replace(".excalidraw", "") || "drawing";
      return {
        path: filePath,
        base64: `data:image/png;base64,${base64}`,
        mimeType: "image/png",
        size: base64.length,
        name: fileName,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Excalidraw to PNG conversion failed: ${msg}`);
    }
  }

  /**
   * 将 Excalidraw 转换为 SVG
   */
  static async convertExcalidrawToSvg(
    jsonContent: string,
    filePath: string,
    options?: {
      withBackground?: boolean;
      withDarkMode?: boolean;
    }
  ): Promise<string> {
    try {
      const scene = JSON.parse(jsonContent);

      const svg = await exportToSvg({
        elements: scene.elements.filter((el: any) => !el.isDeleted),
        appState: {
          ...scene.appState,
          exportBackground: options?.withBackground ?? true,
          exportWithDarkMode: options?.withDarkMode ?? false,
        },
        files: scene.files || {},
        exportPadding: 10,
        exportingFrame: null,
        renderEmbeddables: true,
        skipInliningFonts: false,
      });

      return svg.outerHTML;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Excalidraw to SVG conversion failed: ${msg}`);
    }
  }

  /**
   * ArrayBuffer 转 Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
```

#### 步骤 3：修改 ConversionService

**文件**：`src/conversion-service.ts`

在 `convertFile()` 方法中添加 Excalidraw 处理：

```typescript
async convertFile(filePath: string): Promise<ConversionResult> {
  const startTime = Date.now();

  try {
    const mimeType = FileProcessor.getFileMimeType(filePath);

    if (mimeType === "application/pdf") {
      return await this.convertPdfStream(filePath, startTime);
    } else if (filePath.endsWith(".excalidraw")) {
      // 新增：Excalidraw 处理
      return await this.convertExcalidraw(filePath, startTime);
    } else {
      return await this.convertSingleImage(filePath, startTime);
    }
  } catch (error) {
    // ... 错误处理 ...
  }
}

/**
 * 处理 Excalidraw 文件
 */
private async convertExcalidraw(
  filePath: string,
  startTime: number
): Promise<ConversionResult> {
  try {
    // 1. 读取 Excalidraw JSON 文件
    const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    const jsonContent = await this.app.vault.read(file);

    // 2. 转换为 PNG（得到 FileData）
    const pngFileData = await ExcalidrawProcessor.convertExcalidrawToPng(
      jsonContent,
      filePath,
      {
        scale: this.settings.advancedSettings?.excalidrawScale ?? 1,
        withBackground: true,
        withDarkMode: false,
      }
    );

    // 3. 使用现有的图片处理流程（AI 转换）
    const prompt = this.getConversionPrompt();
    const conversionResult = await this.aiService.convertFile(
      pngFileData,
      prompt
    );

    // 4. 保存输出文件
    const outputPath = await this.saveConversionResult(
      pngFileData,
      conversionResult.markdown,
      this.extractSuggestedFilename(conversionResult.markdown)
    );

    // 5. 返回结果
    return {
      ...conversionResult,
      outputPath,
      sourcePath: filePath,
      success: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    new Notice(`Excalidraw conversion failed: ${errorMessage}`, 5000);
    console.error("Excalidraw conversion error:", error);

    return {
      markdown: "",
      sourcePath: filePath,
      outputPath: "",
      provider: this.settings.currentModel || "unknown",
      duration: Date.now() - startTime,
      success: false,
      error: errorMessage,
    };
  }
}
```

#### 步骤 4：更新文件类型支持

**文件**：`src/defaults.ts`

```typescript
export const SUPPORTED_FILE_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".pdf": "application/pdf",
  ".excalidraw": "application/json",  // 新增
};
```

#### 步骤 5：支持 Markdown 内 Excalidraw 链接

现有的 `convertLinkInEditor()` 方法会自动支持，因为流程是：

```
Markdown 中的 ![[drawing.excalidraw]]
    ↓
detectFileSupported() → 检查扩展名
    ↓
convertLinkInEditor()
    ↓
convertFile() → 自动路由到 convertExcalidraw()
    ↓
结果插入编辑器
```

---

## 三、Obsidian Excalidraw 插件的完整流程参考

### 整个导出流程：

```
1. 用户在 Excalidraw 编辑器中进行操作
   ↓
2. 点击"Export"按钮
   ↓
3. ExcalidrawView.ts 中获取 scene 数据
   ↓
4. 调用 getPNG() / getSVG()
   ↓
5. 内部调用 exportToBlob() / exportToSvg()（Excalidraw 库）
   ↓
6. 生成 Blob / SVG 数据
   ↓
7. 保存到文件系统
   ↓
8. 显示导出完成通知
```

### 关键文件：

```
obsidian-excalidraw-plugin/src/
├── utils/
│   ├── utils.ts              # 包含 getPNG()、getSVG()
│   ├── exportUtils.ts        # PDF 导出等高级功能
│   └── excalidrawAutomateUtils.ts
├── view/
│   └── ExcalidrawView.ts    # 主编辑器视图
├── core/
│   └── main.ts              # 插件主文件
└── constants/
    └── constants.ts         # 包含 exportToBlob 等导入
```

---

## 四、实际集成注意事项

### 1. 依赖冲突检查

如果 Hand-Markdown-AI 已经使用 Excalidraw，检查版本兼容性：

```typescript
// 在 main.ts 中
const excalidrawPlugin = app.plugins.getPlugin("obsidian-excalidraw-plugin");
if (excalidrawPlugin) {
  // 可以复用 Excalidraw 库，不需要安装新的依赖
}
```

### 2. 性能考虑

Excalidraw 文件可能很大（包含嵌入的图像）：

```typescript
// 添加进度提示
new Notice("Converting Excalidraw to PNG...", 3000);

// 考虑异步处理大文件
if (pngFileData.size > 10 * 1024 * 1024) {
  new Notice("Large file detected, this may take a moment...", 5000);
}
```

### 3. 主题和样式

保留 Obsidian 的主题设置：

```typescript
const isDarkMode = app.vault.adapter.basePath.includes("dark");

const conversionOptions = {
  scale: 1.5,
  withBackground: true,
  withDarkMode: isDarkMode,  // 自动检测
};
```

### 4. 错误处理

处理可能的转换失败：

```typescript
try {
  // Excalidraw JSON 可能格式错误
  const scene = JSON.parse(jsonContent);
  if (!scene.elements || !Array.isArray(scene.elements)) {
    throw new Error("Invalid Excalidraw file structure");
  }
} catch (error) {
  new Notice("Invalid Excalidraw file", 5000);
  // 提供回退选项（如：导出为 SVG）
}
```

---

## 五、完整实现清单

### Phase 1：基础集成
- [ ] 1. 添加 `@zsviczian/excalidraw` 依赖
- [ ] 2. 创建 `ExcalidrawProcessor` 工具类
- [ ] 3. 实现 `convertExcalidrawToPng()` 方法
- [ ] 4. 在 `ConversionService` 中添加 Excalidraw 路由
- [ ] 5. 更新 `SUPPORTED_FILE_TYPES`

### Phase 2：测试
- [ ] 6. 测试单个 Excalidraw 文件转换
- [ ] 7. 测试 Markdown 内链接处理
  - 测试 `![[drawing.excalidraw]]`
  - 测试 `![alt](drawing.excalidraw)`
- [ ] 8. 测试错误处理（无效文件、大文件）

### Phase 3：优化
- [ ] 9. 添加缩放选项到设置
- [ ] 10. 性能测试和优化
- [ ] 11. 用户反馈和调整

---

## 六、代码复用性评估

| 方面 | 评分 | 说明 |
|------|------|------|
| **可直接复用** | ⭐⭐⭐⭐⭐ | `getPNG()` 和 `getSVG()` 逻辑完全可复用 |
| **依赖兼容** | ⭐⭐⭐⭐ | Excalidraw 库是官方库，稳定可靠 |
| **集成难度** | ⭐⭐ | 只需简单包装导出逻辑 |
| **性能** | ⭐⭐⭐⭐ | 渲染速度快，支持缩放优化 |
| **维护性** | ⭐⭐⭐⭐⭐ | 依赖官方库，长期维护有保障 |

---

## 七、建议的集成方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **方案 A：直接复用库** | ✅ 官方库，准确<br>✅ 特性完整<br>✅ 性能好 | ⚠️ 新增依赖 | ⭐⭐⭐⭐⭐ |
| **方案 B：调用插件 API** | ✅ 零依赖<br>✅ 代码最少 | ❌ 依赖插件安装<br>❌ 错误处理复杂 | ⭐⭐ |
| **方案 C：自实现渲染** | ✅ 完全独立 | ❌ 工作量大<br>❌ 质量难保证 | ⭐ |

**推荐：方案 A**（直接复用库）

---

## 八、快速开始代码模板

完整的最小实现示例见下一节。

