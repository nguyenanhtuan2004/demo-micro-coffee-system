import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Headers('x-user-id') userId: string) {
    return this.orders.createOrder(dto, userId || 'anonymous');
  }

  @Get()
  findAll() {
    return this.orders.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orders.findOne(id);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.orders.completeOrder(id);
  }
}
