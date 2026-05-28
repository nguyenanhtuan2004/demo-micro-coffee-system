import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { CreateOrderDto } from './dto/create-order.dto';

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_REJECTED: 'order.rejected',
  ORDER_COMPLETED: 'order.completed',
  INVENTORY_RESERVED: 'inventory.reserved',
  INVENTORY_FAILED: 'inventory.failed',
};

interface ProductDto {
  productId: string;
  name: string;
  price: number;
  active: boolean;
}

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private mq: RabbitMQService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
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

  async createOrder(dto: CreateOrderDto, customerId: string) {
    const normalizedItems = this.mergeDuplicateItems(dto.items);
    const products = await Promise.all(
      normalizedItems.map((item) => this.fetchProduct(item.productId)),
    );

    const orderItems = normalizedItems.map((item) => {
      const product = products.find((p) => p.productId === item.productId);
      if (!product) throw new BadRequestException(`Không tìm thấy món "${item.productId}"`);

      return {
        productId: product.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await this.prisma.order.create({
      data: {
        customerId,
        totalPrice,
        status: 'PENDING',
        items: { create: orderItems },
      },
      include: { items: true },
    });

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

    this.logger.log(`Đơn ${order.id} đã tạo ở trạng thái PENDING và gửi sang tồn kho`);
    return order;
  }

  async completeOrder(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (existing.status !== 'CONFIRMED') {
      throw new BadRequestException('Chỉ đơn CONFIRMED mới có thể hoàn tất');
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: { items: true },
    });

    await this.mq.publish(ROUTING_KEYS.ORDER_COMPLETED, {
      orderId: order.id,
      customerId: order.customerId,
      totalPrice: order.totalPrice,
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });

    return order;
  }

  private async handleInventoryReserved(data: { orderId: string }) {
    const order = await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'CONFIRMED', rejectionReason: null },
      include: { items: true },
    });

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

    this.logger.log(`Đơn ${data.orderId} đã được xác nhận`);
  }

  private async handleInventoryFailed(data: { orderId: string; reason: string }) {
    const order = await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'REJECTED', rejectionReason: data.reason },
      include: { items: true },
    });

    await this.mq.publish(ROUTING_KEYS.ORDER_REJECTED, {
      orderId: order.id,
      customerId: order.customerId,
      totalPrice: order.totalPrice,
      reason: data.reason,
    });

    this.logger.warn(`Đơn ${data.orderId} bị từ chối: ${data.reason}`);
  }

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

  private mergeDuplicateItems(items: CreateOrderDto['items']) {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    }
    return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  }

  private async fetchProduct(productId: string): Promise<ProductDto> {
    const baseUrl = this.config.get<string>('PRODUCT_SERVICE_URL');
    if (!baseUrl) throw new BadRequestException('PRODUCT_SERVICE_URL is not configured');

    const response = await fetch(`${baseUrl}/products/${productId}`);
    if (!response.ok) {
      throw new BadRequestException(`Món "${productId}" đang tạm ẩn hoặc không tồn tại`);
    }

    return response.json();
  }
}
