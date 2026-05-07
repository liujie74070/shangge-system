import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.referralRecord.create({
      data: {
        referrerCustomerId: data.referrerCustomerId,
        referredCustomerId: data.referredCustomerId,
        referredAt: new Date(),
        reward: data.reward,
        remark: data.remark,
      },
      include: {
        referrerCustomer: { select: { id: true, name: true, phone: true } },
        referredCustomer: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async findAll(params: { skip?: number; take?: number }) {
    return this.prisma.referralRecord.findMany({
      skip: params.skip || 0,
      take: params.take || 20,
      orderBy: { referredAt: 'desc' },
      include: {
        referrerCustomer: { select: { id: true, name: true, phone: true, isOldCustomer: true } },
        referredCustomer: { select: { id: true, name: true, phone: true, stage: true } },
      },
    });
  }

  async getStats() {
    const total = await this.prisma.referralRecord.count();
    const referredSigned = await this.prisma.referralRecord.count({
      where: { referredCustomer: { isSigned: true } },
    });
    return { total, referredSigned };
  }
}
