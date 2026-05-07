import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ========== 首页概览 KPI ==========
  async getOverview(params: { startDate?: string; endDate?: string; departmentId?: string }) {
    const where: any = {};
    if (params.startDate) where.createdAt = { ...where.createdAt, gte: new Date(params.startDate) };
    if (params.endDate) where.createdAt = { ...where.createdAt, lte: new Date(params.endDate) };
    if (params.departmentId) where.deptId = params.departmentId;

    const [
      totalCustomers,
      activeCustomers,
      signedCustomers,
      lostCustomers,
      contracts,
    ] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.count({ where: { ...where, isLost: false, isSigned: false } }),
      this.prisma.customer.count({ where: { ...where, isSigned: true } }),
      this.prisma.customer.count({ where: { ...where, isLost: true } }),
      this.prisma.contract.findMany({
        where: { signedAt: where.createdAt ? { gte: where.createdAt.gte } : undefined },
        select: { contractAmount: true, receivedAmount: true },
      }),
    ]);

    const totalSignedAmount = contracts.reduce((sum, c) => sum + c.contractAmount, 0);
    const totalReceivedAmount = contracts.reduce((sum, c) => sum + c.receivedAmount, 0);

    return {
      totalCustomers,
      activeCustomers,
      signedCustomers,
      lostCustomers,
      totalSignedAmount,
      totalReceivedAmount,
      totalContracts: contracts.length,
    };
  }

  // ========== 转化漏斗 ==========
  async getFunnel(params: { startDate?: string; endDate?: string; departmentId?: string }) {
    const where: any = {};
    if (params.startDate) where.createdAt = { ...where.createdAt, gte: new Date(params.startDate) };
    if (params.endDate) where.createdAt = { ...where.createdAt, lte: new Date(params.endDate) };
    if (params.departmentId) where.deptId = params.departmentId;

    const stages = ['LEAD', 'CONTACTED', 'QUALIFIED', 'INVITED', 'VISITED', 'MEASURED', 'DESIGNING', 'QUOTED', 'NEGOTIATING', 'SIGNED'];
    const funnel: Record<string, number> = {};

    for (const stage of stages) {
      funnel[stage] = await this.prisma.customer.count({
        where: { ...where, stage },
      });
    }

    return {
      labels: ['线索', '已联系', '有效客户', '已邀约', '已进店', '已量房', '方案中', '已报价', '谈单中', '已签约'],
      stages,
      counts: stages.map((s) => funnel[s]),
      rates: [] as number[],
    };
  }

  // ========== 渠道来源分布 ==========
  async getSourceStats(params: { startDate?: string; endDate?: string }) {
    const where: any = {};
    if (params.startDate) where.createdAt = { ...where.createdAt, gte: new Date(params.startDate) };
    if (params.endDate) where.createdAt = { ...where.createdAt, lte: new Date(params.endDate) };

    const sources = await this.prisma.customer.groupBy({
      by: ['source'],
      where,
      _count: { source: true },
    });

    return sources.map((s) => ({
      source: s.source || '未知',
      count: s._count.source,
    }));
  }

  // ========== 签单业绩趋势 (按月) ==========
  async getSignedTrend(months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const contracts = await this.prisma.contract.findMany({
      where: { signedAt: { gte: startDate } },
      select: { signedAt: true, contractAmount: true },
    });

    const monthly: Record<string, { count: number; amount: number }> = {};
    for (const c of contracts) {
      const month = `${c.signedAt.getFullYear()}-${String(c.signedAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[month]) monthly[month] = { count: 0, amount: 0 };
      monthly[month].count++;
      monthly[month].amount += c.contractAmount;
    }

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }

  // ========== 人员排名 ==========
  async getDesignerRanking(params: { startDate?: string; endDate?: string; limit?: number }) {
    const where: any = { isSigned: true };
    if (params.startDate) where.createdAt = { ...where.createdAt, gte: new Date(params.startDate) };
    if (params.endDate) where.createdAt = { ...where.createdAt, lte: new Date(params.endDate) };

    const customers = await this.prisma.customer.findMany({
      where,
      select: {
        designOwnerId: true,
        designOwner: { select: { id: true, name: true } },
        isSigned: true,
      },
    });

    const designerMap: Record<string, { name: string; count: number; amount: number }> = {};
    for (const c of customers) {
      if (!c.designOwnerId || !c.designOwner) continue;
      if (!designerMap[c.designOwnerId]) {
        designerMap[c.designOwnerId] = { name: c.designOwner.name, count: 0, amount: 0 };
      }
      designerMap[c.designOwnerId].count++;
    }

    // 获取合同金额
    const contracts = await this.prisma.contract.findMany({
      where: params.startDate ? { signedAt: { gte: new Date(params.startDate) } } : undefined,
      include: { customer: { select: { designOwnerId: true } } },
    });
    for (const contract of contracts) {
      const ownerId = contract.customer?.designOwnerId;
      if (ownerId && designerMap[ownerId]) {
        designerMap[ownerId].amount += contract.contractAmount;
      }
    }

    return Object.entries(designerMap)
      .map(([id, data]) => ({ designerId: id, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, params.limit || 10);
  }

  // ========== 流失分析 ==========
  async getChurnStats(params: { startDate?: string; endDate?: string }) {
    const where: any = {};
    if (params.startDate) where.churnedAt = { ...where.churnedAt, gte: new Date(params.startDate) };
    if (params.endDate) where.churnedAt = { ...where.churnedAt, lte: new Date(params.endDate) };

    const churns = await this.prisma.churnRecord.groupBy({
      by: ['reason'],
      where,
      _count: { reason: true },
    });

    return churns.map((c) => ({
      reason: c.reason || '未知',
      count: c._count.reason,
    }));
  }
}
