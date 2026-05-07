import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ConstructionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.constructionRecord.create({
      data: {
        customerId: data.customerId,
        contractId: data.contractId,
        startAt: data.startAt ? new Date(data.startAt) : null,
        projectManagerId: data.projectManagerId,
        constructionAddress: data.constructionAddress,
        currentStage: '待开工',
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        projectManager: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(params: { skip?: number; take?: number; stage?: string; managerId?: string }) {
    const where: any = {};
    if (params.stage) where.currentStage = params.stage;
    if (params.managerId) where.projectManagerId = params.managerId;

    return this.prisma.constructionRecord.findMany({
      where,
      skip: params.skip || 0,
      take: params.take || 20,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, communityName: true, houseArea: true } },
        projectManager: { select: { id: true, name: true } },
        contract: { select: { id: true, contractNo: true, contractAmount: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.constructionRecord.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            designOwner: { select: { id: true, name: true } },
          },
        },
        projectManager: { select: { id: true, name: true } },
        contract: {
          include: {
            payments: { orderBy: { paidAt: 'desc' }, take: 10 },
          },
        },
      },
    });
  }

  async updateStage(id: string, stage: string, userId: string) {
    const data: any = { currentStage: stage };
    if (stage === '已完工') {
      data.actualEndAt = new Date();
    }
    return this.prisma.constructionRecord.update({ where: { id }, data });
  }

  async update(id: string, data: any) {
    return this.prisma.constructionRecord.update({
      where: { id },
      data: {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        expectedEndAt: data.expectedEndAt ? new Date(data.expectedEndAt) : undefined,
        actualEndAt: data.actualEndAt ? new Date(data.actualEndAt) : undefined,
      },
    });
  }
}
