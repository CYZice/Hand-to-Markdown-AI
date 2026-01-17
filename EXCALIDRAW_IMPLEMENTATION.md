# Excalidraw 集成实施步骤

## 一、前置条件

- ✅ Node.js 和 npm 已安装
- ✅ Hand-Markdown-AI 项目已设置
- ✅ 熟悉 TypeScript 和 Obsidian 插件开发

## 二、实施步骤

### 步骤 1：安装 Excalidraw 依赖

```bash
cd /path/to/Hand-Markdown-AI
npm install @zsviczian/excalidraw
```

**修改文件**：`package.json`

在 `dependencies` 中添加：
```json
{
  "dependencies": {
    "@zsviczian/excalidraw": "0.18.0-67"
  }
}
```

### 步骤 2：创建 ExcalidrawProcessor 工具类

✅ 已创建文件：`src/utils/excalidraw-processor.ts`

该文件包含：
- `convertExcalidrawToPng()` - 转换为 PNG
- `convertExcalidrawToSvg()` - 转换为 SVG
- `isValidExcalidrawJson()` - 验证文件
- `extractMetadata()` - 提取元数据

### 步骤 3：更新文件类型支持

**文件**：`src/defaults.ts`

在 `SUPPORTED_FILE_TYPES` 中添加：

```typescript
// 在现有的 SUPPORTED_FILE_TYPES 对象中添加
export const SUPPORTED_FILE_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf',
  '.excalidraw': 'application/json',  // ← 新增这一行
};
```

### 步骤 4：修改 ConversionService

**文件**：`src/conversion-service.ts`

#### 4.1 导入 ExcalidrawProcessor

在文件顶部添加：

```typescript
import { ExcalidrawProcessor } from "./utils/excalidraw-processor";
```

#### 4.2 修改 convertFile() 方法

找到 `convertFile()` 方法中的类型判断部分：

```typescript
async convertFile(filePath: string): Promise<ConversionResult> {
  const startTime = Date.now();

  let progressModal: ProgressModal | null = null;
  try {
    // 检测文件类型
    const mimeType = FileProcessor.getFileMimeType(filePath);

    // 判断是否为 PDF
    if (mimeType === "application/pdf") {
      // PDF 流式处理（原有逻辑）
      return await this.convertPdfStream(filePath, startTime);
    } else if (filePath.endsWith(".excalidraw")) {
      // ↓ 新增：Excalidraw 处理
      return await this.convertExcalidraw(filePath, startTime);
      // ↑ 新增
    } else {
      // 单张图片处理（原有逻辑）
      return await this.convertSingleImage(filePath, startTime);
    }
  } catch (error) {
    // ... 现有错误处理 ...
  }
}
```

#### 4.3 添加 convertExcalidraw() 方法

在 `ConversionService` 类中添加新方法：

```typescript
/**
 * 处理 Excalidraw 文件
 * 1. 读取 Excalidraw JSON
 * 2. 转换为 PNG
 * 3. 使用 AI 服务转换为 Markdown
 * 4. 保存输出文件
 */
private async convertExcalidraw(
  filePath: string,
  startTime: number
): Promise<ConversionResult> {
  try {
    // 1. 读取 Excalidraw 文件
    const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    new Notice(`正在处理 Excalidraw 文件...`, 3000);

    const jsonContent = await this.app.vault.read(file);

    // 2. 验证 Excalidraw 文件格式
    if (!ExcalidrawProcessor.isValidExcalidrawJson(jsonContent)) {
      throw new Error("Invalid or corrupted Excalidraw file");
    }

    // 3. 转换为 PNG（返回 FileData）
    const pngFileData = await ExcalidrawProcessor.convertExcalidrawToPng(
      jsonContent,
      filePath,
      {
        scale: this.settings.advancedSettings?.excalidrawScale ?? 1,
        withBackground: true,
        withDarkMode: false,
        padding: 10,
      }
    );

    // 4. 使用现有的 AI 服务转换为 Markdown
    const prompt = this.getConversionPrompt();
    const conversionResult = await this.aiService.convertFile(
      pngFileData,
      prompt
    );

    // 5. 保存转换结果
    const outputPath = await this.saveConversionResult(
      pngFileData,
      conversionResult.markdown,
      this.extractSuggestedFilename(conversionResult.markdown)
    );

    // 6. 返回成功结果
    return {
      ...conversionResult,
      outputPath,
      sourcePath: filePath,
      success: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    new Notice(`Excalidraw 转换失败: ${errorMessage}`, 5000);
    console.error("Excalidraw 转换错误:", error);

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

### 步骤 5：更新文件处理器（可选）

**文件**：`src/file-processor.ts`

虽然不是必须的，但可以添加特定的 Excalidraw 处理逻辑：

```typescript
/**
 * 检查文件是否被支持
 */
static isFileSupported(filePath: string): boolean {
  const extension = this.getFileExtension(filePath);
  return extension in SUPPORTED_FILE_TYPES;
}
```

这个方法已经存在，会自动支持 `.excalidraw` 扩展名。

### 步骤 6：构建和测试

```bash
# 构建项目
npm run build

