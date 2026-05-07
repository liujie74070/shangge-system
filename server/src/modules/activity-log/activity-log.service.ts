import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, entityType: string, entityId?: string, metadata?: any) {
    return this.prisma.activityLog.create({
      data: { userId, action, entityType, entityId, metadata },
    });
  }

  async findAll(params: { skip?: number; take?: number; userId?: string; entityType?: string }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.entityType) where.entityType = params.entityType;

    return this.prisma.activityLog.findMany({
      where,
      skip: params.skip || 0,
      take: params.take || 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
  }
}
