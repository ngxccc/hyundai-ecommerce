# 🗄️ Database Schema & ERD

Dự án sử dụng **PostgreSQL (Neon Serverless)** làm hệ quản trị CSDL, giao tiếp thông qua **Drizzle ORM**. Thiết kế dưới đây tập trung vào luồng nghiệp vụ B2B lõi, giải quyết bài toán Đa kho (Multi-warehouse) và quản lý thông số kỹ thuật phức tạp của thiết bị công nghiệp.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  %% RELATIONSHIPS
  USERS ||--o{ ORDERS : "places"
  PRODUCTS ||--o{ ORDER_ITEMS : "included in"
  ORDERS ||--|{ ORDER_ITEMS : "contains"
  ORDERS ||--o{ SHIPPING_BIDS : "receives bids"
  WAREHOUSES ||--o{ INVENTORY : "stores"
  PRODUCTS ||--o{ INVENTORY : "stocked as"

  %% ENTITIES (Thực thể)
  USERS {
    uuid id PK
    string email UK
    string password_hash
    string role "enum: admin, dealer, customer"
    timestamp created_at
    timestamp updated_at
  }

  PRODUCTS {
    uuid id PK
    string slug UK
    string name
    decimal base_price
    jsonb specs "Lưu Công suất, Pha, Nhiên liệu..."
    int total_stock_cache "Tổng tồn kho (Cache để tối ưu Read)"
    boolean is_quote_only
    timestamp created_at
    timestamp updated_at
  }

  WAREHOUSES {
    uuid id PK
    string name "VD: Tổng kho Hà Nội"
    string address "Địa chỉ dùng để map tính ship"
    boolean is_active
  }

  INVENTORY {
    uuid id PK
    uuid product_id FK
    uuid warehouse_id FK
    int quantity "Số lượng thực tế tại kho"
    timestamp updated_at
  }

  ORDERS {
    uuid id PK
    uuid user_id FK
    string status
    decimal shipping_fee
    decimal total_amount
    timestamp created_at
    timestamp updated_at
  }

  ORDER_ITEMS {
    uuid id PK
    uuid order_id FK
    uuid product_id FK
    int quantity
    decimal unit_price "Snapshot giá tại thời điểm mua"
  }

  SHIPPING_BIDS {
    uuid id PK
    uuid order_id FK
    string vendor_name "VD: Viettel Post, Xe cẩu"
    decimal quoted_price
    text internal_notes
    boolean is_selected
    timestamp created_at
  }
```

---

## 2. Các Quyết định Thiết kế Lõi (Key Design Decisions)

### 2.1. Phép màu JSONB cho Thông số kỹ thuật (EAV Alternative)

Thay vì sử dụng mô hình EAV (Entity-Attribute-Value) cồng kềnh với hàng chục bảng trung gian để lưu các thuộc tính động của máy phát điện (Công suất, Độ ồn, Số pha), hệ thống sử dụng cột `specs` dạng `JSONB`. Điều này giúp:

- Giảm số lượng phép `JOIN` khi truy vấn.
- Tận dụng sức mạnh Index của PostgreSQL trên JSONB để query siêu tốc.

### 2.2. Giải quyết bài toán Đa kho (Multi-Warehouse Inventory)

Tuyệt đối không hardcode các cột như `stock_hn` hay `stock_hcm`. Hệ thống tách biệt thành bảng `WAREHOUSES` và bảng trung gian `INVENTORY`. Cột `total_stock_cache` trong bảng `PRODUCTS` được sử dụng như một Denormalized Field để giảm tải cho DB khi User cuộn trang danh sách sản phẩm.

### 2.3. Bidding System (Hệ thống đàm phán vận chuyển)

Đối với hàng siêu trọng, phí ship thay đổi theo từng đơn. Bảng `SHIPPING_BIDS` đóng vai trò là một "Shadow Entity" (Sổ nháp) để Admin ghi nhận báo giá từ nhiều nhà xe. Chỉ khi Admin bấm chọn 1 Bid, Database Transaction mới được kích hoạt để copy `quoted_price` sang cột `shipping_fee` của bảng `ORDERS` gốc, đảm bảo tính toàn vẹn dữ liệu tài chính.