# 或开发模式
npm run dev
```

### 步骤 7：在 Obsidian 中测试

1. **重启 Obsidian**（清除缓存）
2. **创建或获取一个 `.excalidraw` 文件**
3. **测试右键菜单**：
   - 右键点击 Excalidraw 文件
   - 选择"转换为Markdown"
   - 等待 AI 处理
4. **测试 Markdown 内链接**：
   ```markdown
   # 我的文档
   
   ![[drawing.excalidraw]]
   ```
   - 将光标放在链接上
   - 使用快捷键 `Mod+Alt+C` 或右键菜单
   - 结果会在链接下方插入

---

## 三、配置选项

### 可选：添加 Excalidraw 特定设置

**文件**：`src/types.ts`

在 `PluginSettings` 接口中添加：

```typescript
interface PluginSettings {
  // ... 现有设置 ...
  advancedSettings?: {
    // ... 现有高级设置 ...
    excalidrawScale?: number;  // Excalidraw 导出缩放因子（默认 1）
  };
}
```

**文件**：`src/defaults.ts`

在 `DEFAULT_SETTINGS` 中添加：

```typescript
export const DEFAULT_SETTINGS: PluginSettings = {
  // ... 现有默认值 ...
  advancedSettings: {
    // ... 现有默认值 ...
    excalidrawScale: 1,  // 新增
  },
};
```

### 在设置 UI 中暴露选项（可选）

**文件**：`src/ui/simple-settings-tab.ts` 或类似设置文件

添加 Slider 控件：

```typescript
new SliderComponent(containerEl)
  .setLabel('Excalidraw 导出缩放倍数')
  .setMin(0.5)
  .setMax(3)
  .setStep(0.1)
  .setValue(this.plugin.settings.advancedSettings?.excalidrawScale ?? 1)
  .onChange(async (value) => {
    if (!this.plugin.settings.advancedSettings) {
      this.plugin.settings.advancedSettings = {};
    }
    this.plugin.settings.advancedSettings.excalidrawScale = value;
    await this.plugin.saveSettings();
  });
```

---

## 四、故障排除

### 问题 1：找不到 @zsviczian/excalidraw 模块

**解决方案**：
```bash
npm install
npm run build
```

### 问题 2：Excalidraw 文件转换失败

**检查清单**：
1. 文件确实是有效的 Excalidraw JSON
2. 不包含损坏的嵌入图像
3. AI 模型支持图片识别（VISION 或 MULTIMODAL）

**调试**：
```typescript
const metadata = ExcalidrawProcessor.extractMetadata(jsonContent);
console.log("Excalidraw metadata:", metadata);
```

### 问题 3：转换速度太慢

**原因**：可能是大型 Excalidraw 文件

**解决方案**：
- 减少缩放因子：`excalidrawScale: 0.8`
- 或者：提高并发限制（在 PDF 处理中也有）

---

## 五、完整测试清单

- [ ] Excalidraw 文件转换为 PNG 成功
- [ ] 生成的 PNG 可被 AI 识别
- [ ] AI 转换结果合理
- [ ] 输出文件正确保存
- [ ] Markdown 内 Excalidraw 链接可以转换
- [ ] 错误提示正确显示
- [ ] 大型文件不会导致卡顿
- [ ] 与现有 PDF/图片处理流程兼容

---

## 六、性能优化建议

### 1. 缓存转换结果

```typescript
private excalidrawCache = new Map<string, FileData>();

private async convertExcalidraw(
  filePath: string,
  startTime: number
): Promise<ConversionResult> {
  // 检查缓存
  if (this.excalidrawCache.has(filePath)) {
    const cached = this.excalidrawCache.get(filePath)!;
    // 直接使用 AI 转换
  }
  // ...
}
```

### 2. 并发处理多个 Excalidraw 文件

利用现有的 `convertFiles()` 方法，会自动处理多个文件。

### 3. 显示进度信息

```typescript
new Notice(`处理 Excalidraw 文件：${fileName}...`, 3000);
```

---

## 七、已知限制

1. **不支持 Excalidraw 协作功能**（在线实时编辑）
2. **某些高级效果可能在 PNG 中丢失**（如部分动画）
3. **嵌入的大图像可能导致转换缓慢**

---

## 八、下一步

### 即将推出的功能建议：

1. **SVG 输出选项** - 用于矢量编辑
   ```typescript
   const svgString = await ExcalidrawProcessor.convertExcalidrawToSvg(...);
   ```

2. **批量处理** - 转换文件夹内所有 Excalidraw 文件
   ```typescript
   // 现有 convertFolder() 会自动支持
   ```

3. **智能裁剪** - 自动检测和裁剪画布外的空白
   ```typescript
   // 可在 ExportSettings 中添加
   ```

4. **主题匹配** - 自动匹配 Obsidian 主题
   ```typescript
   const isDarkMode = document.documentElement.classList.contains("theme-dark");
   ```

---

## 九、参考资源

- Excalidraw 官方文档：https://excalidraw.com/
- Obsidian Excalidraw 插件：https://github.com/zsviczian/obsidian-excalidraw-plugin
- Excalidraw API：https://github.com/excalidraw/excalidraw/tree/master/packages/excalidraw

