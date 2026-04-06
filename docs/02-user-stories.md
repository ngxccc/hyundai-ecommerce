# 📖 Product Requirements & User Stories (MoSCoW)

Dự án áp dụng phương pháp **MoSCoW** để quản lý scope, tập trung vào luồng giao dịch B2B (Heavy Logistics) thay vì B2C thông thường.

---

## 🔴 M - MUST HAVE

### 📍 US-M01: Lọc sâu thông số kỹ thuật (Product Discovery)

- **Epic:** Product Management
- **Narrative:**
  - **As a:** Chủ xưởng sản xuất.
  - **I want to:** Lọc danh sách máy phát điện theo công suất (> 500 kVA), số pha (3 pha) và loại nhiên liệu (Diesel).
  - **So that:** Tìm chính xác con máy gánh được hệ thống điện của xưởng mà không cần đọc từng mô tả.
- **✅ Acceptance Criteria:**
  - **Given:** Database (PostgreSQL) có cột `specs` dạng JSONB chứa các key tương ứng.
  - **When:** Khách hàng chọn các filter trên UI và ấn "Lọc".
  - **Then:** Hệ thống (Drizzle ORM) trả về đúng danh sách sản phẩm, nếu không có máy nào khớp thì hiển thị UI "Không tìm thấy sản phẩm phù hợp".

### 📍 US-M02: Yêu cầu báo giá thủ công (Request Quote Flow)

- **Epic:** Checkout & Heavy Logistics
- **Narrative:**
  - **As a:** Khách hàng doanh nghiệp.
  - **I want to:** Bấm nút "Yêu cầu báo giá chi tiết" cho con máy 2 tỷ và điền form thông tin.
  - **So that:** Hệ thống ghi nhận nhu cầu thay vì bắt tôi quẹt thẻ 2 tỷ ngay trên web.
- **✅ Acceptance Criteria:**
  - **Given:** Giỏ hàng có chứa máy phát điện công nghiệp (phân loại: Heavy Duty).
  - **When:** User ấn "Yêu cầu báo giá".
  - **Then:** Hệ thống tạo record trong bảng `orders` với status `PENDING_REVIEW` và gửi email thông báo cho Admin.

### 📍 US-M03: Cập nhật phí vận chuyển (FSM Admin Core)

- **Epic:** CMS Admin
- **Narrative:**
  - **As a:** Admin cửa hàng.
  - **I want to:** Thêm phí cẩu trục/vận chuyển vào đơn báo giá và chuyển trạng thái sang `PRICE_UPDATED`.
  - **So that:** Chốt tổng tiền cuối cùng và tự động gửi link thanh toán cho khách.
- **✅ Acceptance Criteria:**
  - **Given:** Một báo giá đang ở trạng thái `PENDING_REVIEW`.
  - **When:** Admin nhập số tiền ship (VD: 5,000,000 VNĐ) vào bảng `shipping_bids` và bấm "Chốt giá".
  - **Then:** Database chạy transaction: cập nhật tổng tiền, đổi status -> `PRICE_UPDATED`, và gen ra một unique payment URL gửi cho khách.

### 📍 US-M04: Thanh toán đồng thời (Concurrency Lock) - Máy Clearance Sale

- **Epic:** Order & Payment Management
- **Narrative:**
  - **As a:** Khách hàng doanh nghiệp.
  - **I want to:** Mua thành công chiếc máy xả kho giảm giá sâu (còn 1 chiếc).
  - **So that:** Không bị trừ tiền oan qua VNPay nếu người khác đã mua mất.
- **✅ Acceptance Criteria:**
  - **Given:** Tồn kho (stock) của máy là 1. Khách A đã bấm thanh toán và đang ở trang nhập thẻ VNPay (kho đã bị lock bằng Row-level lock / Redis).
  - **When:** Cùng lúc đó, Khách B cũng ấn nút "Mua ngay".
  - **Then:** Hệ thống check trạng thái lock, lập tức trả về lỗi HTTP 409 Conflict và hiển thị UI: "Máy đang được giao dịch, vui lòng thử lại sau 15 phút".

