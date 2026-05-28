# Kịch bản demo bảo vệ

1. Mở sơ đồ kiến trúc tổng quan.
2. Đăng nhập bằng `admin@example.com / 123456`.
3. Mở Menu và giải thích Product Service quản lý tên món, giá, danh mục, trạng thái bán.
4. Mở Bán hàng và thêm 2-3 món vào giỏ.
5. Tạo đơn và giải thích phía máy chủ tự tính giá từ Product Service.
6. Cho thấy đơn ở trạng thái `PENDING`, sau đó chuyển sang `CONFIRMED`.
7. Mở Tồn kho và cho thấy số lượng đã giảm.
8. Đánh dấu đơn là `COMPLETED`.
9. Tạo một đơn có số lượng vượt tồn kho.
10. Cho thấy đơn chuyển sang `REJECTED` và có lý do từ chối.
11. Nhập kho cho một món đang tồn thấp.
12. Mở Thống kê và giải thích mô hình đọc CQRS.
13. Mở RabbitMQ Management UI để cho thấy queue/event flow.
14. Mở tài liệu Swagger của Gateway và các service.
15. Kết thúc bằng phần giới hạn và hướng phát triển.
