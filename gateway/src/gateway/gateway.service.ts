import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {}

  get authUrl() {
    return this.config.get<string>('AUTH_SERVICE_URL');
  }
  get orderUrl() {
    return this.config.get<string>('ORDER_SERVICE_URL');
  }
  get inventoryUrl() {
    return this.config.get<string>('INVENTORY_SERVICE_URL');
  }
  get analyticsUrl() {
    return this.config.get<string>('ANALYTICS_SERVICE_URL');
  }
  get productUrl() {
    return this.config.get<string>('PRODUCT_SERVICE_URL');
  }

  async forward(
    serviceUrl: string,
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ) {
    const url = `${serviceUrl}${path}`;
    this.logger.log(`Forwarding ${method} ${url}`);

    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url,
          data: body,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      this.logger.error(`Service không sẵn sàng: ${url}`, error.message);
      throw new HttpException('Service không sẵn sàng', 503);
    }
  }
}
