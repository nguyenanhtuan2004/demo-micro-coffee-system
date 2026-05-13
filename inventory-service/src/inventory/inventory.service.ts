import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';

const ROUTING = {
  ORDER_CREATED: 'order.created',
  INVENTORY_RESERVED: 'inventory.reserved',
  INVENTORY_FAILED: 'inventory.failed',
};

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalPrice: number;
}

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private prisma: PrismaService,
    private mq: RabbitMQService,
  ) {}

  async onModuleInit() {
    // Give RabbitMQ time to connect before subscribing
    setTimeout(() => this.subscribeToOrders(), 5000);
  }

  // ── Saga Step 2: Listen for new orders, validate and reserve stock ────

  private async subscribeToOrders() {
    await this.mq.subscribe(
      'inventory-service-queue',
      [ROUTING.ORDER_CREATED],
      async (data: OrderCreatedEvent) => {
        await this.handleOrderCreated(data);
      },
    );
  }

  private async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`Processing inventory for order ${event.orderId}`);

    // Validate all items have sufficient stock
    const stockChecks = await Promise.all(
      event.items.map(async (item) => {
        const stock = await this.prisma.inventory.findUnique({
          where: { productId: item.productId },
        });
        return {
          item,
          stock,
          sufficient: stock && stock.quantity >= item.quantity,
        };
      }),
    );

    const failed = stockChecks.find((c) => !c.sufficient);

    if (failed) {
      // Saga compensate: publish InventoryFailed
      const reason = failed.stock
        ? `Insufficient stock for "${failed.item.name}": requested ${failed.item.quantity}, available ${failed.stock.quantity}`
        : `Product "${failed.item.name}" not found in inventory`;

      this.logger.warn(`❌ Inventory failed for order ${event.orderId}: ${reason}`);

      await this.mq.publish(ROUTING.INVENTORY_FAILED, {
        orderId: event.orderId,
        reason,
      });
      return;
    }

    // Deduct stock for each item
    for (const { item } of stockChecks) {
      await this.prisma.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    this.logger.log(`✅ Inventory reserved for order ${event.orderId}`);

    await this.mq.publish(ROUTING.INVENTORY_RESERVED, {
      orderId: event.orderId,
    });
  }

  // ── REST Query ────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.inventory.findMany({ orderBy: { name: 'asc' } });
  }
}
