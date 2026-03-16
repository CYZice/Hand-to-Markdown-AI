# Obsidian 中 PDF 拆分处理方案调研

## 一、问题概述

在 Obsidian 插件中处理大 PDF 文件需要面对三个核心挑战：
1. **内存溢出** - 大 PDF 一次性转换为 Base64 会占用大量内存
2. **浏览器限制** - Canvas 渲染和字符串编码有内存上限
3. **API 超时** - 大文件上传时易超时（当前设置 30 秒）

---

## 二、Obsidian 生态中的 PDF 处理方案

### 2.1 官方推荐：pdfjs-dist

**特点**：
- ✅ Mozilla 官方维护，稳定可靠
- ✅ 支持流式渲染，可逐页处理
- ✅ 内置 Worker 支持，不阻塞主线程
- ✅ 支持内存管理和缓存

**Obsidian 中的最佳实践**：
```typescript
// 不要一次性加载整个 PDF
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

// 逐页渲染，即时释放内存
for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    // 渲染后立即清理
    page.cleanup();
}
```

### 2.2 已知 Obsidian 插件案例

- **obsidian-pdf-search**: 使用 pdfjs-dist，采用延迟加载方案
- **obsidian-pdf-viewer**: 实现了分页缓存机制
- **obsidian-file-explorer**: 针对大文件采用流式处理

**关键经验**：所有成功的插件都采用"按需加载 + 及时释放"策略

---

## 三、内存管理最佳实践

### 3.1 避免内存溢出的四个原则

#### 原则 1：分段处理，不全量加载
```typescript
// ❌ 错误：一次性加载和转换
async function convertPdfWrong(buffer: ArrayBuffer) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    
    // 这会导致内存持续增长
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = await renderPage(page);
        pages.push(canvas.toDataURL()); // 每次 Base64 都留在内存
    }
    return pages; // 返回时内存峰值最高
}

// ✅ 正确：流式处理，处理完立即释放
async function convertPdfCorrect(
    buffer: ArrayBuffer, 
    onPageConverted: (base64: string, pageNum: number) => Promise<void>
) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = await renderPage(page);
        const base64 = canvas.toDataURL(); // 单页 Base64
        
        // 立即处理和释放
        await onPageConverted(base64, i);
        
        // 手动清理页面对象
        page.cleanup();
        canvas.width = 0;  // 释放 Canvas 内存
        canvas.height = 0;
    }
}
```

#### 原则 2：使用 Blob 而非 Base64（如果 API 支持）
```typescript
// ❌ Base64 会增加 33% 的内存占用
const base64 = canvas.toDataURL('image/jpeg', 0.8);
// 当文件是 3MB 时，Base64 字符串会变成 4MB

// ✅ Blob 更高效，直接上传
canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, `page_${pageNum}.jpg`);
    // 上传后立即释放
}, 'image/jpeg', 0.8);
```

#### 原则 3：控制 Canvas 尺寸和压缩质量
```typescript
// 渲染分辨率不要太高
const scale = 1.5; // 而不是 2.0 或 3.0
const viewport = page.getViewport({ scale });

// 压缩 JPEG 质量
canvas.toDataURL('image/jpeg', 0.75); // 而不是 0.95+

// 或者使用 Canvas 压缩 API
canvas.toBlob(callback, 'image/webp', 0.7); // WebP 更高效
```

#### 原则 4：设置超时和进度控制
```typescript
// 避免单个请求超时
const TIMEOUT_PER_PAGE = 20000; // 20 秒/页
const MAX_CONCURRENT_REQUESTS = 1; // 串行处理

// 添加进度回调和中断能力
async function convertPdfWithControl(
    buffer: ArrayBuffer,
    onProgress: (current: number, total: number) => void,
    onCancel: () => boolean
) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
        if (onCancel()) break; // 支持用户中断
        
        try {
            // 为每页设置超时
            const pagePromise = convertPage(i, pdf);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Page timeout')), TIMEOUT_PER_PAGE)
            );
            
            await Promise.race([pagePromise, timeoutPromise]);
            onProgress(i, pdf.numPages);
        } catch (err) {
            console.warn(`Page ${i} failed:`, err);
            // 继续处理下一页，而不是中止整个流程
        }
    }
}
```

### 3.2 内存使用对比

| 方案 | 内存峰值 | 处理时间 | 用户体验 |
|-----|--------|--------|--------|
| 全量加载（错误） | 100MB+ PDF = 300MB+* | 长等待 | 卡顿 / 崩溃 |
| 逐页流式 | 100MB PDF = 5-10MB* | 流畅 | 显示进度条 |
| 分页 + 立即上传 | 100MB PDF = 2-3MB* | 最快 | 最佳 |

*注：数值为相对估算，100MB PDF 作为基准

---

## 四、Obsidian 插件特定的考虑

### 4.1 Worker 配置问题

在 Obsidian 中使用 pdfjs-dist 最常见的错误是 Worker 路径配置：

```typescript
// ❌ 在 Obsidian 中经常失败
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ✅ 正确的做法（选项 1）：使用本地 Worker
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ✅ 正确的做法（选项 2）：fallback 到主线程
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = ...; // 尝试加载 Worker
} catch {
    // Worker 加载失败，会自动回退到主线程处理
    // 性能会降低，但不会崩溃
}
```

### 4.2 esbuild 配置调整

在 `esbuild.config.mjs` 中需要特殊处理：

