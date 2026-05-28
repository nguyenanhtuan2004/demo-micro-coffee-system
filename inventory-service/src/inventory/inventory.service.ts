import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { RestockDto } from './dto/restock.dto';

const ROUTING = {
  ORDER_CREATED: 'order.created',
  INVENTORY_RESERVED: 'inventory.reserved',
  INVENTORY_FAILED: 'inventory.failed',
  STOCK_IMPORTED: 'inventory.stock_imported',
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
    setTimeout(() => this.subscribeToOrders(), 5000);
  }

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
    this.logger.log(`Kiểm tra tồn kho cho đơn ${event.orderId}`);

    const stockChecks = await Promise.all(
      event.items.map(async (item) => {
        const stock = await this.prisma.inventory.findUnique({
          where: { productId: item.productId },
        });

        return {
          item,
          stock,
          sufficient: Boolean(stock && stock.quantity >= item.quantity),
        };
      }),
    );

    const failed = stockChecks.find((check) => !check.sufficient);

    if (failed) {
      const reason = failed.stock
        ? `Không đủ tồn kho cho "${failed.item.name}": cần ${failed.item.quantity}, hiện có ${failed.stock.quantity}`
        : `Không tìm thấy "${failed.item.name}" trong tồn kho`;

      this.logger.warn(`Tồn kho không đủ cho đơn ${event.orderId}: ${reason}`);
      await this.mq.publish(ROUTING.INVENTORY_FAILED, { orderId: event.orderId, reason });
      return;
    }

    for (const { item } of stockChecks) {
      await this.prisma.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    this.logger.log(`Đã trừ kho cho đơn ${event.orderId}`);
    await this.mq.publish(ROUTING.INVENTORY_RESERVED, { orderId: event.orderId });
  }

  findAll() {
    return this.prisma.inventory.findMany({ orderBy: { name: 'asc' } });
  }

  async findLowStock() {
    const items = await this.prisma.inventory.findMany({ orderBy: { quantity: 'asc' } });
    return items.filter((item) => item.quantity <= item.lowStockThreshold);
  }

  async restock(productId: string, dto: RestockDto) {
    const item = await this.prisma.inventory.findUnique({ where: { productId } });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy món "${productId}" trong tồn kho`);
    }

    const operation = dto.operation ?? 'add';

    const updated = await this.prisma.inventory.update({
      where: { productId },
      data: {
        quantity: operation === 'set' ? dto.quantity : { increment: dto.quantity },
      },
    });

    await this.mq.publish(ROUTING.STOCK_IMPORTED, {
      productId: updated.productId,
      name: updated.name,
      quantity: dto.quantity,
      operation,
      currentQuantity: updated.quantity,
    });

    this.logger.log(`Restocked [${operation}] "${item.name}": ${item.quantity} -> ${updated.quantity}`);
    return updated;
  }
}
