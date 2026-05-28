import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';

interface OrderConfirmedEvent {
  orderId: string;
  customerId: string;
  totalPrice: number;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface OrderRejectedEvent {
  orderId: string;
  reason: string;
}

interface OrderCompletedEvent {
  orderId: string;
}

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private mq: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.prisma.revenueStats.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', totalOrders: 0, totalRevenue: 0 },
    });

    setTimeout(() => this.subscribeToEvents(), 5000);
  }

  private async subscribeToEvents() {
    await this.mq.subscribe(
      'analytics-service-queue',
      ['order.confirmed', 'order.rejected', 'order.completed'],
      async (data, routingKey) => {
        if (routingKey === 'order.confirmed') {
          await this.handleOrderConfirmed(data);
        } else if (routingKey === 'order.rejected') {
          await this.handleOrderRejected(data);
        } else if (routingKey === 'order.completed') {
          await this.handleOrderCompleted(data);
        }
      },
    );
  }

  private async handleOrderConfirmed(event: OrderConfirmedEvent) {
    this.logger.log(`Updating analytics for confirmed order ${event.orderId}`);

    await this.prisma.revenueStats.update({
      where: { id: 'singleton' },
      data: {
        totalOrders: { increment: 1 },
        totalRevenue: { increment: event.totalPrice },
      },
    });

    for (const item of event.items) {
      await this.prisma.productStats.upsert({
        where: { productId: item.productId },
        update: {
          totalSold: { increment: item.quantity },
          totalRevenue: { increment: item.price * item.quantity },
        },
        create: {
          productId: item.productId,
          name: item.name,
          totalSold: item.quantity,
          totalRevenue: item.price * item.quantity,
        },
      });
    }
  }

  private async handleOrderRejected(event: OrderRejectedEvent) {
    this.logger.warn(`Counting rejected order ${event.orderId}: ${event.reason}`);
    await this.prisma.revenueStats.update({
      where: { id: 'singleton' },
      data: { rejectedOrders: { increment: 1 } },
    });
  }

  private async handleOrderCompleted(event: OrderCompletedEvent) {
    this.logger.log(`Counting completed order ${event.orderId}`);
    await this.prisma.revenueStats.update({
      where: { id: 'singleton' },
      data: { completedOrders: { increment: 1 } },
    });
  }

  async getAnalytics() {
    const revenue = await this.prisma.revenueStats.findUnique({
      where: { id: 'singleton' },
    });

    const products = await this.prisma.productStats.findMany({
      orderBy: { totalSold: 'desc' },
    });

    return {
      totalOrders: revenue?.totalOrders ?? 0,
      totalRevenue: revenue?.totalRevenue ?? 0,
      rejectedOrders: revenue?.rejectedOrders ?? 0,
      completedOrders: revenue?.completedOrders ?? 0,
      topProducts: products.slice(0, 5),
      allProducts: products,
    };
  }
}
