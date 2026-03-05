# Contributing to FemRes

Thank you for your interest in FemRes! We welcome all forms of contribution, including but not limited to:

- 📝 Submitting new content resources (books, articles, films, etc.)
- 🐛 Reporting bugs or suggesting features
- 💻 Submitting code improvements
- 🌍 Improving translations
- 📖 Enhancing documentation

[中文版本](#中文)

---

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How to Contribute](#-how-to-contribute)
  - [Submit Content](#1-submit-content)
  - [Report Issues](#2-report-issues)
  - [Code Contributions](#3-code-contributions)
- [Content Guidelines](#-content-guidelines)
- [Development Workflow](#-development-workflow)
- [Commit Message Guidelines](#-commit-message-guidelines)
- [Community](#-community)

---

## 📜 Code of Conduct

### Our Pledge

To create an open and welcoming environment, we pledge to:

- Respect every participant regardless of experience level, gender, sexual orientation, disability, appearance, ethnicity, or religion
- Welcome different perspectives and experiences
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Sexualized language or imagery
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information without permission
- Other unethical or unprofessional conduct

---

## 🙋 How to Contribute

### 1. Submit Content

This is our most needed contribution! The core of FemRes is content aggregation.

#### Content Types

We accept the following types:

| Type | Description | Examples |
|------|-------------|----------|
| Books | Feminist literature and gender studies | *The Second Sex*, *The Beauty Myth* |
| Articles | In-depth reports, commentary, interviews | Guardian essays, academic papers |
| Films | Feminist-themed movies and documentaries | *Portrait of a Lady on Fire*, *Barbie* |
| Videos | Lectures, courses, documentaries | TED talks, academic lectures |
| Podcasts | Audio programs | Feminist discussion shows |
| Papers | Academic research | Gender studies journal articles |

#### How to Submit Content

**Option 1: Via GitHub Issue (Recommended for beginners)**

1. Go to [GitHub Issues](https://github.com/kantegger/femres-website/issues)
2. Click "New Issue"
3. Select the "Content Recommendation" template
4. Fill in the content information and submit

**Option 2: Direct Pull Request (Recommended for experienced contributors)**

1. Fork this repository
2. Prepare content following the [content guidelines](#-content-guidelines)
3. Submit a Pull Request

#### Content Quality Standards

Submitted content should:

- ✅ Be related to feminism, gender equality, or women's rights
- ✅ Come from credible sources (reputable publishers, academic journals, authoritative media)
- ✅ Have clear titles in both English and Chinese
- ✅ Provide original source links
- ✅ Include brief descriptions/summaries
- ❌ Not contain harmful, hateful, or discriminatory content
- ❌ Not infringe on copyright

---

### 2. Report Issues

#### Bug Reports

If you find a bug, please report it via [GitHub Issues](https://github.com/kantegger/femres-website/issues).

**Bug Report Template:**

```markdown
**Description**
A clear and concise description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots to help explain the problem.

**Environment**
- OS: [e.g., iOS, Windows]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 22]
```

#### Feature Requests

Have a new feature idea? We'd love to hear it!

**Feature Request Template:**

```markdown
**Feature Description**
A clear and concise description of what you want.

**Motivation**
Why would this feature be helpful to the project?

**Possible Implementation**
If you have ideas, briefly describe them.

**Additional Context**
Any other context or screenshots.
```

---

### 3. Code Contributions

#### Workflow

1. **Fork the repository** - Click the Fork button on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/femres-website.git
   cd femres-website
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kantegger/femres-website.git
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```
5. **Make changes and commit**
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Submit a Pull Request**

#### Pull Request Guidelines

- PR titles should clearly describe the changes
- Reference related issues in the description (if any)
- Ensure all tests pass
- Self-review before requesting review

---

## 📝 Content Guidelines

### Markdown File Format

All content uses Markdown format and is located in the `src/content/` directory.

#### Book Format Example

```markdown
---
title: "Book Title"
originalTitle: "Original Title"  # Original title (if applicable)
author: "Author Name"
publishDate: "2023-01-15"       # Publication date
description: "Brief description"
coverImage: "/images/books/cover.jpg"
isbn: "978-3-16-148410-0"
topics: ["feminist-theory", "gender-studies"]
status: "published"
---

Optional detailed content...
```

#### Article Format Example

```markdown
---
title: "Article Title"
author: "Author Name"
publishDate: "2023-06-20"
description: "Article abstract"
featuredImage: "/images/articles/image.jpg"
sourceUrl: "https://original-source.com/article"
readingTime: 10
topics: ["workplace-equality", "gender-pay-gap"]
status: "published"
---

Optional full content...
```

#### Film Format Example

```markdown
---
title: "Film Title"
originalTitle: "Original Title"
director: "Director Name"
year: 2023
country: "Country"
duration: 120
genre: ["Drama", "Biography"]
releaseDate: "2023-07-21"
description: "Film synopsis"
posterImage: "/images/films/poster.jpg"
topics: ["women-in-film", "feminist-art"]
status: "published"
---

Optional detailed content...
```

### Topic Tags

Use standard topic tags defined in `src/i18n/topicsMapping.json`.

Common topics:
- `feminist-theory` - Feminist theory
- `gender-equality` - Gender equality
- `workplace-equality` - Workplace equality
- `bodily-autonomy` - Bodily autonomy
- `reproductive-rights` - Reproductive rights
- `gender-violence` - Gender-based violence
- `intersectionality` - Intersectionality
- `lgbtq` - LGBTQ+ issues
- `women-in-history` - Women in history
- `women-in-politics` - Women in politics

### Multilingual Content

Content supports multilingual versions. Naming convention:

- English: `filename.md` or `filename-en.md`
- Simplified Chinese: `filename-zh.md` or `filename-zh-CN.md`
- Traditional Chinese: `filename-tw.md` or `filename-zh-TW.md`
- Japanese: `filename-ja.md`
- French: `filename-fr.md`

---

## 💻 Development Workflow

### Environment Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/femres-website.git
cd femres-website

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local

# 4. Start development server
npm run dev
```

### Code Style

- Use TypeScript for type definitions
- Follow ESLint rules
- Use functional components and Hooks (React)
- Use Tailwind CSS for styling

### Testing

Before submitting a PR, ensure:

```bash
# Type checking
npm run lint

# Build test
npm run build

# Local preview
npm run preview
```

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation update |
| `style` | Code style (formatting, no functional changes) |
| `refactor` | Code refactoring |
| `perf` | Performance optimization |
| `test` | Test-related changes |
| `chore` | Build process or auxiliary tool changes |
| `content` | Content-related (adding books, articles, etc.) |
| `i18n` | Internationalization/translation |

### Examples

```bash
# Add new book
feat(content): add "The Second Sex" by Simone de Beauvoir

# Fix search functionality
fix(search): resolve pagination issue

# Add Japanese translation
i18n(ja): add Japanese translations for about page

# Update documentation
docs: update deployment guide

# Performance optimization
perf(images): optimize image loading with lazy loading
```

---

## 🌍 Translation Contributions

### Translation Files Location

Translation files are located in `src/i18n/locales/`:

```
src/i18n/locales/
├── en.json       # English
├── zh-CN.json    # Simplified Chinese
├── zh-TW.json    # Traditional Chinese
├── ja.json       # Japanese
└── fr.json       # French
```

### How to Contribute Translations

1. Find the key that needs translation
2. Add translation to the corresponding language file
3. Submit a PR

### Translation Guidelines

- Maintain terminology consistency
- Pay attention to tone and style uniformity
- Add comments for culturally specific concepts

---

## 👥 Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature suggestions
- **GitHub Discussions** - General discussions
- **Email** - [contact@femres.org](mailto:contact@femres.org)

### Becoming a Maintainer

Long-term contributors may become project maintainers. Maintainer responsibilities include:

- Reviewing and merging Pull Requests
- Responding to Issues
- Maintaining documentation
- Guiding new contributors

---

## ❓ FAQ

### Q: How do I start contributing?

A: The easiest way is to [submit content resources](#1-submit-content). Find a good book, article, or film and submit it via Issue or PR!

### Q: Will my content be accepted?

A: As long as content meets the [quality standards](#content-quality-standards), we'll consider it. If unsure, open an Issue to discuss first.

### Q: I don't know how to code. Can I still contribute?

A: Absolutely! Content curation doesn't require programming skills. Your valuable domain knowledge and content recommendations are the greatest contribution.

### Q: What format requirements are there for submitted content?

A: Please refer to the [content guidelines](#-content-guidelines). Most importantly, provide accurate metadata (title, author, date, etc.).

---

<div align="center">

**Let's work together for gender equality!** 💜

</div>

---

<a name="中文"></a>

## 中文版本

感谢你对 FemRes 的兴趣！我们欢迎所有形式的贡献。

### 快速开始

**提交内容资源** - 这是我们最需要的贡献！

我们接受：书籍、文章、电影、视频、播客、学术论文

**提交方式：**
1. 通过 [GitHub Issue](https://github.com/kantegger/femres-website/issues) 提交（推荐新手）
2. 直接提交 Pull Request（推荐有经验者）

### 代码贡献

```bash
# Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/femres-website.git
cd femres-website

# 安装依赖
npm install

# 创建分支
git checkout -b feature/your-feature

# 提交更改
git push origin feature/your-feature
```

### 提交信息规范

- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `content` - 内容相关
- `i18n` - 翻译相关

### 联系我们

- **邮箱**：[contact@femres.org](mailto:contact@femres.org)
- **GitHub Issues**：[提交问题](https://github.com/kantegger/femres-website/issues)

[查看完整英文贡献指南](#contributing-to-femres)
