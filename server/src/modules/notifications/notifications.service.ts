import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { title: string; content: string; type?: string; relatedEntityType?: string; relatedEntityId?: string }) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        type: data.type || 'INFO',
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
      },
    });
  }

  async findByUser(userId: string, params: { skip?: number; take?: number; isRead?: boolean }) {
    const where: any = { userId };
    if (params.isRead !== undefined) where.isRead = params.isRead;

    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: params.skip || 0,
        take: params.take || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, unreadCount };
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
