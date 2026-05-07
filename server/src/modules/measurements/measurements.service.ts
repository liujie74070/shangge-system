import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.measurementRecord.create({
      data: {
        customerId: data.customerId,
        measureTime: new Date(data.measureTime),
        measureAddress: data.measureAddress,
        measurerId: data.measurerId,
        isCompleted: data.isCompleted || false,
        floorPlanFiles: data.floorPlanFiles,
        sitePhotos: data.sitePhotos,
        customerRequirement: data.customerRequirement,
        remark: data.remark,
      },
      include: {
        measurer: { select: { id: true, name: true } },
      },
    });
  }

  async complete(id: string, data: { floorPlanFiles?: string[]; sitePhotos?: string[]; remark?: string }) {
    return this.prisma.measurementRecord.update({
      where: { id },
      data: {
        isCompleted: true,
        floorPlanFiles: data.floorPlanFiles,
        sitePhotos: data.sitePhotos,
        remark: data.remark,
      },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.measurementRecord.findMany({
      where: { customerId },
      orderBy: { measureTime: 'desc' },
      include: { measurer: { select: { id: true, name: true } } },
    });
  }
}
