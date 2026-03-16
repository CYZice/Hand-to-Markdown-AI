<h1 align="center">Ink2Vault</h1>

<p align="center"><b>Obsidian 手写笔记与多格式图像的智能 Markdown 转换插件</b></p>

<p align="center">
一个强大的 Obsidian 增强工具，通过大型语言模型（Gemini / Claude / OpenAI）将您的手写笔记、PDF 文档及图片完美识别并转化为所见即所得的 Markdown 文本。
</p>

<p align="center">
<a href="https://github.com/CYZice/Ink2Vault/stargazers">
<img src="https://img.shields.io/github/stars/CYZice/Ink2Vault?style=flat-square&color=6c5ce7" alt="GitHub Stars">
</a>
<a href="https://github.com/CYZice/Ink2Vault/releases/latest">
<img src="https://img.shields.io/github/v/release/CYZice/Ink2Vault?style=flat-square&color=00b894" alt="Latest Release">
</a>
<a href="https://github.com/CYZice/Ink2Vault/releases">
<img src="https://img.shields.io/github/downloads/CYZice/Ink2Vault/total?style=flat-square&color=0984e3" alt="Downloads">
</a>
<a href="https://github.com/CYZice/Ink2Vault/blob/main/LICENSE">
<img src="https://img.shields.io/github/license/CYZice/Ink2Vault?style=flat-square&color=636e72" alt="License">
</a>
</p>

<p align="center">
<b>简体中文</b>
</p>

## 🌟 核心亮点

### 🤖 智能上下文与无缝融合
告别繁琐的快捷键绑定，采用统一的 **全局智能判断架构**。让 AI 顺应你的输入流：

| 行内链接无缝转换 | 预览模式提取替换 | 侧边栏/全局批量执行 |
|:--:|:--:|:--:|
| ![Source Edit](./assets/source-edit.png) | ![Preview Extract](./assets/preview-extract.png) | ![Folder Batch](./assets/folder-batch.png) |
| 在源码模式对 `![[]]` 图片链接触发，**转换文本将精准嵌入至代码下一行**，不破坏原有结构。 | 在实时预览/阅读模式直接右击图像进行提取，后台将跨越DOM寻址并进行精准行内替换。 | 在文件树右键整组目录或使用热键呼出，启动带有实时监控的深度渲染与排队转换引擎。 |

### 🪡 硬核原位网络防御：断点级错误恢复
对于处理数百页超大 PDF 资料时极为关键的护城河能力：
网络中途中断或触发 API 频率限制不再是噩梦。你可以对任何生成出错残缺的 Markdown 输出文件右键点击 **“重试转换”**。程序会精准识别日志中的 `> [!ERROR]` 位置，**仅重新请求失败的页面并完美原位覆盖**，绝不出错打乱阅读顺序。

## 🎯 功能特性

| 特性 | 说明详解 |
|---------|-------------|
| 📝 **多格式通吃** | 并发处理 PDF、JPG、PNG 等手写扫描文档及 Excalidraw 等数字草图。 |
| 🌐 **三强模型集成** | 内置 Gemini (Google)、Claude (Anthropic)、OpenAI 接口调用支持。自定义代理 Base URL。 |
| 🎛️ **高度配置化** | 支持自由调配系统提示词 (Prompt)、温度值 (Temperature) 及处理 Token 上限。 |
| 📁 **自动化文件系统** | 自定义提取后保存位置并提供重命名处理策略，或是采用全局自动就地插入策略。 |
| 📊 **批处理 UI** | 多文件扫描并发转换自带友好现代化的 Obsidian 日志面板和排队处理进度条。 |

---

## ⚡ 快捷键与指令

通过精心编排极简的用户交互层：

### 统一快捷键

| 快捷键 (可自定义) | 触发功能 |
|--------|------|
| `Ctrl+Alt+C` 或 `Cmd+Alt+C` | **智能转换为Markdown**<br>基于焦点：选中文件则弹窗、基于图片则行内替换、无目标则全局呼出 |
| `Ctrl+,` | **直达偏好设置** |

### 全场景右键菜单 (Context Menus)

1. **左侧文件树**：对任何支持图片或含图片的文件夹右击进行递归批量转换。
2. **源码编辑模式**：聚焦任一图像或 PDF 引用链接右键，选用行内精准转换插入。
3. **沉浸阅读 / 网页模式**：在此模式下右点某张图，后台反向溯源帮你将这行图表提炼为对应文本。
4. **输出记录二次干预**：右键已经部分转换完成包含错误标注的文章，即可触发缺失页精准无损填补。

---

## 🚀 快速开始

### 前置准备资源要求
您需要自备对应厂商的 API 令牌，支持：
* **Gemini**: [Google AI Studio](https://makersuite.google.com/)
* **Claude**: [Anthropic Console](https://console.anthropic.com/)
* **OpenAI**: [OpenAI Platform](https://platform.openai.com/)

### 安装步骤 (手动发布版本)
1. 前往本仓库 [Releases](https://github.com/CYZice/Ink2Vault/releases) 页面，下载最新的 `main.js`, `manifest.json`, 以及 `styles.css` 文件。
2. 在您的 Obsidian 笔记目录中创建：`<vault>/.obsidian/plugins/Ink2Vault/`
3. 塞入这三个文件后，在 Obsidian 设置 -> 第三方插件 -> 启用 "Ink2Vault"。
4. 进到插件配置页维护您的 API 信息，直接开启您的生产力魔法！

---

## 🛠️ 故障排除

* **大范围 `转换失败`**: 请第一时间按 `F12` 或前往控制台审查是否有 API 报错；核对密钥以及您的网络连通性。也可以尝试加大配置中的"超时时间"。
* **排版异常 / 并发丢页**: 超过 10 MB 单图片或大体积扫描件将考验你的网络带宽，遇到转换打断等情况，请对 Markdown 文件直接唤醒**断点重试**菜单修复个别失败页面。

---

## 👨‍💻 开发者指南

基于现代前端管线开发与自动化部署：

```bash
# 1. 挂载环境
npm install

# 2. 本地调试与文件自动重载
npm run dev

# 3. 集成打包打标
npm run build

# 4. 发布与版本快推 (联动 Github Actions 实现自建 Release)
# 只需敲入以下命令实现 Tag + Commit + Release 自动流水线：
npm version patch # or minor, major
```

## 📜 开源协议与感谢
此增强套件使用 [MIT License](LICENSE) 证书开源发布。

<p align="center">
<a href="https://github.com/CYZice/Ink2Vault/issues" target="_blank">
<img src="https://img.shields.io/badge/提交意见-Issue-red?style=for-the-badge" alt="Issues">
</a>
</p>
