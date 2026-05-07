import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// 字典表模型映射
const DICT_MODELS = {
  customerTags: 'CustomerTag',
  customerSources: 'CustomerSourceConfig',
  customerStages: 'CustomerStageConfig',
  intentLevels: 'IntentLevelConfig',
  renovationTypes: 'RenovationTypeConfig',
  houseStatuses: 'HouseStatusConfig',
  budgetRanges: 'BudgetRangeConfig',
  decorationStyles: 'DecorationStyleConfig',
  followUpMethods: 'FollowUpMethodConfig',
  churnReasons: 'ChurnReasonConfig',
  postponeReasons: 'PostponeReasonConfig',
  constructionNodes: 'ConstructionNodeConfig',
  afterSalesIssueTypes: 'AfterSalesIssueTypeConfig',
  afterSalesStatuses: 'AfterSalesStatusConfig',
  paymentMethods: 'PaymentMethodConfig',
  paymentTypes: 'PaymentTypeConfig',
  expenseTypes: 'ExpenseTypeConfig',
  productTypes: 'ProductTypeConfig',
  packageTypes: 'PackageTypeConfig',
} as const;

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  // 通用字典 CRUD
  async getDict(modelName: keyof typeof DICT_MODELS) {
    const model = DICT_MODELS[modelName];
    return (this.prisma as any)[model].findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createDictItem(modelName: keyof typeof DICT_MODELS, data: any) {
    const model = DICT_MODELS[modelName];
    return (this.prisma as any)[model].create({ data });
  }

  async updateDictItem(modelName: keyof typeof DICT_MODELS, id: string, data: any) {
    const model = DICT_MODELS[modelName];
    return (this.prisma as any)[model].update({ where: { id }, data });
  }

  async deleteDictItem(modelName: keyof typeof DICT_MODELS, id: string) {
    const model = DICT_MODELS[modelName];
    return (this.prisma as any)[model].delete({ where: { id } });
  }

  // 业务规则
  async getBusinessRules() {
    return this.prisma.businessRuleConfig.findMany({ orderBy: { ruleKey: 'asc' } });
  }

  async upsertBusinessRule(key: string, data: { ruleName: string; ruleValue: any; description?: string }, userId: string) {
    return this.prisma.businessRuleConfig.upsert({
      where: { ruleKey: key },
      create: {
        ruleKey: key,
        ruleName: data.ruleName,
        ruleValue: data.ruleValue,
        description: data.description,
        updatedById: userId,
      },
      update: {
        ruleName: data.ruleName,
        ruleValue: data.ruleValue,
        description: data.description,
        updatedById: userId,
      },
    });
  }

  // 系统参数
  async getSystemConfigs() {
    return this.prisma.systemConfig.findMany();
  }

  async getSystemConfig(key: string) {
    return this.prisma.systemConfig.findUnique({ where: { configKey: key } });
  }

  async upsertSystemConfig(key: string, value: string, description: string, userId: string) {
    return this.prisma.systemConfig.upsert({
      where: { configKey: key },
      create: { configKey: key, configValue: value, description, updatedById: userId },
      update: { configValue: value, description, updatedById: userId },
    });
  }
}
