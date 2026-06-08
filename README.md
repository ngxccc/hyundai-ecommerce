# Hyundai Ecommerce

## B2B E-commerce Platform for Industrial Equipment

A modern, high-performance B2B e-commerce system specialized in heavy machinery and industrial power generators (Hyundai, Mitsubishi, Kubota, etc.), built with focus on complex quote negotiation, multi-warehouse logistics, and enterprise-grade architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B67F?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-FF6B00?logo=drizzle&logoColor=white)](https://orm.drizzle.team)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

---

## 🚀 Live Sites

- **Main Storefront**: [https://hyundainhatnang.ngxc.io.vn](https://hyundainhatnang.ngxc.io.vn)
- **Admin Dashboard**: [https://admin.hyundainhatnang.ngxc.io.vn](https://admin.hyundainhatnang.ngxc.io.vn)
- **Technical Documentation**: [https://docs.hyundainhatnang.ngxc.io.vn](https://docs.hyundainhatnang.ngxc.io.vn)

---

## ✨ Key Features

- Advanced product filtering on technical specifications (JSONB)
- Full B2B quote negotiation workflow (Request → Review → Final Price → Payment)
- Multi-warehouse inventory with real-time stock management
- Dealer tier-based automatic pricing
- Secure guest + user cart with concurrency control
- Auto-generated technical documentation (Fumadocs)
- End-to-end type safety from database to frontend
- **Internationalization (i18n)**: Fully localized in English and Vietnamese using Next-Intl.
- **Admin Panel**: Secure dashboard for managing products, quotes, and users.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router + React Server Components)
- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Database**: Neon Serverless PostgreSQL + Drizzle ORM v1
- **Authentication**: Better Auth
- **Internationalization**: Next-Intl
- **Documentation**: Fumadocs
- **UI**: shadcn/ui + Tailwind CSS v4
- **State Management**: Zustand
- **Secrets Management**: Doppler
- **Background Jobs**: Inngest
- **Caching**: Upstash Redis

---

## 📁 Project Structure

```bash
hyundai-ecommerce/
├── apps/
│   ├── admin/               # Internal Admin Dashboard
│   ├── storefront/          # Customer-facing website
│   └── docs/                # Technical documentation site (Fumadocs)
├── packages/
│   ├── database/            # Drizzle schemas, queries & migrations
│   ├── types/               # Shared TypeScript types
│   ├── shared/              # Shared utilities and constants
│   ├── typescript-config/   # Shared TS config
│   └── eslint-config/       # Shared ESLint configuration
├── .github/workflows/       # CI/CD pipelines
└── turbo.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) (for fetching secrets during development)

### Local Development

1. **Login to Doppler** to sync environment variables:

   ```bash
   doppler login
   doppler setup
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Run the development servers**:

   ```bash
   # Run all apps with Doppler secrets
   bun run dev
   ```

Or run separately:

```bash
bun run dev:storefront     # → http://localhost:3000
# Run admin or docs via turbo filter
doppler run -- turbo run dev --filter=admin
```

---

## 📦 Scripts

```bash
bun run dev          # Start all development servers
bun run build        # Build all apps
bun run lint         # Run ESLint
bun run db:generate  # Generate Drizzle migrations
bun run db:push      # Push schema to database
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

**Built with ❤️ for industrial equipment distribution.**
