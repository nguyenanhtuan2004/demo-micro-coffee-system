import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles, RolesGuard } from '../guards/roles.guard';
import { GatewayService } from './gateway.service';

@Controller('api')
@UseGuards(RolesGuard)
export class GatewayController {
  constructor(private gateway: GatewayService) {}

  @Post('auth/login')
  login(@Body() body: any) {
    return this.gateway.forward(this.gateway.authUrl, 'POST', '/auth/login', body);
  }

  @Get('users')
  @Roles('admin')
  getUsers(@Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.authUrl, 'GET', '/users', undefined, {
      'x-user-role': req.user?.role,
      'x-user-id': req.user?.sub,
    });
  }

  @Post('users')
  @Roles('admin')
  createUser(@Body() body: any, @Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.authUrl, 'POST', '/users', body, {
      'x-user-role': req.user?.role,
      'x-user-id': req.user?.sub,
    });
  }

  @Delete('users/:id')
  @Roles('admin')
  deleteUser(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.authUrl, 'DELETE', `/users/${id}`, undefined, {
      'x-user-role': req.user?.role,
      'x-user-id': req.user?.sub,
    });
  }

  @Get('products')
  getProducts() {
    return this.gateway.forward(this.gateway.productUrl, 'GET', '/products');
  }

  @Get('products/admin')
  @Roles('admin')
  getAdminProducts() {
    return this.gateway.forward(this.gateway.productUrl, 'GET', '/products/admin');
  }

  @Get('products/categories')
  getProductCategories() {
    return this.gateway.forward(this.gateway.productUrl, 'GET', '/products/categories');
  }

  @Post('products')
  @Roles('admin')
  createProduct(@Body() body: any) {
    return this.gateway.forward(this.gateway.productUrl, 'POST', '/products', body);
  }

  @Patch('products/:productId')
  @Roles('admin')
  updateProduct(@Param('productId') productId: string, @Body() body: any) {
    return this.gateway.forward(this.gateway.productUrl, 'PATCH', `/products/${productId}`, body);
  }

  @Post('orders')
  createOrder(@Body() body: any, @Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.orderUrl, 'POST', '/orders', body, {
      'x-user-id': req.user?.sub,
      'x-user-email': req.user?.email,
      'x-user-role': req.user?.role,
    });
  }

  @Get('orders')
  getOrders(@Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.orderUrl, 'GET', '/orders', undefined, {
      'x-user-id': req.user?.sub,
      'x-user-role': req.user?.role,
    });
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.orderUrl, 'GET', `/orders/${id}`, undefined, {
      'x-user-id': req.user?.sub,
      'x-user-role': req.user?.role,
    });
  }

  @Patch('orders/:id/complete')
  completeOrder(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.gateway.forward(this.gateway.orderUrl, 'PATCH', `/orders/${id}/complete`, undefined, {
      'x-user-id': req.user?.sub,
      'x-user-role': req.user?.role,
    });
  }

  @Get('inventory')
  getInventory() {
    return this.gateway.forward(this.gateway.inventoryUrl, 'GET', '/inventory');
  }

  @Get('inventory/low-stock')
  getLowStock() {
    return this.gateway.forward(this.gateway.inventoryUrl, 'GET', '/inventory/low-stock');
  }

  @Patch('inventory/:productId/restock')
  @Roles('admin')
  restockInventory(
    @Param('productId') productId: string,
    @Body() body: any,
    @Req() req: Request & { user: any },
  ) {
    return this.gateway.forward(this.gateway.inventoryUrl, 'PATCH', `/inventory/${productId}/restock`, body, {
      'x-user-role': req.user?.role,
    });
  }

  @Get('analytics')
  @Roles('admin')
  getAnalytics() {
    return this.gateway.forward(this.gateway.analyticsUrl, 'GET', '/analytics');
  }
}
