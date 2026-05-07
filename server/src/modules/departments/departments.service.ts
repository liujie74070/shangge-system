import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        store: true,
        manager: { select: { id: true, name: true, phone: true } },
        _count: { select: { users: true } },
      },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        store: true,
        manager: { select: { id: true, name: true, phone: true } },
        parent: true,
        children: true,
        users: { where: { isActive: true } },
      },
    });
    if (!dept) throw new NotFoundException('部门不存在');
    return dept;
  }

  async create(data: { name: string; type: string; parentId?: string; storeId?: string; managerId?: string }) {
    return this.prisma.department.create({
      data: {
        name: data.name,
        type: data.type as any,
        parentId: data.parentId,
        storeId: data.storeId,
        managerId: data.managerId,
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; type: string; parentId: string; storeId: string; managerId: string }>) {
    return this.prisma.department.update({
      where: { id },
      data: {
        ...data,
        type: data.type as any,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
