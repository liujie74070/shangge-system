import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ChurnsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.churnRecord.create({
      data: {
        customerId: data.customerId,
        churnedAt: new Date(data.churnedAt),
        churnedStage: data.churnedStage,
        reason: data.reason,
        competitorName: data.competitorName,
        canReactivate: data.canReactivate ?? true,
        reviewNote: data.reviewNote,
        operatorId: userId,
      },
      include: { customer: { select: { id: true, name: true, phone: true } } },
    });
  }

  async reactivate(customerId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerId },
        data: { isLost: false, stage: 'LEAD', lostAt: null, lostReason: null },
      });
      return tx.churnRecord.updateMany({
        where: { customerId },
        data: { canReactivate: false },
      });
    });
  }

  async findAll(params: { skip?: number; take?: number; startDate?: string; endDate?: string; reason?: string }) {
    const where: any = {};
    if (params.reason) where.reason = params.reason;
    if (params.startDate) where.churnedAt = { ...where.churnedAt, gte: new Date(params.startDate) };
    if (params.endDate) where.churnedAt = { ...where.churnedAt, lte: new Date(params.endDate) };

    return this.prisma.churnRecord.findMany({
      where,
      skip: params.skip || 0,
      take: params.take || 20,
      orderBy: { churnedAt: 'desc' },
      include: { customer: { select: { id: true, name: true, phone: true, source: true } } },
    });
  }
}
