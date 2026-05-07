import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.designProposal.create({
      data: {
        customerId: data.customerId,
        designerId: data.designerId,
        submittedAt: new Date(data.submittedAt || Date.now()),
        version: data.version || 'v1',
        quotationAt: data.quotationAt ? new Date(data.quotationAt) : null,
        quotationAmount: data.quotationAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
        customerBudget: data.customerBudget,
        quoteStatus: data.quoteStatus || '未报价',
        customerFeedback: data.customerFeedback,
        attachments: data.attachments,
      },
      include: {
        designer: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.designProposal.findMany({
      where: { customerId },
      orderBy: { submittedAt: 'desc' },
      include: {
        designer: { select: { id: true, name: true } },
      },
    });
  }

  async submitQuote(id: string, data: { quotationAmount: number; discountAmount?: number; finalAmount: number }) {
    return this.prisma.designProposal.update({
      where: { id },
      data: {
        quotationAt: new Date(),
        quotationAmount: data.quotationAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
        quoteStatus: '已报价',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.designProposal.update({
      where: { id },
      data: { quoteStatus: status },
    });
  }
}
