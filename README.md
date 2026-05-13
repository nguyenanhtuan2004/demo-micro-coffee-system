# ☕ Brew & Go — Microservices Coffee Shop

> A **portfolio-ready** demo microservices system inspired by *Microservices Patterns* by Chris Richardson.
> Demonstrates Saga, CQRS, Event-Driven Architecture, API Gateway, and independent service databases.

---

## 🏗️ Architecture Overview

```
Browser (Next.js)
       │
       ▼
 ┌─────────────┐
 │  API Gateway │  :3000  ← JWT validation, request routing
 └──────┬──────┘
        │
   ┌────┴──────────────────────┐
   │           │               │              │
   ▼           ▼               ▼              ▼
Auth Svc   Order Svc      Inventory Svc   Analytics Svc
 :3001      :3002              :3003          :3004
   │           │               │              │
auth_db    order_db        inventory_db   analytics_db
              │
              └──── RabbitMQ ─────────────────┘
                     :5672
```

---

## 🔄 Saga Pattern Flow

```
Frontend → Gateway → Order Service
                          │
                          ├─ Creates Order (PENDING)
                          │
                          └─ Publishes ──► [order.created]
                                                │
                                          Inventory Service
                                          checks stock
                                         /              \
                                    OK                  FAIL
                                     │                    │
                              [inventory.reserved]  [inventory.failed]
                                     │                    │
                              Order → CONFIRMED     Order → REJECTED
                                     │
                              [order.confirmed]
                                     │
                              Analytics Service
                              updates read model
```

---

## 📊 CQRS Demonstration

The **Analytics Service** never queries the Order Service database.
It builds its own read model exclusively by consuming `order.confirmed` events:

```
Order Confirmed Event
       │
       ▼
Analytics Service
├── revenue_stats  (totalOrders, totalRevenue)
└── product_stats  (per-product sales and revenue)
```
Cách triển khai trên máy:
```
Bước 1: Chạy powersehll bằng run as administrator
Bước 2: Nhập wsl --install (chạy xong thì khởi động lại máy nếu có yêu cầu)
Bước 3: Tải docker: https://www.docker.com/products/docker-desktop/ (chọn docker-desktop -> window AMD64 -> chạy file vừa tải về -> chọn per user installation)
Bước 4: Sau khi tải xong, mở docker mở Docker Desktop: Settings → Resources → WSL Integration → bật distro Ubuntu. (thông thường mặc định là đã mở rồi)
Bước 5: Tải code về, giải nén.
Bước 6: Vào file sau khi đã giải nén, trỏ vào thanh đường dẫn thư mục -> nhập powersell -> cửa sổ powershell đang trỏ sẵn file code hiện ra
Bước 7: Nhập docker compose up --build vào powershell để build và khởi chạy toàn bộ hệ thống
Bước 8: Muốn truy cập vào phần nào thì nhìn "Access the app" bên dưới.
```
### Access the app

| Service           | URL                             |
|-------------------|---------------------------------|
| Frontend          | http://localhost:3005            |
| API Gateway       | http://localhost:3000            |
| RabbitMQ UI       | http://localhost:15672           |
| Auth Service      | http://localhost:3001            |
| Order Service     | http://localhost:3002            |
| Inventory Service | http://localhost:3003            |
| Analytics Service | http://localhost:3004            |

### Demo Login

```
Email:    admin@example.com
Password: 123456
```

---

## 📁 Project Structure

```
micro-coffee-system/
│
├── docker-compose.yml          # Orchestrates all services
│
├── gateway/                    # API Gateway (NestJS)
│   └── src/
│       ├── middleware/         # JWT auth middleware
│       └── gateway/            # Proxy controller + service
│
├── auth-service/               # Auth (NestJS + Prisma)
│   ├── prisma/schema.prisma    # users table
│   └── src/auth/               # login + JWT generation
│
├── order-service/              # Orders (NestJS + Prisma + RabbitMQ)
│   ├── prisma/schema.prisma    # orders + order_items tables
│   └── src/
│       ├── orders/             # CRUD + Saga orchestration
│       └── messaging/          # RabbitMQ producer/consumer
│
├── inventory-service/          # Inventory (NestJS + Prisma + RabbitMQ)
│   ├── prisma/schema.prisma    # inventory table
│   └── src/
│       ├── inventory/          # Stock management + Saga participant
│       └── messaging/          # Event consumer
│
├── analytics-service/          # Analytics (NestJS + Prisma + RabbitMQ)
│   ├── prisma/schema.prisma    # revenue_stats + product_stats (read model)
│   └── src/
│       ├── analytics/          # CQRS read model + REST query
│       └── messaging/          # Event consumer
│
└── frontend/                   # Next.js 15 + TailwindCSS
    └── src/
        ├── app/
        │   ├── login/          # Login page
        │   └── (dashboard)/
        │       ├── orders/     # Order management
        │       ├── inventory/  # Stock view
        │       └── analytics/  # Revenue + top products
        ├── components/         # Sidebar, Card, StatusBadge, etc.
        ├── lib/                # Axios client, menu data
        ├── store/              # Zustand auth store
        └── types/              # TypeScript types
```
