import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}

  async findByCustomer(customerId: string) {
    return this.prisma.followUp.findMany({
      where: { customerId },
      orderBy: { followUpAt: 'desc' },
      include: {
        follower: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: any, userId: string) {
    const followUp = await this.prisma.followUp.create({
      data: {
        customerId: data.customerId,
        followUpAt: data.followUpAt ? new Date(data.followUpAt) : new Date(),
        followerId: userId,
        method: data.method,
        content: data.content,
        customerFeedback: data.customerFeedback,
        customerPainPoint: data.customerPainPoint,
        customerFocus: data.customerFocus,
        customerObjection: data.customerObjection,
        nextAction: data.nextAction,
        nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
        attachments: data.attachments,
      },
      include: {
        follower: { select: { id: true, name: true } },
      },
    });

    // 更新客户最后跟进时间
    await this.prisma.customer.update({
      where: { id: data.customerId },
      data: {
        lastFollowUpAt: new Date(),
        nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
      },
    });

    return followUp;
  }

  async getTodayTodos(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.customer.findMany({
      where: {
        currentOwnerId: userId,
        nextFollowUpAt: { lte: tomorrow },
        isLost: false,
        isSigned: false,
      },
      select: {
        id: true, name: true, phone: true,
        intentLevel: true, stage: true,
        nextFollowUpAt: true, lastFollowUpAt: true,
        communityName: true,
      },
      orderBy: { nextFollowUpAt: 'asc' },
    });
  }

  async getOverdue(userId: string) {
    const now = new Date();
    return this.prisma.customer.findMany({
      where: {
        currentOwnerId: userId,
        nextFollowUpAt: { lt: now },
        isLost: false,
        isSigned: false,
      },
      select: {
        id: true, name: true, phone: true,
        intentLevel: true, stage: true,
        nextFollowUpAt: true,
      },
    });
  }
}
