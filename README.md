# Surya's URL Shortening Service

A high-performance, private internal URL shortening and link management platform built for speed, security, craftsmanship, and reliability. Built upon the open-source Kutt platform, extensively modified for enterprise-grade internal team use.

---

## 🚀 Key Features

- **Crafted Modern UI/UX**: Handcrafted frontend powered by React 18, Vite, Framer Motion, TailwindCSS, and Lenis smooth scroll with Linear-style dark mode aesthetics.
- **Admin Operations Console**:
  - **Overview**: Real-time aggregated system counts and operational health monitoring.
  - **User Governance**: Account creation, role assignment, search, and user banning/deletion.
  - **Link Oversight**: Global link search, redirection inspection, and moderation options.
  - **Domain Management**: Custom domain mapping and routing control.
  - **Settings Dashboard**: Live platform environment configuration snapshot with masked secret handling and a copyable `.env` template builder.
- **Upstash Redis Caching**: Full serverless Redis support via `REDIS_URL` (`rediss://...`) with TLS, exponential backoff, and non-blocking fault tolerance.
- **PostgreSQL & Neon Database Support**: Cloud SQL readiness with native SSL support, connection pooling, and automated Knex migrations.
- **Private Access Control**: Public registration disabled by default for authenticated internal workspace safety.
- **Koyeb & Docker Ready**: Prepared out of the box for one-click deployment on Koyeb, Docker Compose, or containerized environments.

---

## 🛠️ Prerequisites & Stack

- **Node.js**: `v20` or higher (v22 recommended)
- **Database**: PostgreSQL (Neon, AWS RDS, Supabase) or SQLite/MySQL
- **Cache (Optional)**: Upstash Redis or self-hosted Redis

---

## ⚡ Quick Start

### 1. Local Development

```bash
# Clone the repository
git clone https://github.com/Maybesurya/URL-Shortner.git
cd URL-Shortner

# Install dependencies
npm install

# Set up environment variables
cp .example.env .env

# Run database migrations
npm run migrate

# Start development servers (Vite client + Node backend concurrently)
npm run dev
```

### 2. Production Build

```bash
# Compile Vite frontend assets to /dist
npm run build

# Run database migrations and start production server
npm run migrate
npm start
```

---

## ☁️ Deploying on Koyeb

This repository includes a `Dockerfile` and `koyeb.yaml` configured for instant Koyeb deployment.

### Deploying via Koyeb Dashboard / GitHub:

1. Push your repository to GitHub.
2. In [Koyeb Console](https://app.koyeb.com/), create a new **Web Service**.
3. Select your repository. Koyeb will automatically detect the `Dockerfile`.
4. Add your Environment Variables (e.g. `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `REDIS_URL`, `JWT_SECRET`).
5. Click **Deploy**. Koyeb will compile the Vite frontend, run migrations, and launch the service on port `8080` (or `3000`).

---

## 🐳 Docker Setup

Start the container stack using Docker Compose:

```bash
docker compose up -d
```

---

## ⚙️ Environment Variables

Copy `.example.env` to `.env` to configure your instance.

| Variable | Description | Default | Example |
| -------- | ----------- | ------- | ------- |
| `PORT` | Application HTTP port | `3000` | `8080` |
| `SITE_NAME` | Platform branding title | `Surya's URL Shortening Service` | `SURYA` |
| `DEFAULT_DOMAIN` | Primary domain name | `localhost:3000` | `sury.cc` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | - | `a-long-random-string` |
| `DB_CLIENT` | Database client (`pg`, `mysql2`, `better-sqlite3`) | `pg` | `pg` |
| `DB_HOST` | Database host address | `localhost` | `ep-sample-pooler.aws.neon.tech` |
| `DB_PORT` | Database port | `5432` | `5432` |
| `DB_NAME` | Database name | `surya` | `neondb` |
| `DB_USER` | Database user | `postgres` | `neondb_owner` |
| `DB_PASSWORD` | Database password | - | `your-db-password` |
| `DB_SSL` | Enable SSL for DB connection | `false` | `true` |
| `REDIS_ENABLED` | Enable Redis cache | `false` | `true` |
| `REDIS_URL` | Redis connection URL (Upstash / TLS supported) | - | `rediss://default:TOKEN@host.upstash.io:6379` |
| `REDIS_TLS` | Enable TLS for Redis connection | `false` | `true` |
| `DISALLOW_REGISTRATION` | Block public account signup | `true` | `true` |
| `DISALLOW_ANONYMOUS_LINKS` | Require authentication to create links | `true` | `true` |
| `TRUST_PROXY` | Enable reverse proxy IP header trust | `true` | `true` |

---

## 📄 License & Attribution

- Built on the open-source [Kutt.to](https://github.com/thedevs-network/kutt) codebase.
- Customized and maintained by [Surya](https://maybesurya.dev).
- Released under the MIT License.
