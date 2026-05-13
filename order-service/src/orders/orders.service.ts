import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { CreateOrderDto } from './dto/create-order.dto';

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  INVENTORY_RESERVED: 'inventory.reserved',
  INVENTORY_FAILED: 'inventory.failed',
};

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private mq: RabbitMQService,
  ) {}

  // ── Saga Step 1: Subscribe to Inventory replies ───────────────────────

  async onModuleInit() {
    // Wait briefly for RabbitMQ to be ready before subscribing
    setTimeout(() => this.subscribeToInventoryEvents(), 5000);
  }

  private async subscribeToInventoryEvents() {
    await this.mq.subscribe(
      'order-service-queue',
      [ROUTING_KEYS.INVENTORY_RESERVED, ROUTING_KEYS.INVENTORY_FAILED],
      async (data, routingKey) => {
        if (routingKey === ROUTING_KEYS.INVENTORY_RESERVED) {
          await this.handleInventoryReserved(data);
        } else if (routingKey === ROUTING_KEYS.INVENTORY_FAILED) {
          await this.handleInventoryFailed(data);
        }
      },
    );
  }

  // ── Create Order (Saga Step 1: Publish OrderCreated) ─────────────────

  async createOrder(dto: CreateOrderDto, customerId: string) {
    const totalPrice = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        customerId,
        totalPrice,
        status: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Saga Step 1: Publish OrderCreated event → triggers Inventory Service
    await this.mq.publish(ROUTING_KEYS.ORDER_CREATED, {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalPrice: order.totalPrice,
    });

    this.logger.log(`✅ Order ${order.id} created (PENDING) — awaiting inventory check`);
    return order;
  }

  // ── Saga Step 3a: Stock OK → CONFIRMED ────────────────────────────────

  private async handleInventoryReserved(data: { orderId: string }) {
    const order = await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });

    // Publish OrderConfirmed → triggers Analytics Service
    await this.mq.publish(ROUTING_KEYS.ORDER_CONFIRMED, {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalPrice: order.totalPrice,
    });

    this.logger.log(`✅ Order ${data.orderId} → CONFIRMED`);
  }

  // ── Saga Step 3b: Stock insufficient → REJECTED ───────────────────────

  private async handleInventoryFailed(data: {
    orderId: string;
    reason: string;
  }) {
    await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'REJECTED' },
    });

    this.logger.warn(`❌ Order ${data.orderId} → REJECTED: ${data.reason}`);
  }

  // ── Queries ───────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }
}
