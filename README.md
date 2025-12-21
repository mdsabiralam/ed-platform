# Ed Platform - SaaS School Management System

**Ed Platform** is a comprehensive, offline-first, super-app designed for schools. It aims to bridge the digital divide by providing a robust SaaS solution that works seamlessly even with intermittent internet connectivity.

## 🚀 Project Vision

To empower educational institutions with a unified platform that manages administration, learning, and communication, ensuring data accessibility and integrity regardless of connectivity status.

## 🛠 Tech Stack

### Backend (`apps/backend`)
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL (with Prisma ORM)
- **Caching:** Redis
- **Language:** TypeScript

### Mobile App (`apps/mobile`)
- **Framework:** Flutter
- **Local Database:** Drift (SQLite) for Offline-first capability
- **State Management:** flutter_bloc
- **Language:** Dart

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Monorepo Management:** NPM Workspaces / TurboRepo

## 📂 Project Structure

```bash
ed-platform/
├── apps/
│   ├── backend/          # NestJS API Server
│   └── mobile/           # Flutter Mobile Application
├── packages/
│   └── shared-types/     # Shared TypeScript interfaces & enums
├── docker-compose.yml    # Local development infrastructure
└── README.md             # Project documentation
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
