import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findMany({ activeOnly }: { activeOnly: boolean }) {
    const products = await this.prisma.product.findMany({
      where: activeOnly ? { active: true, category: { active: true } } : undefined,
      include: { category: true },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    });

    return products.map((product) => this.toDto(product));
  }

  async findCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: { category: true },
    });

    if (!product || !product.active || !product.category.active) {
      throw new NotFoundException(`Không tìm thấy món "${productId}" hoặc món đang tạm ẩn`);
    }

    return this.toDto(product);
  }

  async create(dto: CreateProductDto) {
    const category = await this.upsertCategory(dto.category);

    const product = await this.prisma.product.create({
      data: {
        productId: dto.productId,
        name: dto.name,
        price: dto.price,
        emoji: dto.emoji ?? '',
        active: dto.active ?? true,
        categoryId: category.id,
      },
      include: { category: true },
    });

    return this.toDto(product);
  }

  async update(productId: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { productId } });
    if (!existing) throw new NotFoundException(`Không tìm thấy món "${productId}"`);

    const category = dto.category ? await this.upsertCategory(dto.category) : undefined;

    const product = await this.prisma.product.update({
      where: { productId },
      data: {
        name: dto.name,
        price: dto.price,
        emoji: dto.emoji,
        active: dto.active,
        categoryId: category?.id,
      },
      include: { category: true },
    });

    return this.toDto(product);
  }

  private upsertCategory(name: string) {
    return this.prisma.category.upsert({
      where: { name },
      update: { active: true },
      create: { name, active: true },
    });
  }

  private toDto(product: any) {
    return {
      id: product.id,
      productId: product.productId,
      name: product.name,
      price: product.price,
      category: product.category.name,
      emoji: product.emoji,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
