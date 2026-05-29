# POST-MORTEM: DrizzleQueryError on Specs Filter

Date: 29-05-2026
Feature: `products-manage`

## 1. Tóm tắt Sự cố (Incident Summary)

- **Hiện tượng**: Khi người dùng nhập một giá trị vào ô lọc `Min Power` hoặc `Voltage` rồi xóa đi (để trống), hoặc có dữ liệu cũ bất thường, API bị crash trả về lỗi `Runtime DrizzleQueryError`.
- **Hệ quả**: Trang quản lý sản phẩm không thể lấy được danh sách sản phẩm, làm gián đoạn tính năng xem và tìm kiếm.

## 2. Phân tích Nguyên nhân Gốc (Root Cause Analysis)

Sự cố xảy ra do 2 nguyên nhân cộng hưởng (Chuỗi lỗi DOMino):

1. **Lỗi Frontend (Thiếu chặt chẽ khi parse URL):**
   Khi ô input bị xóa trống, biến trên URL truyền lên là chuỗi rỗng `""`. Tại `page.tsx`, hệ thống dùng hàm `Number("")` để ép kiểu. Trong Javascript, `Number("")` trả về `0`. Do đó, tham số `0` bị truyền xuống Database thay vì bị loại bỏ (`undefined`).
2. **Lỗi Backend (PostgreSQL Casting Panic):**
   Cột `specs` sử dụng kiểu dữ liệu `JSONB`. Khi Drizzle chạy câu truy vấn chứa ép kiểu trực tiếp `(specs->>'power')::numeric`, PostgreSQL sẽ đánh giá tất cả các row. Nếu có bất kỳ dòng dữ liệu cũ nào chứa `power: ""` hoặc `power: "N/A"`, PostgreSQL sẽ báo lỗi `invalid input syntax for type numeric` và đánh sập toàn bộ truy vấn ngay lập tức thay vì bỏ qua row đó.

## 3. Cách giải quyết (Resolution)

- **Tầng Frontend (`page.tsx`)**: Đổi logic parse sang kiểm tra độ dài chuỗi (`truthy`). Nếu chuỗi rỗng, ngầm định là `undefined`, tránh truyền số `0` giả tạo xuống DB.
- **Tầng Backend (`product.service.ts`)**: Thay thế lệnh ép kiểu lỏng lẻo bằng mệnh đề `CASE` an toàn của PostgreSQL, kết hợp đối sánh Regex (`~ '^\s*\d+(\.\d+)?\s*$'`). Query chỉ ép kiểu nếu chuỗi chắc chắn là số, ngược lại trả về `NULL`.

## 4. Bài học kinh nghiệm (Lessons Learned)

- Không bao giờ được tin tưởng dữ liệu lưu bên trong cột `JSONB` hoàn toàn sạch, kể cả khi hiện tại có Zod bảo vệ ở đầu vào (dữ liệu rác có thể tồn tại từ trước hoặc do bypass seed data).
- Bắt buộc phải sử dụng `Regex` hoặc hàm an toàn (như `NULLIF`) trước khi dùng toán tử ép kiểu `::numeric` hoặc `::int` trong raw SQL.
- Khi làm việc với `searchParams` của Next.js, luôn cẩn thận với chuỗi rỗng `""` khi xử lý số liệu (Number parsing).