### 📍 US-M05: Nền tảng Xác thực (System Foundation)

- **Epic:** Authentication & Authorization
- **Narrative:**
  - **As a:** Khách hàng Đại lý / Admin.
  - **I want to:** Đăng nhập, đăng xuất và khôi phục mật khẩu.
  - **So that:** Bảo mật thông tin các tờ trình báo giá và truy cập đúng quyền hạn (RBAC).
- **✅ Acceptance Criteria:**
  - **Given:** User chưa đăng nhập.
  - **When:** User nhập sai mật khẩu quá 5 lần.
  - **Then:** Hệ thống khóa tài khoản 15 phút (Rate Limiting) để chống Brute-force attack. (Happy path: Nhập đúng -> Cấp JWT / Session Cookie NextAuth).

### 📍 US-M06: Quản lý Sản Phẩm Lõi (Product CRUD)

- **Epic:** CMS Admin
- **Narrative:**
  - **As a:** Admin hệ thống.
  - **I want to:** Thêm, sửa, xóa (CRUD) máy phát điện, đặc biệt là nhập file ảnh và điền các thông số kỹ thuật (Specs) vào một form chuẩn.
  - **So that:** Có dữ liệu hiển thị lên Storefront cho khách hàng tìm kiếm.
- **✅ Acceptance Criteria:**
  - **Given:** Admin đã đăng nhập vào route `/admin`.
  - **When:** Admin điền tên máy, giá tiền, upload ảnh (lên Cloudinary) và nhập thông số (Công suất, Pha) rồi bấm "Lưu".
  - **Then:** Hệ thống insert thành công vào bảng `products` (với thông số chui vào cột JSONB) và hiển thị toast "Thêm thành công".

### 📍 US-M07: Giỏ hàng & Thanh toán chuẩn (Standard Cart)

- **Epic:** Checkout & Heavy Logistics
- **Narrative:**
  - **As a:** Người mua cá nhân (mua máy dân dụng rẻ tiền).
  - **I want to:** Thêm máy phát điện loại nhỏ vào giỏ hàng và thanh toán full 100% thẳng qua cổng VNPay.
  - **So that:** Mua đứt sản phẩm mà không cần đợi đàm phán báo giá (Request Quote).
- **✅ Acceptance Criteria:**
  - **Given:** User bấm "Thêm vào giỏ" ở 1 con máy có cờ `is_quote_only = false`.
  - **When:** User vào trang Giỏ hàng (Zustand state), điền địa chỉ và bấm "Thanh toán VNPay".
  - **Then:** Hệ thống tạo bảng `orders` với status `PENDING_PAYMENT`, sinh link VNPay ngay lập tức. User thanh toán xong -> status chuyển thành `FULL_PAID`.

---

## 🟡 S - SHOULD HAVE

### 📍 US-S01: AI DAG Chatbot (Tool Calling)

- **Epic:** AI Integrations
- **Narrative:** Khách hàng nhập "Xưởng 500m2 dùng 10 máy lạnh" -> hệ thống tự gợi ý máy phát.
- **✅ Acceptance Criteria:**
  - **Given:** Chatbot UI đang mở.
  - **When:** User gửi prompt kỹ thuật.
  - **Then:** LangGraph nhận diện ý định (Intention Routing), gọi tool chọc vào DB lấy data máy phát điện và streaming text trả về cho User.

### 📍 US-S02: Thanh toán Cọc (Deposit Gateway)

- **Epic:** Order & Payment Management
- **Narrative:** Người mua cá nhân thanh toán cọc 30% qua VNPay để giữ hàng.
- **✅ Acceptance Criteria:**
  - **When:** Khách hàng thanh toán thành công 30% trên VNPay và VNPay bắn webhook về hệ thống.
  - **Then:** Trạng thái đơn hàng chuyển thành `DEPOSIT_PAID` và kích hoạt trừ tồn kho cứng trong DB.

