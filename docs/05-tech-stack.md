# 05. Technology Stack & Architecture Guidelines

Tài liệu này quy định các công nghệ cốt lõi (Core Stack) được sử dụng để phát triển hệ thống E-commerce B2B. Lựa chọn công nghệ được tối ưu hóa cho kiến trúc Serverless, khả năng mở rộng nhanh (Scalability), và an toàn kiểu dữ liệu (End-to-end Type Safety).

---

## 1. Core Framework & Runtime

- **Framework: Next.js 16 (App Router)**
  - *Tại sao chọn:* Hỗ trợ Native cho React Server Components (RSC) và Server Actions. Là môi trường lý tưởng nhất để triển khai Generative UI (RAG Chatbot trả về Component).
- **Runtime & Package Manager: Bun**
  - *Tại sao chọn:* Tốc độ khởi động và cài đặt package cực nhanh. Thay thế hoàn toàn Node.js, npm/pnpm, và các tool chạy script (tsx/ts-node) truyền thống.

---

## 2. Database & ORM (Data Layer)

- **Primary DB: PostgreSQL (Neon Serverless)**
  - *Tại sao chọn:* Hỗ trợ Auto-scaling và Database Branching (tạo nhánh dữ liệu như Git). Cực kỳ phù hợp với luồng CI/CD hiện đại. Tích hợp sẵn Connection Pooling (PgBouncer) để không bị cạn kiệt connection khi Vercel spin-up hàng ngàn Serverless Functions.
- **Vector DB: pgvector (Neon Extension)**
  - *Tại sao chọn:* Lưu trữ embedding vector (cho máy phát điện) chung chỗ với dữ liệu quan hệ. Loại bỏ độ trễ (latency) mạng và chi phí maintain khi phải dùng Qdrant hoặc Pinecone riêng lẻ.
- **ORM: Drizzle ORM**
  - *Tại sao chọn:* Nhẹ, type-safe 100%, không sử dụng cơ chế query engine nặng nề như Prisma. Sinh ra raw SQL cực nhanh, tối ưu tuyệt đối cho môi trường Edge/Serverless.

---

## 3. State Management & Frontend UI

- **Global State: Zustand**
  - *Tại sao chọn:* Nhẹ, không cần bọc `<Provider>` rườm rà như Redux/Context API. Hoạt động hoàn hảo trong mô hình Island Architecture để cập nhật state (như Giỏ hàng) từ các Client Component rời rạc.
- **Styling: Tailwind CSS v4**
  - *Tại sao chọn:* Tiêu chuẩn công nghiệp cho Atomic CSS, engine mới với tốc độ biên dịch JIT nhanh hơn, giảm dung lượng bundle size.
- **UI Components: Shadcn UI (Radix Primitives)**
  - *Tại sao chọn:* Unstyled components có khả năng tiếp cận (Accessible) cao. Khởi tạo UI chuẩn Enterprise (Data Tables, Modals, Toasts, Dropdowns) mà không bị khóa chặt vào một thư viện đóng gói sẵn (như Ant Design hay MUI).

---

## 4. Background Jobs & Caching (Xử lý nền)

- **Job Orchestration: Inngest**
  - *Tại sao chọn:* "Trùm" xử lý tác vụ nền trên Serverless. Thay thế hoàn toàn BullMQ/Celery. Quản lý các luồng Fan-out (xử lý 50k báo giá hết hạn) và Dead Letter Queue (Gửi email lỗi) qua cơ chế Event-driven mà không cần host Redis riêng.
- **Cache & Rate Limiting: Upstash Redis**
  - *Tại sao chọn:* Redis chuẩn Serverless (kết nối qua HTTP/REST thay vì TCP). Dùng để lưu Guest Cart, xử lý Idempotency Key (chống request lặp khi thanh toán), và Rate Limiting chống Brute-force.

---

## 5. AI & Integrations (Ecosystem)

- **AI Agent: Vercel AI SDK + LangGraph.js**
  - *Tại sao chọn:* LangGraph quản lý luồng suy luận phức tạp (DAG) của Chatbot B2B. Vercel AI SDK (`streamUI`) lo việc stream trực tiếp các React Components về phía Client một cách mượt mà.
- **Authentication: Better-Auth**
  - *Tại sao chọn:* Cặp bài trùng với Drizzle ORM. Xử lý xuất sắc bài toán Multi-tenant (Organization) cho các Đại lý B2B. Hỗ trợ Session Revocation theo thời gian thực và cấu hình 2FA (TOTP) Out-of-the-box, vượt trội hoàn toàn so với Auth.js.
- **Email Communication: Resend + React Email**
  - *Tại sao chọn:* Viết template email bằng chính React/Tailwind. API gửi mail cực nhanh, tích hợp mượt với Outbox Pattern và Inngest.
- **Storage: Cloudinary / AWS S3**
  - *Tại sao chọn:* Lưu trữ và tối ưu hóa hình ảnh máy phát điện, lưu trữ file PDF (Datasheet/Specs) với khả năng phân phối qua CDN toàn cầu.
