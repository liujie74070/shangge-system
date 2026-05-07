import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const payment = await this.prisma.payment.create({
      data: {
        contractId: data.contractId,
        customerId: data.customerId,
        amount: data.amount,
        type: data.type,
        method: data.method,
        paidAt: new Date(data.paidAt),
        recordedById: userId,
        remark: data.remark,
      },
      include: {
        recordedBy: { select: { id: true, name: true } },
      },
    });

    // 更新合同收款状态
    const contract = await this.prisma.contract.findUnique({ where: { id: data.contractId } });
    if (contract) {
      const newReceivedAmount = contract.receivedAmount + data.amount;
      const unpaidAmount = contract.contractAmount - newReceivedAmount;
      let paymentStatus = '部分收款';
      if (unpaidAmount <= 0) paymentStatus = '已收齐';
      else if (contract.depositAmount === 0 && newReceivedAmount > 0) paymentStatus = '已收定金';

      await this.prisma.contract.update({
        where: { id: data.contractId },
        data: { receivedAmount: newReceivedAmount, unpaidAmount, paymentStatus },
      });
    }

    return payment;
  }

  async findByContract(contractId: string) {
    return this.prisma.payment.findMany({
      where: { contractId },
      orderBy: { paidAt: 'desc' },
      include: { recordedBy: { select: { id: true, name: true } } },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.payment.findMany({
      where: { customerId },
      orderBy: { paidAt: 'desc' },
      include: { recordedBy: { select: { id: true, name: true } } },
    });
  }
}
