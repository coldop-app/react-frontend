# Coldop Frontend (React Version)

A modern web application for cold storage management built with **React**, **Vite**, **TypeScript**, **TanStack Router**, and **ShadCN UI**.

---

## 📦 Overview

Coldop is a comprehensive cold storage management system that helps manage:

- Incoming & outgoing orders
- Daybook entries
- Farmer records
- Cold storage locations
- Store admin workflows

This frontend communicates with an **external Fastify backend**, making the entire app a **fast, lightweight, client-side SPA**.

---

## ✨ Features

- 🔐 **Authentication** – Secure login with JWT-based authentication
- 📥 **Incoming Orders** – Create/edit orders with farmer, commodity, variety, size, and location details
- 📤 **Outgoing Orders** – Remove bags, update stock, verify location-level stock
- 📘 **Daybook** – Fully searchable, filterable, paginated view
- 👨‍🌾 **Farmer Management** – Add, update, and search farmers
- 🧭 **Store Dashboard** – Full admin UI for daily operations
- ⚙️ **Settings** – Preferences, profile, RBAC (roles)
- 🌓 **Dark Mode** – Theme toggle using Tailwind + ShadCN UI
- 📱 **Responsive UI** – Built with Tailwind CSS and ShadCN components
- ⚡ **Ultra-fast development** – Powered by Vite + TanStack Query caching

---

## 🛠️ Tech Stack

### Core
- **Framework:** React 19 (SPA)
- **Build Tool:** Vite 6
- **Language:** TypeScript
- **Router:** TanStack Router
- **Data Layer:** TanStack Query
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Component Library:** ShadCN UI
- **Styling:** Tailwind CSS 4

### Why React SPA instead of Next.js?

- No SSR/SSG/ISR needed for this internal dashboard
- Faster builds & instant HMR
- Zero serverless cost
- Cleaner routing with TanStack Router
- Clear separation from Fastify backend

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18+**
- pnpm **10.18.3+**

---

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd coldop-frontend
