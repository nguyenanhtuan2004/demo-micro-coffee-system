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
import { GatewayService } from './gateway.service';
import { RolesGuard, Roles } from '../guards/roles.guard';

@Controller('api')
@UseGuards(RolesGuard)
export class GatewayController {
  constructor(private gateway: GatewayService) {}

  // ── Auth ──────────────────────────────────────────────────────────────

  @Post('auth/login')
  login(@Body() body: any) {
    return this.gateway.forward(this.gateway.authUrl, 'POST', '/auth/login', body);
  }

  // ── Staff Management (admin only) ─────────────────────────────────────

  @Get('users')
  @Roles('admin')
  getUsers(@Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.authUrl,
      'GET',
      '/users',
      undefined,
      { 'x-user-role': req.user?.role, 'x-user-id': req.user?.sub },
    );
  }

  @Post('users')
  @Roles('admin')
  createUser(@Body() body: any, @Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.authUrl,
      'POST',
      '/users',
      body,
      { 'x-user-role': req.user?.role, 'x-user-id': req.user?.sub },
    );
  }

  @Delete('users/:id')
  @Roles('admin')
  deleteUser(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.authUrl,
      'DELETE',
      `/users/${id}`,
      undefined,
      { 'x-user-role': req.user?.role, 'x-user-id': req.user?.sub },
    );
  }

  // ── Orders ────────────────────────────────────────────────────────────

  @Post('orders')
  createOrder(@Body() body: any, @Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.orderUrl, 'POST', '/orders', body,
      { 'x-user-id': req.user?.sub, 'x-user-email': req.user?.email, 'x-user-role': req.user?.role },
    );
  }

  @Get('orders')
  getOrders(@Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.orderUrl, 'GET', '/orders', undefined,
      { 'x-user-id': req.user?.sub, 'x-user-role': req.user?.role },
    );
  }

  // ── Inventory ─────────────────────────────────────────────────────────

  @Get('inventory')
  getInventory() {
    return this.gateway.forward(this.gateway.inventoryUrl, 'GET', '/inventory');
  }

  @Patch('inventory/:productId/restock')
  @Roles('admin')
  restockInventory(
    @Param('productId') productId: string,
    @Body() body: any,
    @Req() req: Request & { user: any },
  ) {
    return this.gateway.forward(
      this.gateway.inventoryUrl, 'PATCH', `/inventory/${productId}/restock`,
      body, { 'x-user-role': req.user?.role },
    );
  }

  // ── Analytics (admin only) ────────────────────────────────────────────

  @Get('analytics')
  @Roles('admin')
  getAnalytics() {
    return this.gateway.forward(this.gateway.analyticsUrl, 'GET', '/analytics');
  }
}
