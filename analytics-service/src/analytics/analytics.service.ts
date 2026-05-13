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

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private mq: RabbitMQService,
  ) {}

  async onModuleInit() {
    // Seed the singleton revenue stats row if not exists
    await this.prisma.revenueStats.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', totalOrders: 0, totalRevenue: 0 },
    });

    setTimeout(() => this.subscribeToOrders(), 5000);
  }

  // ── CQRS: consume events to build read model ──────────────────────────

  private async subscribeToOrders() {
    await this.mq.subscribe(
      'analytics-service-queue',
      ['order.confirmed'],
      async (data: OrderConfirmedEvent) => {
        await this.handleOrderConfirmed(data);
      },
    );
  }

  private async handleOrderConfirmed(event: OrderConfirmedEvent) {
    this.logger.log(`📊 Updating analytics for order ${event.orderId}`);

    // Update global revenue stats
    await this.prisma.revenueStats.update({
      where: { id: 'singleton' },
      data: {
        totalOrders: { increment: 1 },
        totalRevenue: { increment: event.totalPrice },
      },
    });

    // Update per-product stats
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

    this.logger.log(`✅ Analytics updated`);
  }

  // ── REST: serve the read model ────────────────────────────────────────

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
      topProducts: products.slice(0, 5),
      allProducts: products,
    };
  }
}
