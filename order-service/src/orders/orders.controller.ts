import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orders.createOrder(dto, userId || 'anonymous');
  }

  @Get()
  findAll() {
    return this.orders.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orders.findOne(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