### 📍 US-S03: Cronjob Hủy Báo Giá (Expired Quote)

- **Epic:** Background Processing
- **Narrative:** Hệ thống tự động quét và hủy các báo giá `PRICE_UPDATED` đã tồn tại quá 48 tiếng.
- **✅ Acceptance Criteria:**
  - **When:** Worker (cronjob) chạy mỗi giờ.
  - **Then:** Tìm các đơn quá hạn, chuyển sang `EXPIRED`, giải phóng lock tồn kho (nếu có) và gửi email thông báo.

### 📍 US-S04: Lịch sử Báo giá (User Portal)

- **Epic:** Customer Account
- **Narrative:**
  - **As a:** Khách hàng doanh nghiệp đã đăng nhập.
  - **I want to:** Truy cập vào trang "Lịch sử báo giá", xem lại file PDF hoặc xem trạng thái báo giá hiện tại (Đang chờ, Đã có giá, Hết hạn).
  - **So that:** Chủ động theo dõi tiến độ mua hàng mà không cần gọi điện hỏi Admin.
- **✅ Acceptance Criteria:**
  - **Given:** User đang ở trang `/dashboard/quotes`.
  - **When:** Component render.
  - **Then:** FE gọi API fetch data từ DB (có filter `where eq(orders.userId, currentUserId)`), trả về list báo giá, nếu status = `PRICE_UPDATED` thì hiện kèm nút "Thanh toán cọc".

### 📍 US-S05: So sánh & Tải Datasheet (Compare & Datasheet)

- **Epic:** Product Discovery & UX
- **Narrative:**
  - **As a:** Kỹ sư vận hành / Thầu xây dựng.
  - **I want to:** Chọn tối đa 3 máy phát điện để xem bảng so sánh thông số (side-by-side) và tải file PDF datasheet gốc của nhà sản xuất.
  - **So that:** Dễ dàng đối chiếu các thông số kỹ thuật ngách (VD: Mức tiêu hao nhiên liệu ở 75% tải) và có tài liệu trình lên chủ đầu tư chốt phương án.
- **✅ Acceptance Criteria:**
  - **Given:** User đang ở trang danh sách sản phẩm (Product Listing) hoặc trang chi tiết sản phẩm.
  - **When:** User bấm nút "Thêm vào so sánh" cho 2-3 con máy khác nhau, sau đó bấm "Xem so sánh".
  - **Then:**
    1. Hệ thống (FE) trích xuất dữ liệu từ cột JSONB `specs` của các máy này, map chúng lên một bảng UI dạng lưới (Grid), highlight những thông số khác biệt.
    2. Bất cứ khi nào user ấn "Tải Datasheet", hệ thống trả về link file PDF (được lưu trữ trên AWS S3 / Cloudinary) để user download thẳng về máy.

---

## 🔵 C - COULD HAVE

- **📍 US-C01 (Dynamic Heavy Logistics):** Tính ship tự động bằng Google Maps API x Trọng lượng máy.
- **📍 US-C02 (Split Payments Dashboard):** Giao diện quản lý thanh toán chia đợt (30% - 50% - 20%).
- **📍 US-C03 (AI PDF Generator):** Admin chốt đơn -> hệ thống auto gen file PDF báo giá có mộc đỏ gửi qua email.
- **📍 US-C04 (Quản lý Data Linh Hoạt):** Dynamic Form CMS để Admin tự thêm trường thuộc tính mới (VD: Diện tích pin mặt trời) vào JSONB mà không cần Dev.

---

## ⚫ W - WON'T HAVE

- **🚫 US-W01:** KHÔNG LÀM Sàn giao dịch C2C.
- **🚫 US-W02:** KHÔNG LÀM Mobile App (iOS/Android Native).
- **🚫 US-W03:** KHÔNG LÀM tích hợp thanh toán Crypto/Bitcoin.
