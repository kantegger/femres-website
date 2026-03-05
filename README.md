# FemRes 🌸

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro](https://img.shields.io/badge/Astro-5.13-BC52EE?logo=astro)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**FemRes** is an open-source feminist content aggregation platform dedicated to collecting, organizing, and sharing high-quality feminist resources worldwide.

> **Vision**: To help everyone seeking feminist knowledge find valuable resources here.

[Live Demo](https://femres.org) | [中文版本](#中文)

---

## 📑 Table of Contents

- [Features](#-features)
- [Content Types](#-content-types)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 📚 **Diverse Content** - Curated books, articles, films, videos, podcasts, and academic papers
- 🌍 **Multilingual** - Supports English, Chinese (Simplified/Traditional), Japanese, and French
- 🏷️ **Topic System** - Fine-grained tagging for easy content discovery
- 👤 **User System** - Registration, login, and user profiles
- 💬 **Community** - Comments, likes, and bookmarks
- 🔍 **Search** - Full-text search across all content
- 🌙 **Dark Mode** - Light/dark theme support

### Content Management
- 📝 **Markdown-based** - All content managed in Markdown
- 📅 **Publication Tracking** - Track release dates and sources
- 🔗 **Source Attribution** - Original source links preserved
- 🖼️ **Cover Images** - Visual previews for content

---

## 📦 Content Types

| Type | Description | Examples |
|------|-------------|----------|
| **Books** | Feminist literature and gender studies | *The Second Sex*, *The Feminine Mystique* |
| **Articles** | In-depth reports and commentary | Guardian essays, academic papers |
| **Films** | Feminist-themed movies and documentaries | *Portrait of a Lady on Fire*, *Barbie* |
| **Videos** | Lectures and documentaries | TED talks, academic lectures |
| **Podcasts** | Audio content | Feminist discussion shows |
| **Papers** | Academic research | Gender studies journal articles |

---

## 🛠️ Tech Stack

### Frontend
- **[Astro](https://astro.build/)** - High-performance static site generator
- **[React](https://reactjs.org/)** - Interactive UI components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend & Database
- **[PostgreSQL](https://neon.tech/)** (Neon) - Serverless database
- **JWT** - User authentication
- **Web Crypto API** - Password encryption

### Deployment
- **[Vercel](https://vercel.com/)** - Frontend deployment and Serverless Functions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/kantegger/femres-website.git
cd femres-website

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# 4. Initialize database
# Run SQL statements from sql/schema.sql

# 5. Start development server
npm run dev
```

Visit http://localhost:4321

### Environment Variables

Create `.env.local` file:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key

# Cloudflare R2 (optional, for image storage)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=femres-media

# AdSense (optional)
PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxx
```

---

## 📦 Deployment

### Deploy to Vercel

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

Quick deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel

# Deploy to production
vercel --prod
```

### Database Migration

```bash
# Migrate to Supabase using built-in script
npm run migrate
```

---

## 🤝 Contributing

We welcome all forms of contribution! Whether submitting new content, fixing bugs, improving documentation, or translating.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Ways to Contribute

1. **Submit Content** - Recommend books, articles, and other resources via Issue
2. **Code Contributions** - Fork the repo and submit Pull Requests
3. **Improve Translations** - Help improve multilingual content
4. **Report Issues** - Found a bug or have a feature idea? Submit an Issue

---

## 🌍 Multilingual Support

FemRes currently supports:

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Full Support |
| 简体中文 | zh-CN | ✅ Full Support |
| 繁體中文 | zh-TW | ✅ Full Support |
| 日本語 | ja | ✅ Full Support |
| Français | fr | ✅ Full Support |

Language files are located in `src/i18n/locales/`.

---

## 📁 Project Structure

```
├── public/                 # Static assets
│   └── images/            # Images (CDN deployment)
├── scripts/               # Utility scripts
│   ├── migrate-to-supabase.ts
│   └── upload-to-r2.ts
├── sql/                   # Database SQL files
│   └── schema.sql
├── src/
│   ├── components/        # React/Astro components
│   ├── content/           # Content collections (Markdown)
│   │   ├── articles/      # Articles
│   │   ├── books/         # Books
│   │   ├── films/         # Films
│   │   ├── papers/        # Academic papers
│   │   ├── podcasts/      # Podcasts
│   │   └── videos/        # Videos
│   ├── i18n/              # Internationalization
│   │   ├── locales/       # Translation files
│   │   └── topicsMapping.json
│   ├── layouts/           # Page layouts
│   ├── lib/               # Utilities
│   ├── pages/             # Page routes
│   │   ├── api/           # API endpoints
│   │   └── [locale]/      # Multilingual pages
│   └── styles/            # Global styles
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🔒 Security

If you discover a security vulnerability, please email [security@femres.org](mailto:security@femres.org) privately rather than opening a public issue.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

You are free to:
- ✅ Use, copy, and modify this project
- ✅ Use for commercial or non-commercial purposes
- ✅ Publish derivative works

The only requirement is to retain the original license and copyright notice in your project.

---

## 💜 Acknowledgments

Thanks to all volunteers, content curators, and developers who have contributed to FemRes.

Special thanks to the open-source community for the excellent tools: Astro, React, Tailwind CSS, and more.

---

## 📬 Contact

- **Website**: [femres.org](https://femres.org)
- **Email**: [contact@femres.org](mailto:contact@femres.org)
- **GitHub Issues**: [Submit issues or suggestions](https://github.com/kantegger/femres-website/issues)

---

<div align="center">

**Working towards gender equality** 💪

</div>

---

<a name="中文"></a>

## 中文版本

**FemRes** 是一个开源的女性主义内容聚合平台，致力于收集、整理和分享全球优质的女性主义相关资源。

> **愿景**：让每一个寻找女性主义知识的人，都能在这里找到有价值的资源。

### 功能特性

- 📚 **多元内容** - 收录书籍、文章、电影、视频、播客、学术论文
- 🌍 **多语言** - 支持简体中文、繁体中文、英语、日语、法语
- 🏷️ **主题分类** - 精细化的主题标签，便于内容发现
- 👤 **用户系统** - 注册、登录、个人中心
- 💬 **社区互动** - 评论、点赞、收藏功能
- 🔍 **内容搜索** - 全文搜索，快速定位资源
- 🌙 **深色模式** - 支持亮色/暗色主题切换

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/kantegger/femres-website.git
cd femres-website

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填写数据库连接信息

# 启动开发服务器
npm run dev
```

访问 http://localhost:4321

### 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细流程。

### 许可证

[MIT 许可证](LICENSE)
