import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.store.findMany({
      include: {
        _count: { select: { departments: true, users: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
      include: {
        departments: true,
        _count: { select: { users: true } },
      },
    });
  }

  async create(data: { name: string; address?: string; phone?: string }) {
    return this.prisma.store.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; address: string; phone: string }>) {
    return this.prisma.store.update({ where: { id }, data });
  }
}
