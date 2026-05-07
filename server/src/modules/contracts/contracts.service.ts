import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number; take?: number;
    departmentId?: string; designerId?: string;
    paymentStatus?: string; startDate?: string; endDate?: string;
  }) {
    const where: any = {};
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
    if (params.startDate) where.signedAt = { ...where.signedAt, gte: new Date(params.startDate) };
    if (params.endDate) where.signedAt = { ...where.signedAt, lte: new Date(params.endDate) };

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip: params.skip || 0,
        take: params.take || 20,
        orderBy: { signedAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true, name: true, phone: true,
              communityName: true, houseArea: true,
              designOwner: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { contracts, total };
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            designOwner: { select: { id: true, name: true, phone: true } },
            coDesigner: { select: { id: true, name: true } },
          },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
          include: { recordedBy: { select: { id: true, name: true } } },
        },
        constructionRecord: {
          include: { projectManager: { select: { id: true, name: true } } },
        },
      },
    });
    if (!contract) throw new NotFoundException('合同不存在');
    return contract;
  }

  async findByCustomer(customerId: string) {
    return this.prisma.contract.findUnique({ where: { customerId } });
  }

  async update(id: string, data: any) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('合同不存在');

    // 计算未收款
    const receivedAmount = data.receivedAmount ?? contract.receivedAmount;
    const contractAmount = data.contractAmount ?? contract.contractAmount;
    const unpaidAmount = contractAmount - receivedAmount;

    return this.prisma.contract.update({
      where: { id },
      data: {
        ...data,
        receivedAmount,
        unpaidAmount,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async sign(id: string, data: any, userId: string) {
    // 签单权限校验（仅设计师）
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!contract) throw new NotFoundException('合同不存在');

    const customer = contract.customer;
    if (customer.designOwnerId !== userId) {
      throw new BadRequestException('只有负责该客户的设计师才能签单');
    }

    // 生成合同编号
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const countToday = await this.prisma.contract.count({
      where: { signedAt: { gte: new Date(today.setHours(0, 0, 0, 0)) } },
    });
    const contractNo = `HT${dateStr}${String(countToday + 1).padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // 更新合同
      const updated = await tx.contract.update({
        where: { id },
        data: {
          signedAt: new Date(data.signedAt),
          contractNo,
          contractAmount: data.contractAmount,
          depositAmount: data.depositAmount || 0,
          receivedAmount: data.depositAmount || 0,
          unpaidAmount: (data.contractAmount || 0) - (data.depositAmount || 0),
          paymentStatus: data.depositAmount > 0 ? '已收定金' : '未收款',
          productType: data.productType,
          packageType: data.packageType,
          houseArea: data.houseArea,
          unitPrice: data.unitPrice,
          estimatedProfit: data.estimatedProfit,
          contractFiles: data.contractFiles,
        },
      });

      // 更新客户状态
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          isSigned: true,
          stage: 'SIGNED',
          updatedAt: new Date(),
        },
      });

      // 记录阶段变更
      await tx.customerStageLog.create({
        data: {
          customerId: customer.id,
          fromStage: customer.stage,
          toStage: 'SIGNED',
          operatorId: userId,
          remark: `签单，合同号：${contractNo}`,
        },
      });

      return updated;
    });
  }
}
