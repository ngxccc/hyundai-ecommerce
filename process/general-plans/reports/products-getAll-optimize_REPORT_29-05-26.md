# REPORT: Product Query Optimization

Date: 29-05-2026

## 1. Kết quả thực thi

Đã hoàn thành toàn bộ 2 Giai đoạn tối ưu Database và Code Structure cho hàm `getAll` của sản phẩm.

## 2. Chi tiết công việc đã thực hiện

### A. Tối ưu Database Performance (Phase 1)

- Đã thêm 2 `Expression Index` vào Drizzle Schema (`packages/database/src/schemas/product.schema.ts`) sử dụng chính xác cú pháp RAW SQL `CASE WHEN ...` để PostgreSQL có thể khớp index.
- Đã chạy lệnh `db:generate` qua Doppler. Rất may mắn là Drizzle-kit phiên bản mới đã parse và gen thành công mã `CREATE INDEX` cho Raw SQL.
- Đã chạy lệnh `db:push` đẩy Schema lên môi trường Cloud Database qua Doppler.
- **Kết quả:** Các truy vấn lọc theo Công suất (power) và Điện áp (voltage) giờ đây sẽ sử dụng B-Tree Index thay vì quét toàn bộ bảng (Full Table Scan).

### B. Tối ưu Code Structure (Phase 2)

- Khởi tạo Type `TGetAllOptions` độc lập.
- Trích xuất toàn bộ 70 dòng code khởi tạo điều kiện vào một private helper function: `private buildGetAllFilters(options?: TGetAllOptions): any[]`.
- Gọi hàm này từ bên trong `getAll`.
- **Kết quả:** Hàm `getAll` đã lấy lại được sự trong sáng của một DB Query (chỉ còn khoảng 15 dòng xử lý query và cursor pagination), hoàn toàn tuân thủ tiêu chuẩn Clean Code của Fat Service.

Tính năng đã sẵn sàng để kiểm thử.
