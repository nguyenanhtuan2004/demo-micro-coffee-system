# Ghi chú kiến trúc

## Kiến trúc MVP cuối cùng

- API Gateway là điểm vào duy nhất cho giao diện.
- Mỗi service sở hữu database PostgreSQL riêng.
- RabbitMQ dùng cho giao tiếp bất đồng bộ bằng event.
- Order Service và Inventory Service triển khai Saga theo kiểu choreography.
- Analytics Service dùng CQRS bằng cách duy trì mô hình đọc từ sự kiện.

## Lý do scope phù hợp

Hệ thống đủ thực tế để demo nghiệp vụ bán hàng quán cà phê, nhưng không đưa vào các phần quá nặng cho đồ án như Kubernetes, distributed tracing, payment gateway hoặc outbox pattern.

## Saga

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant O as Order Service
  participant P as Product Service
  participant MQ as RabbitMQ
  participant I as Inventory Service
  participant A as Analytics Service

  FE->>O: Tạo đơn hàng
  O->>P: Lấy giá món
  O->>O: Lưu đơn PENDING
  O->>MQ: order.created
  MQ->>I: order.created
  I->>I: Kiểm tra và trừ kho
  alt Đủ tồn kho
    I->>MQ: inventory.reserved
    MQ->>O: inventory.reserved
    O->>O: Cập nhật CONFIRMED
    O->>MQ: order.confirmed
    MQ->>A: order.confirmed
  else Thiếu tồn kho
    I->>MQ: inventory.failed
    MQ->>O: inventory.failed
    O->>O: Cập nhật REJECTED
    O->>MQ: order.rejected
    MQ->>A: order.rejected
  end
```

## CQRS

Order Service là mô hình ghi cho đơn hàng. Analytics Service là mô hình đọc riêng, được cập nhật bằng sự kiện RabbitMQ. Vì vậy Analytics không phụ thuộc trực tiếp vào database của Order Service.
