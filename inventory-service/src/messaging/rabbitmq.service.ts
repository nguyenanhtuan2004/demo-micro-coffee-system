import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export const EXCHANGE = 'coffee-shop';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);
  private connected = false;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const url = this.config.get<string>('RABBITMQ_URL') || 'amqp://localhost';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      this.connected = true;
      this.logger.log('✅ Connected to RabbitMQ');
      this.connection.on('close', () => this.reconnect(url));
    } catch {
      this.logger.warn('RabbitMQ not ready, retrying in 5s...');
      setTimeout(() => this.connect(), 5000);
    }
  }

  private reconnect(url: string) {
    this.connected = false;
    setTimeout(() => this.connect(), 5000);
  }

  async publish(routingKey: string, data: Record<string, any>) {
    if (!this.connected || !this.channel) return;
    this.channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
    this.logger.log(`📤 Published [${routingKey}]`);
  }

  async subscribe(queue: string, routingKeys: string[], handler: (data: any, key: string) => void) {
    if (!this.connected || !this.channel) {
      setTimeout(() => this.subscribe(queue, routingKeys, handler), 3000);
      return;
    }
    await this.channel.assertQueue(queue, { durable: true });
    for (const key of routingKeys) {
      await this.channel.bindQueue(queue, EXCHANGE, key);
    }
    this.channel.consume(queue, (msg) => {
      if (!msg) return;
      try {
        handler(JSON.parse(msg.content.toString()), msg.fields.routingKey);
        this.channel.ack(msg);
      } catch {
        this.channel.nack(msg, false, false);
      }
    });
    this.logger.log(`📥 Subscribed [${queue}]`);
  }
}
