# Contributing Guide

Thank you for considering contributing to **Hyundai Ecommerce**!
We welcome contributions from the community to help improve this B2B industrial equipment platform.

---

## 📋 Table of Contents

- [Contributing Guide](#contributing-guide)
  - [📋 Table of Contents](#-table-of-contents)
  - [🛠 Development Setup](#-development-setup)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Running the Project](#-running-the-project)
  - [📏 Coding Guidelines](#-coding-guidelines)
  - [📨 Commit Messages](#-commit-messages)
  - [🔄 Pull Request Process](#-pull-request-process)
  - [🐛 Reporting Issues](#-reporting-issues)
  - [📜 License](#-license)

---

## 🛠 Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ngxccc/hyundai-ecommerce.git
   cd hyundai-ecommerce
   ```

2. **Install dependencies** (using Bun)

   ```bash
   bun install
   ```

3. **Set up environment variables**

   Copy the example env files and configure them:

   ```bash
   cp apps/storefront/.env.example apps/storefront/.env
   cp packages/database/.env.example packages/database/.env
   ```

---

## 📁 Project Structure

```bash
apps/
├── storefront/      # Main customer-facing e-commerce website (Next.js)
└── docs/            # Technical documentation site (Fumadocs)

packages/
├── database/        # Drizzle ORM schemas, queries, migrations
├── types/           # Shared TypeScript types & Zod schemas
├── typescript-config/ # Shared TypeScript configurations
└── eslint-config/   # Shared ESLint configuration
```

---

## 🚀 Running the Project

```bash
# Start all apps in development mode
bun run dev

# Or run individually
bun --filter=storefront run dev     # → http://localhost:3000
bun --filter=docs run dev --port 3001   # → http://localhost:3001
```

---

## 📏 Coding Guidelines

- **TypeScript**: Strict mode is enabled. All code must be type-safe.
- **Linting**: We use ESLint (v9 flat config). Run `bun run lint` before committing.
- **Formatting**: Prettier is configured. Code will be auto-formatted on commit.
- **Component Style**: Use shadcn/ui components and Tailwind CSS.
- **File Naming**: Use kebab-case for files and PascalCase for React components.

---

## 📨 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `chore`: Build process or auxiliary tool changes

Example:

```bash
feat: add advanced product filtering by JSONB specs
fix: resolve concurrency issue in cart merge
docs: update architecture documentation
```

---

## 🔄 Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `bun run lint` and ensure all tests pass
5. Commit your changes using Conventional Commits
6. Push to your branch and open a Pull Request

---

## 🐛 Reporting Issues

Please use GitHub Issues to report bugs or request features. When creating an issue, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment information (Bun version, Node version, OS)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

**Thank you for contributing!** 💙

We appreciate every contribution that helps make Hyundai Ecommerce better.
