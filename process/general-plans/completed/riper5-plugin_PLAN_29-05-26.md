# PLAN: RIPER-5 Antigravity Plugin

Date: 29-05-2026

## 1. Context

Antigravity AI có xu hướng mặc định lưu các tệp kế hoạch (`implementation_plan.md`), task list (`task.md`), và báo cáo (`walkthrough.md`) vào thư mục Artifact ẩn của hệ thống (`~/.gemini/antigravity-cli/brain/...`). Để ép buộc AI (và bất kỳ agent nào chạy qua Antigravity) tuân thủ tuyệt đối cấu trúc thư mục của RIPER-5 (`process/general-plans/`), chúng ta cần xây dựng một Antigravity Plugin để tiêm (inject) luật toàn cục vào hệ thống.

## 2. Đề xuất Thay đổi (Proposed Changes)

### Tạo thư mục Local Plugin (`process/riper5-plugin`)

- **[NEW] `process/riper5-plugin/plugin.json`**: Khai báo package name (`riper5-strict-mode`) và version.
- **[NEW] `process/riper5-plugin/rules/strict-paths.md`**: File luật (Rule). Nội dung sẽ ghi đè hệ thống:
  - Cấm sử dụng thư mục `<appDataDir>` để tạo Artifacts.
  - Ép buộc Plan phải lưu tại `process/general-plans/active/`.
  - Ép buộc Walkthrough/Report phải lưu tại `process/general-plans/reports/`.
  - Ép buộc tuân thủ tiền tố tên file `[feature]_PLAN_[date].md`.

### Cài đặt Plugin

- Sử dụng Terminal để chạy lệnh:
  `agy plugin install /home/ngxc/workspace/fullstack/hyundai-ecommerce/process/riper5-plugin`
- Plugin sẽ được nạp thẳng vào `~/.gemini/antigravity-cli/plugins/` và có tác dụng trên mọi cuộc hội thoại (conversation) mới.

## 3. Câu hỏi mở (User Review Required)

1. Tôi sẽ tiến hành tạo plugin tại folder local là `process/riper5-plugin` rồi cài nó. Bạn có đồng ý với tên plugin `riper5-strict-mode` này không?
   - OK
2. Ngoài việc ép đường dẫn lưu file, bạn có muốn plugin này chứa luôn kỹ năng (skills) hoặc cảnh báo gì khác cho agent không, hay tập trung giải quyết triệt để lỗi ghi nhầm file thôi?
   - Chỉ cần ép luôn tuân thủ RIPER5 là được
