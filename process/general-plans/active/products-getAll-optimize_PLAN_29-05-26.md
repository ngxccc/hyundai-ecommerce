# PLAN: Product Query Optimization (Performance & Clean Code)

Date: 29-05-2026

## 1. Context

Hàm `getAll` trong `ProductService` đang được báo cáo là thiếu tối ưu ở cả cấp độ Code Structure (Clean Code) lẫn Database Performance.
Theo yêu cầu, tôi sẽ tách kế hoạch làm 2 giai đoạn và ưu tiên thực thi việc tối ưu Database (Phương án 2) trước.

## 2. Đề xuất Thay đổi (Proposed Changes)

### Giai đoạn 1: Tối ưu Database Performance (Phương án 2)

- **[MODIFY] `packages/database/src/schemas/product.schema.ts`**:
  - Thêm PostgreSQL `Expression Index` vào Drizzle schema cho 2 thông số: `power` và `voltage`.
  - Cú pháp khai báo index sẽ match 100% với hàm `CASE WHEN` ép kiểu mà chúng ta vừa fix ở vòng trước. Điều này đảm bảo Postgres sẽ dùng Index thay vì Full Table Scan.
- **[COMMAND] Drizzle Migration**:
  - Thực thi lệnh `bun run db:generate` (qua Doppler) để tạo file migration.
  - Thực thi lệnh `bun run db:push` (hoặc `db:migrate`) để đẩy thay đổi lên database.

### Giai đoạn 2: Tối ưu Code Structure (Phương án 1)

- **[MODIFY] `packages/database/src/services/product.service.ts`**:
  - Tách toàn bộ khối logic build biến `andFilters` thành một private method: `private buildGetAllFilters(options): SQL[]`.
  - Dọn dẹp hàm `getAll` để nó chỉ chịu trách nhiệm đúng nghĩa là tương tác Drizzle API (`findMany`) và xử lý cursor pagination.

## 3. Câu hỏi mở (User Review Required)

1. Do việc chạy Drizzle migration (`db:generate`) sẽ can thiệp vào Database thông qua `doppler run`, tôi có được phép chạy trực tiếp các lệnh Terminal này trên máy của bạn ở Giai đoạn 1 không?
   - Có
2. Lưu ý kỹ thuật: `drizzle-kit` đôi khi không hỗ trợ gen tự động `CREATE INDEX` đối với các biểu thức SQL quá phức tạp (Raw SQL Index). Nếu lệnh generate tự động thất bại, tôi sẽ phải tạo một file migration SQL rỗng và tự viết câu lệnh `CREATE INDEX` bằng tay. Bạn đồng ý phương án dự phòng này chứ?
   - Có
