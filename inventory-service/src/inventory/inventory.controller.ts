import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  ForbiddenException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RestockDto } from './dto/restock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get()
  findAll() {
    return this.inventory.findAll();
  }

  @Patch(':productId/restock')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  restock(
    @Param('productId') productId: string,
    @Body() dto: RestockDto,
    @Headers('x-user-role') role: string,
  ) {
    // Double-check role tại service level (defense in depth)
    if (role !== 'admin') {
      throw new ForbiddenException('Only admin can restock inventory');
    }
    return this.inventory.restock(productId, dto);
  }
}
