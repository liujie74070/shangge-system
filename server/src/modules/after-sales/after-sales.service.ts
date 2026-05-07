import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AfterSalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.afterSalesTicket.create({
      data: {
        customerId: data.customerId,
        issueType: data.issueType,
        description: data.description,
        submittedAt: new Date(),
        handlerId: data.handlerId,
        status: '待处理',
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        handler: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(params: { skip?: number; take?: number; status?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    return this.prisma.afterSalesTicket.findMany({
      where,
      skip: params.skip || 0,
      take: params.take || 20,
      orderBy: { submittedAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        handler: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: { status?: string; resolution?: string; revisitRecord?: string; handlerId?: string }) {
    return this.prisma.afterSalesTicket.update({
      where: { id },
      data,
    });
  }
}
