import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findActive() {
    return this.products.findMany({ activeOnly: true });
  }

  @Get('admin')
  findAllForAdmin() {
    return this.products.findMany({ activeOnly: false });
  }

  @Get('categories')
  categories() {
    return this.products.findCategories();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.products.findOne(productId);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':productId')
  update(@Param('productId') productId: string, @Body() dto: UpdateProductDto) {
    return this.products.update(productId, dto);
  }

  @Patch(':productId/status')
  updateStatus(@Param('productId') productId: string, @Body('active') active: boolean) {
    return this.products.update(productId, { active });
  }
}