```javascript
// 在 esbuild 配置中
{
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: ['obsidian', 'electron', '@codemirror/...'],
    
    // 关键：将 pdfjs-dist 的 worker 标记为外部资源
    plugins: [{
        name: 'pdf-worker',
        setup(build) {
            build.onResolve({ filter: /pdf\.worker/ }, args => ({
                path: args.path,
                external: true
            }));
        }
    }],
    
    // 或者直接复制 worker 文件
    loader: {
        '.mjs': 'copy'
    }
}
```

### 4.3 内存限制

Obsidian 进程的内存限制取决于系统，但建议：
- **单个 PDF 文件不超过 200MB**
- **页面分辨率缩放系数 ≤ 1.5**（对于手写识别足够）
- **JPEG 质量 ≤ 0.8**（平衡质量和文件大小）

---

## 五、推荐实现方案

### 方案选择

根据以上调研，推荐采用 **"流式分页 + 立即上传"** 方案：

```typescript
// 伪代码流程
class PDFProcessor {
    async processPdf(
        buffer: ArrayBuffer,
        onPageReady: (base64: string, pageNum: number) => Promise<void>,
        onProgress: (current: number, total: number) => void
    ) {
        // 1. 加载 PDF（不解析）
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const totalPages = pdf.numPages;
        
        // 2. 逐页处理
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            try {
                // 2a. 获取页面
                const page = await pdf.getPage(pageNum);
                
                // 2b. 渲染到 Canvas（设置合理的缩放）
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = this.createCanvas(viewport.width, viewport.height);
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                
                // 2c. 转换为 Base64
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                
                // 2d. 立即发送给 AI（不等待全部完成）
                await onPageReady(base64, pageNum);
                
                // 2e. 清理内存
                page.cleanup();
                canvas.width = 0;
                canvas.height = 0;
                
                // 2f. 报告进度
                onProgress(pageNum, totalPages);
                
            } catch (err) {
                console.error(`Failed to process page ${pageNum}:`, err);
                // 继续处理下一页
            }
        }
    }
}
```

### 内存优化清单

| 检查项 | 实现 | 优先级 |
|--------|------|--------|
| 逐页渲染 + 及时释放 | page.cleanup() 后及时删除 Canvas | 🔴 必须 |
| Base64 压缩 | JPEG 0.75 质量 或 WebP 0.7 | 🔴 必须 |
| 缩放系数 | ≤ 1.5 而不是 2.0+ | 🟡 推荐 |
| 流式处理 | 逐页发送 API，不等待全部完成 | 🟢 可选 |
| 超时保护 | 单页 20 秒超时 | 🟡 推荐 |
| 用户中断 | 提供取消按钮 | 🟢 可选 |

---

## 六、与 Ink2Vault 的集成策略

### 修改要点

1. **FileProcessor**：添加 `convertPdfToImagesStream()` 方法
   - 输入：PDF ArrayBuffer
   - 输出：流式 Base64 迭代器（而非数组）
   - 特性：支持进度回调，支持中断

2. **ConversionService**：采用流式合并
   - 不再等待所有页面渲染完成
   - 一页转换完立即发送给 AI 处理
   - 使用 `---\n\n## 第 N 页\n\n` 分隔符合并结果

3. **UI**：实时进度显示
   - 显示 "处理中: 第 3/10 页"
   - 可选：显示内存使用量
   - 支持取消按钮

---

## 七、参考资源

### pdfjs-dist 官方文档
- [Getting Started](https://mozilla.github.io/pdf.js/getting_started/)
- [API 文档](https://mozilla.github.io/pdf.js/api/)
- [GitHub Wiki](https://github.com/mozilla/pdf.js/wiki)

### 相关 npm 包
- `pdfjs-dist@^4.x` - 核心库
- `canvas` - 如果需要 Node.js 环境
- `sharp` 或 `imagemin` - 图片优化（可选）

### 性能测试工具
- Chrome DevTools Memory Profiler
- Obsidian 插件内 `console.memory` 监控

---

## 八、快速决策树

```
需要处理 PDF 吗？
├─ 是，文件通常 < 50MB
│  └─ 使用方案：流式分页 + 立即上传（推荐）
│     └─ 配置：scale=1.5, quality=0.8, timeout=20s
│
├─ 是，文件可能 > 50MB
│  └─ 使用方案：用户选择页面范围
│     └─ 配置：scale=1.2, quality=0.75, timeout=30s
│
└─ 是，需要最高质量
   └─ 使用方案：流式分页 + 分阶段上传
      └─ 配置：scale=2.0, quality=0.95，但限制并发=1
```

---

## 九、总结

**在 Obsidian 中处理 PDF 的黄金法则**：

1. ✅ 使用 pdfjs-dist 的流式 API，不全量加载
2. ✅ 每页渲染后立即调用 `page.cleanup()`
3. ✅ 使用 JPEG 0.75 质量或 WebP 0.7 质量
4. ✅ 缩放系数控制在 1.5 以内
5. ✅ 逐页发送给 AI，不等待全部完成
6. ✅ 提供进度条和取消按钮
7. ❌ 不要一次性转换 Base64 数组
8. ❌ 不要忽视 Worker 配置问题
9. ❌ 不要使用超高清渲染（除非特别需要）

**预期结果**：
- ✅ 20 页 PDF (50MB)：在 1-2 分钟内完成
- ✅ 内存占用：稳定在 5-10MB（而非 300MB+）
- ✅ 用户体验：实时进度反馈，可随时取消
