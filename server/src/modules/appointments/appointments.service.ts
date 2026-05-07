import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.appointment.create({
      data: {
        customerId: data.customerId,
        appointmentTime: new Date(data.appointmentTime),
        storeId: data.storeId,
        inviterId: data.inviterId,
        hostId: data.hostId,
        remark: data.remark,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        inviter: { select: { id: true, name: true } },
        host: { select: { id: true, name: true } },
      },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.appointment.findMany({
      where: { customerId },
      orderBy: { appointmentTime: 'desc' },
      include: {
        inviter: { select: { id: true, name: true } },
        host: { select: { id: true, name: true } },
      },
    });
  }

  async arrive(id: string, data: { isArrived: boolean; noShowReason?: string }) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        isArrived: data.isArrived,
        noShowReason: data.noShowReason,
      },
    });
  }

  async reschedule(id: string, newTime: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { rescheduledTime: new Date(newTime) },
    });
  }
}
