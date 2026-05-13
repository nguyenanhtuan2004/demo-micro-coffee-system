import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { GatewayService } from './gateway.service';

@Controller('api')
export class GatewayController {
  constructor(private gateway: GatewayService) {}

  // ── Auth Routes (public) ──────────────────────────────────────────────

  @Post('auth/login')
  login(@Body() body: any) {
    return this.gateway.forward(this.gateway.authUrl, 'POST', '/auth/login', body);
  }

  // ── Order Routes (protected) ──────────────────────────────────────────

  @Post('orders')
  createOrder(@Body() body: any, @Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.orderUrl,
      'POST',
      '/orders',
      body,
      {
        'x-user-id': req.user?.sub,
        'x-user-email': req.user?.email,
      },
    );
  }

  @Get('orders')
  getOrders(@Req() req: Request & { user: any }) {
    return this.gateway.forward(
      this.gateway.orderUrl,
      'GET',
      '/orders',
      undefined,
      { 'x-user-id': req.user?.sub },
    );
  }

  // ── Inventory Routes (protected) ──────────────────────────────────────

  @Get('inventory')
  getInventory() {
    return this.gateway.forward(this.gateway.inventoryUrl, 'GET', '/inventory');
  }

  // ── Analytics Routes (protected) ──────────────────────────────────────

  @Get('analytics')
  getAnalytics() {
    return this.gateway.forward(this.gateway.analyticsUrl, 'GET', '/analytics');
  }
}
