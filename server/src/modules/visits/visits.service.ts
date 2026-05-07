import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.visitRecord.create({
      data: {
        customerId: data.customerId,
        visitTime: new Date(data.visitTime),
        hostDesignerId: data.hostDesignerId || userId,
        duration: data.duration,
        customerRequirement: data.customerRequirement,
        customerFocus: data.customerFocus,
        result: data.result,
        enterMeasurement: data.enterMeasurement,
      },
      include: {
        hostDesigner: { select: { id: true, name: true } },
      },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.visitRecord.findMany({
      where: { customerId },
      orderBy: { visitTime: 'desc' },
      include: { hostDesigner: { select: { id: true, name: true } } },
    });
  }
}
