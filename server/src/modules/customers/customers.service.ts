import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

// 有效阶段流转
const VALID_TRANSITIONS: Record<string, string[]> = {
  LEAD: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST', 'POSTPONED'],
  QUALIFIED: ['INVITED', 'LOST', 'POSTPONED'],
  INVITED: ['VISITED', 'LOST', 'POSTPONED'],
  VISITED: ['MEASURED', 'LOST', 'POSTPONED'],
  MEASURED: ['DESIGNING', 'LOST', 'POSTPONED'],
  DESIGNING: ['QUOTED', 'LOST', 'POSTPONED'],
  QUOTED: ['NEGOTIATING', 'LOST', 'POSTPONED'],
  NEGOTIATING: ['SIGNED', 'LOST', 'POSTPONED'],
  SIGNED: ['TO_CONSTRUCTION'],
  TO_CONSTRUCTION: ['CONSTRUCTING'],
  CONSTRUCTING: ['COMPLETED'],
  COMPLETED: ['AFTER_SALES', 'REFERRAL_READY'],
  AFTER_SALES: ['REFERRAL_READY'],
  LOST: ['LEAD'],
  POSTPONED: ['LEAD', 'LOST'],
  REFERRAL_READY: [],
};

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // ========== 撞单检测 ==========
  async checkCollision(data: { phone?: string; wechat?: string; communityName?: string; name?: string }): Promise<{
    level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    existingCustomers: any[];
    message: string;
  }> {
    const results: any[] = [];

    // 高危：手机号完全相同
    if (data.phone) {
      const byPhone = await this.prisma.customer.findMany({
        where: { phone: data.phone },
        select: { id: true, name: true, phone: true, stage: true, intentLevel: true, currentOwnerId: true },
      });
      if (byPhone.length > 0) {
        return {
          level: 'HIGH',
          existingCustomers: byPhone,
          message: `检测到手机号「${data.phone}」已存在 ${byPhone.length} 条客户记录`,
        };
      }
    }

    // 中危：微信号相同
    if (data.wechat) {
      const byWechat = await this.prisma.customer.findMany({
        where: { wechat: data.wechat },
        select: { id: true, name: true, phone: true, wechat: true, stage: true },
      });
      if (byWechat.length > 0) {
        return {
          level: 'MEDIUM',
          existingCustomers: byWechat,
          message: `检测到微信号「${data.wechat}」可能重复`,
        };
      }
    }

    // 低危：小区名称+姓名相同
    if (data.communityName && data.name) {
      const byCommunity = await this.prisma.customer.findMany({
        where: {
          communityName: data.communityName,
          name: data.name,
        },
        select: { id: true, name: true, phone: true, communityName: true },
      });
      if (byCommunity.length > 0) {
        return {
          level: 'LOW',
          existingCustomers: byCommunity,
          message: `检测到同小区「${data.communityName}」有相似客户`,
        };
      }
    }

    return { level: 'NONE', existingCustomers: [], message: '未检测到撞单' };
  }

  // ========== 创建客户 ==========
  async create(dto: CreateCustomerDto, userId: string) {
    // 撞单检测
    const collision = await this.checkCollision({
      phone: dto.phone,
      wechat: dto.wechat,
      communityName: dto.communityName,
      name: dto.name,
    });

    const data: Prisma.CustomerCreateInput = {
      name: dto.name,
      phone: dto.phone,
      wechat: dto.wechat,
      idNumber: dto.idNumber,
      gender: dto.gender,
      age: dto.age,
      communityName: dto.communityName,
      houseAddress: dto.houseAddress,
      houseArea: dto.houseArea,
      houseType: dto.houseType,
      renovationType: dto.renovationType,
      houseStatus: dto.houseStatus,
      decorationTime: dto.decorationTime,
      expectedBudget: dto.expectedBudget,
      budgetRange: dto.budgetRange,
      decorationStyle: dto.decorationStyle,
      specialRequirement: dto.specialRequirement,
      source: dto.source,
      sourceDetail: dto.sourceDetail,
      referrerName: dto.referrerName,
      referrerPhone: dto.referrerPhone,
      intentLevel: dto.intentLevel || 'C',
      stage: 'LEAD',
      createdById: userId,
      currentOwnerId: dto.currentOwnerId || userId,
      marketOwnerId: dto.marketOwnerId,
      designOwnerId: dto.designOwnerId,
      storeId: dto.storeId,
      deptId: dto.deptId,
    };

    const customer = await this.prisma.customer.create({ data });

    // 记录阶段日志
    await this.prisma.customerStageLog.create({
      data: {
        customerId: customer.id,
        fromStage: null,
        toStage: 'LEAD',
        operatorId: userId,
      },
    });

    return { customer, collision };
  }

  // ========== 查询客户 ==========
  async findAll(params: {
    skip?: number;
    take?: number;
    keyword?: string;
    stage?: string;
    intentLevel?: string;
    source?: string;
    departmentId?: string;
    ownerId?: string;
    isSigned?: boolean;
    isLost?: boolean;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      skip = 0,
      take = 20,
      keyword,
      stage,
      intentLevel,
      source,
      departmentId,
      ownerId,
      isSigned,
      isLost,
      startDate,
      endDate,
    } = params;

    const where: Prisma.CustomerWhereInput = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
        { communityName: { contains: keyword } },
      ];
    }
    if (stage) where.stage = stage;
    if (intentLevel) where.intentLevel = intentLevel;
    if (source) where.source = source;
    if (departmentId) where.deptId = departmentId;
    if (ownerId) where.currentOwnerId = ownerId;
    if (isSigned !== undefined) where.isSigned = isSigned;
    if (isLost !== undefined) where.isLost = isLost;
    if (startDate) where.createdAt = { ...where.createdAt as any, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt as any, lte: new Date(endDate) };

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          currentOwner: { select: { id: true, name: true, role: true } },
          department: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          _count: {
            select: {
              followUps: true,
              appointments: true,
              visitRecords: true,
              measurements: true,
              proposals: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        store: true,
        department: true,
        createdBy: { select: { id: true, name: true } },
        currentOwner: { select: { id: true, name: true, phone: true, role: true } },
        marketOwner: { select: { id: true, name: true } },
        designOwner: { select: { id: true, name: true } },
        coDesigner: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        followUps: {
          orderBy: { followUpAt: 'desc' },
          take: 10,
          include: { follower: { select: { id: true, name: true } } },
        },
        appointments: {
          orderBy: { appointmentTime: 'desc' },
          take: 5,
        },
        visitRecords: {
          orderBy: { visitTime: 'desc' },
          take: 5,
          include: { hostDesigner: { select: { id: true, name: true } } },
        },
        measurements: {
          orderBy: { measureTime: 'desc' },
          take: 3,
          include: { measurer: { select: { id: true, name: true } } },
        },
        proposals: {
          orderBy: { submittedAt: 'desc' },
          take: 5,
          include: { designer: { select: { id: true, name: true } } },
        },
        contract: true,
        churnRecord: true,
        constructionRecord: {
          include: { projectManager: { select: { id: true, name: true } } },
        },
        afterSalesTickets: {
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        referralRecords: {
          include: {
            referredCustomer: { select: { id: true, name: true, phone: true } },
          },
        },
        stageLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!customer) throw new NotFoundException('客户不存在');
    return customer;
  }

  // ========== 更新客户 ==========
  async update(id: string, dto: UpdateCustomerDto, userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');

    const data: Prisma.CustomerUpdateInput = { ...dto };

    // 如果修改了阶段，验证并记录
    if (dto.stage && dto.stage !== customer.stage) {
      this.validateStageTransition(customer.stage, dto.stage);
      data.updatedAt = new Date();
    }

    return this.prisma.customer.update({
      where: { id },
      data,
      include: {
        currentOwner: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  // ========== 阶段流转 ==========
  async stageTransition(id: string, toStage: string, remark: string, userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');

    this.validateStageTransition(customer.stage, toStage);

    const updates: Prisma.CustomerUpdateInput = {
      stage: toStage,
      isLost: toStage === 'LOST',
      isSigned: toStage === 'SIGNED',
      updatedAt: new Date(),
    };

    if (toStage === 'LOST') {
      updates.lostAt = new Date();
      updates.lostReason = remark;
    }

    const [updated, log] = await this.prisma.$transaction([
      this.prisma.customer.update({ where: { id }, data: updates }),
      this.prisma.customerStageLog.create({
        data: {
          customerId: id,
          fromStage: customer.stage,
          toStage,
          operatorId: userId,
          remark,
        },
      }),
    ]);

    // 如果签单 → 自动创建合同占位
    if (toStage === 'SIGNED' && !customer.isSigned) {
      const contractCount = await this.prisma.contract.count();
      await this.prisma.contract.create({
        data: {
          customerId: id,
          signedAt: new Date(),
          contractNo: `HT${Date.now()}`,
          contractAmount: 0,
          depositAmount: 0,
          receivedAmount: 0,
          unpaidAmount: 0,
        },
      });
    }

    return { customer: updated, log };
  }

  // ========== 客户分配 ==========
  async assign(id: string, toOwnerId: string, reason: string, operatorId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');

    const fromOwnerId = customer.currentOwnerId;

    const updated = await this.prisma.$transaction(async (tx) => {
      // 更新客户归属
      await tx.customer.update({
        where: { id },
        data: {
          currentOwnerId: toOwnerId,
          assignedAt: new Date(),
          assignedById: operatorId,
        },
      });

      // 记录分配
      await tx.customerAssignment.create({
        data: {
          customerId: id,
          fromOwnerId,
          toOwnerId,
          reason,
          operatorId,
        },
      });

      return tx.customer.findUnique({
        where: { id },
        include: {
          currentOwner: { select: { id: true, name: true, role: true } },
        },
      });
    });

    return updated;
  }

  // ========== 删除客户 ==========
  async remove(id: string) {
    await this.prisma.customer.delete({ where: { id } });
    return { success: true };
  }

  // ========== 内部工具方法 ==========
  private validateStageTransition(from: string, to: string) {
    const validNextStages = VALID_TRANSITIONS[from] || [];
    if (!validNextStages.includes(to)) {
      throw new BadRequestException(
        `阶段「${from}」不能直接流转到「${to}」。可选阶段: ${validNextStages.join(', ') || '无'}`,
      );
    }
  }
}
