import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [HttpModule],
  controllers: [GatewayController],
  providers: [GatewayService, RolesGuard],
})
export class GatewayModule {}
