# TJA-Tatsujin

[English](./docs/README.en.md) | [日本語](./docs/README.ja.md) | 中文

一个为太鼓达人 (Taiko no Tatsujin) 玩家打造的谱面资源下载网站，提供便捷的谱面检索与下载功能。

---

## 🚀 项目简介

TJA-Tatsujin 是一个基于 Cloudflare Pages 部署的静态网页项目，旨在为太鼓达人玩家提供一个清晰、易用的谱面下载平台。

所有数据均来自公开资源，仅供学习与交流使用，请尊重原作者版权。

---

## 🔧 使用说明

### 别名管理

别名用于搜索谱面。如需修改谱面的别名，请编辑根目录下的 `alias.json` 文件。

请按照该文件中的已有格式进行增补或修改，确保使用合法的 JSON 语法。每个键为谱面的唯一标识（Song Name），值为嵌套 JSON，包含该谱面支持的搜索别名和在数据源仓库中的相对位置。修改后提交更新即可在网站中生效。

---

## 🛠️ 技术栈

- **前端**: HTML / CSS / JavaScript
- **构建工具**: Vite
- **部署平台**: Cloudflare Pages
- **自动化**: GitHub Actions
- **特性**:
  - 支持多语言国际化
  - 响应式设计
  - 本地存储配置

---

## 🌍 访问地址

👉 [https://taiko.vanillaaaa.org](https://taiko.vanillaaaa.org)

---

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 来帮助改进本项目！
无论是修正别名、优化界面，还是增强搜索功能，我们都十分感激。

- 提交问题 → [Issues](https://github.com/KirisameVanilla/TJA-Tatsujin/issues)
- 参与贡献 → Fork 本项目并提交 PR

---

## 📄 版权声明

本项目不拥有任何歌曲音频或版权，仅提供一个通用的谱面资源管理工具。
所有数据均来自公开数据源。
请在合法范围内使用本工具，禁止用于商业用途。

---

✨ 感谢太鼓达人社区的支持与贡献！
