import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化数据库...');

  // ========== 1. 创建门店 ==========
  const store = await prisma.store.upsert({
    where: { id: 'store-feixi-001' },
    update: {},
    create: {
      id: 'store-feixi-001',
      name: '肥西尚格放心装',
      address: '安徽省合肥市肥西县',
      phone: '0551-68888888',
    },
  });
  console.log('✅ 门店:', store.name);

  // ========== 2. 创建部门 ==========
  const depts = [
    { id: 'dept-gm', name: '总经办', type: 'GM' as const },
    { id: 'dept-marketing', name: '市场部', type: 'MARKETING' as const },
    { id: 'dept-design', name: '设计部', type: 'DESIGN' as const },
    { id: 'dept-ip', name: 'IP部', type: 'IP' as const },
    { id: 'dept-finance', name: '财务部', type: 'FINANCE' as const },
    { id: 'dept-engineering', name: '工程交付中心', type: 'ENGINEERING' as const },
    { id: 'dept-reception', name: '客服部', type: 'RECEPTIONIST' as const },
  ];

  for (const d of depts) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, name: d.name, type: d.type, storeId: store.id },
    });
  }
  console.log('✅ 部门:', depts.length + '个');

  // ========== 3. 创建管理员账户 ==========
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '13900000000' },
    update: {},
    create: {
      name: '系统管理员',
      phone: '13900000000',
      passwordHash,
      role: 'GM',
      departmentId: 'dept-gm',
      isActive: true,
    },
  });
  console.log('✅ 管理员账户: 13900000000 / admin123');

  // ========== 4. 客户来源字典 ==========
  const sources = [
    '自然进店', '老客户转介绍', '设计师自拓', '业务员拓客', '物业渠道',
    '异业渠道', '抖音/短视频', '直播', '电话资源', '活动会销',
    '地推', '小区开发', '朋友圈', '广告投放', '其他',
  ];
  for (let i = 0; i < sources.length; i++) {
    await prisma.customerSourceConfig.upsert({
      where: { id: `source-${i + 1}` },
      update: {},
      create: { id: `source-${i + 1}`, name: sources[i], isActive: true, sortOrder: i + 1 },
    });
  }
  console.log('✅ 客户来源字典:', sources.length + '条');

  // ========== 5. 客户阶段字典 ==========
  const stages = [
    { code: 'LEAD', name: '新线索', color: '#8C8C8C' },
    { code: 'CONTACTED', name: '已联系', color: '#1890FF' },
    { code: 'QUALIFIED', name: '有效客户', color: '#52C41A' },
    { code: 'INVITED', name: '已邀约', color: '#FA8C16' },
    { code: 'VISITED', name: '已进店', color: '#FA8C16' },
    { code: 'MEASURED', name: '已量房', color: '#D46B08' },
    { code: 'DESIGNING', name: '方案设计中', color: '#722ED1' },
    { code: 'QUOTED', name: '已报价', color: '#13C2C2' },
    { code: 'NEGOTIATING', name: '谈单中', color: '#EB2F96' },
    { code: 'SIGNED', name: '已签约', color: '#52C41A' },
    { code: 'TO_CONSTRUCTION', name: '已转施工', color: '#52C41A' },
    { code: 'CONSTRUCTING', name: '施工中', color: '#FAAD14' },
    { code: 'COMPLETED', name: '已完工', color: '#52C41A' },
    { code: 'AFTER_SALES', name: '售后中', color: '#1890FF' },
    { code: 'LOST', name: '已流失', color: '#FF4D4F' },
    { code: 'POSTPONED', name: '暂缓装修', color: '#8C8C8C' },
    { code: 'REFERRAL_READY', name: '老客户/可转介绍', color: '#52C41A' },
  ];
  for (let i = 0; i < stages.length; i++) {
    await prisma.customerStageConfig.upsert({
      where: { code: stages[i].code },
      update: {},
      create: {
        id: `stage-${i + 1}`,
        name: stages[i].name,
        code: stages[i].code,
        color: stages[i].color,
        sortOrder: i + 1,
      },
    });
  }
  console.log('✅ 客户阶段字典:', stages.length + '个阶段');

  // ========== 6. 意向等级 ==========
  const levels = [
    { name: 'A', color: '#FF4D4F', sortOrder: 1 },
    { name: 'B', color: '#FA8C16', sortOrder: 2 },
    { name: 'C', color: '#1890FF', sortOrder: 3 },
    { name: 'D', color: '#8C8C8C', sortOrder: 4 },
  ];
  for (const l of levels) {
    await prisma.intentLevelConfig.upsert({
      where: { id: `level-${l.name}` },
      update: {},
      create: { id: `level-${l.name}`, name: l.name, color: l.color, sortOrder: l.sortOrder },
    });
  }
  console.log('✅ 意向等级: A/B/C/D');

  // ========== 7. 装修类型 ==========
  const renoTypes = ['新房', '旧房', '二手房', '局改', '翻新'];
  for (let i = 0; i < renoTypes.length; i++) {
    await prisma.renovationTypeConfig.upsert({
      where: { id: `reno-${i + 1}` },
      update: {},
      create: { id: `reno-${i + 1}`, name: renoTypes[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 8. 房屋状态 ==========
  const houseStatuses = ['未交房', '已交房', '已拿钥匙', '已入住'];
  for (let i = 0; i < houseStatuses.length; i++) {
    await prisma.houseStatusConfig.upsert({
      where: { id: `house-status-${i + 1}` },
      update: {},
      create: { id: `house-status-${i + 1}`, name: houseStatuses[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 9. 预算区间 ==========
  const budgetRanges = [
    { name: '5万以下', minAmount: 0, maxAmount: 50000 },
    { name: '5-8万', minAmount: 50000, maxAmount: 80000 },
    { name: '8-12万', minAmount: 80000, maxAmount: 120000 },
    { name: '12-20万', minAmount: 120000, maxAmount: 200000 },
    { name: '20-30万', minAmount: 200000, maxAmount: 300000 },
    { name: '30万以上', minAmount: 300000, maxAmount: null },
  ];
  for (let i = 0; i < budgetRanges.length; i++) {
    await prisma.budgetRangeConfig.upsert({
      where: { id: `budget-${i + 1}` },
      update: {},
      create: { id: `budget-${i + 1}`, ...budgetRanges[i], sortOrder: i + 1 },
    });
  }

  // ========== 10. 跟进方式 ==========
  const followMethods = ['电话', '微信', '短信', '到店', '量房', '方案沟通', '报价沟通', '活动邀约', '工地参观', '材料确认', '合同沟通', '售后回访'];
  for (let i = 0; i < followMethods.length; i++) {
    await prisma.followUpMethodConfig.upsert({
      where: { id: `follow-method-${i + 1}` },
      update: {},
      create: { id: `follow-method-${i + 1}`, name: followMethods[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 11. 流失原因 ==========
  const churnReasons = ['价格高', '设计不满意', '预算不符', '客户暂缓', '被竞品签走', '服务跟进慢', '客户不信任公司', '付款方式不接受', '材料不满意', '家人反对', '交房延期', '客户失联', '无效资源', '同行', '电话错误', '已装修', '其他'];
  for (let i = 0; i < churnReasons.length; i++) {
    await prisma.churnReasonConfig.upsert({
      where: { id: `churn-${i + 1}` },
      update: {},
      create: { id: `churn-${i + 1}`, name: churnReasons[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 12. 施工节点 ==========
  const constNodes = ['待开工', '水电', '瓦工', '木工', '油漆', '安装', '验收', '已完工'];
  for (let i = 0; i < constNodes.length; i++) {
    await prisma.constructionNodeConfig.upsert({
      where: { id: `const-node-${i + 1}` },
      update: {},
      create: { id: `const-node-${i + 1}`, name: constNodes[i], sortOrder: i + 1, color: '#FA8C16' },
    });
  }

  // ========== 13. 售后状态 ==========
  const asStatuses = ['待处理', '处理中', '已解决', '客户确认'];
  for (let i = 0; i < asStatuses.length; i++) {
    await prisma.afterSalesStatusConfig.upsert({
      where: { id: `as-status-${i + 1}` },
      update: {},
      create: { id: `as-status-${i + 1}`, name: asStatuses[i], sortOrder: i + 1, color: '#1890FF' },
    });
  }

  // ========== 14. 收款方式 ==========
  const paymentMethods = ['现金', '银行转账', '微信', '支付宝'];
  for (let i = 0; i < paymentMethods.length; i++) {
    await prisma.paymentMethodConfig.upsert({
      where: { id: `pay-method-${i + 1}` },
      update: {},
      create: { id: `pay-method-${i + 1}`, name: paymentMethods[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 15. 收款类型 ==========
  const paymentTypes = ['定金', '进度款', '尾款', '增项款'];
  for (let i = 0; i < paymentTypes.length; i++) {
    await prisma.paymentTypeConfig.upsert({
      where: { id: `pay-type-${i + 1}` },
      update: {},
      create: { id: `pay-type-${i + 1}`, name: paymentTypes[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 16. 产品类型 ==========
  const productTypes = ['半包', '全包', '整装', '软装'];
  for (let i = 0; i < productTypes.length; i++) {
    await prisma.productTypeConfig.upsert({
      where: { id: `product-${i + 1}` },
      update: {},
      create: { id: `product-${i + 1}`, name: productTypes[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 17. 套餐类型 ==========
  const packageTypes = ['标准套餐', '舒适套餐', '豪华套餐', '尊享套餐'];
  for (let i = 0; i < packageTypes.length; i++) {
    await prisma.packageTypeConfig.upsert({
      where: { id: `package-${i + 1}` },
      update: {},
      create: { id: `package-${i + 1}`, name: packageTypes[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 18. 售后问题类型 ==========
  const asIssueTypes = ['墙面开裂', '渗水', '电路故障', '水管问题', '地砖松动', '油漆问题', '门窗问题', '其他'];
  for (let i = 0; i < asIssueTypes.length; i++) {
    await prisma.afterSalesIssueTypeConfig.upsert({
      where: { id: `as-issue-${i + 1}` },
      update: {},
      create: { id: `as-issue-${i + 1}`, name: asIssueTypes[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 19. 业务规则默认配置 ==========
  const businessRules = [
    { ruleKey: 'protection.sales_self', ruleName: '销售自拓保护期', ruleValue: { days: 7, minFollowUps: 2 }, description: '销售自己拓展的客户保护期（天）和最少跟进次数' },
    { ruleKey: 'protection.channel', ruleName: '渠道分配保护期', ruleValue: { days: 15, minFollowUps: 1 }, description: '渠道分配客户保护期' },
    { ruleKey: 'protection.ip', ruleName: 'IP分配保护期', ruleValue: { days: 15, minFollowUps: 1 }, description: 'IP部客户保护期' },
    { ruleKey: 'protection.reception', ruleName: '前台录入保护期', ruleValue: { days: 3 }, description: '前台录入客户保护期' },
    { ruleKey: 'protection.referral', ruleName: '转介绍保护期', ruleValue: { days: 30 }, description: '老客户转介绍保护期' },
    { ruleKey: 'reminder.class_a', ruleName: 'A类客户超时提醒', ruleValue: { days: 3 }, description: 'A级客户超时未跟进触发提醒' },
    { ruleKey: 'reminder.class_b', ruleName: 'B类客户超时提醒', ruleValue: { days: 7 }, description: 'B级客户超时未跟进触发提醒' },
    { ruleKey: 'reminder.class_c', ruleName: 'C类客户超时提醒', ruleValue: { days: 15 }, description: 'C级客户超时未跟进触发提醒' },
    { ruleKey: 'collision.phone', ruleName: '撞单检测-手机号', ruleValue: { enabled: true, level: 'HIGH' }, description: '手机号撞单检测' },
    { ruleKey: 'collision.wechat', ruleName: '撞单检测-微信号', ruleValue: { enabled: true, level: 'MEDIUM' }, description: '微信号撞单检测' },
    { ruleKey: 'collision.community', ruleName: '撞单检测-小区+姓名', ruleValue: { enabled: true, level: 'LOW' }, description: '小区名称+姓名撞单检测' },
  ];

  for (const rule of businessRules) {
    await prisma.businessRuleConfig.upsert({
      where: { ruleKey: rule.ruleKey },
      update: {},
      create: { ...rule, updatedById: admin.id },
    });
  }
  console.log('✅ 业务规则配置:', businessRules.length + '条');

  // ========== 20. 系统参数 ==========
  const systemConfigs = [
    { configKey: 'system.name', configValue: '尚格放心装肥西店一体化信息系统', description: '系统名称' },
    { configKey: 'system.footer', configValue: '© 2026 肥西尚格放心装 · 后台管理', description: '页脚版权' },
    { configKey: 'system.defaultPassword', configValue: '123456', description: '新建用户默认密码' },
    { configKey: 'system.jwtExpiresIn', configValue: '24h', description: 'JWT过期时间' },
    { configKey: 'system.fileMaxSize', configValue: '10MB', description: '附件大小限制' },
  ];

  for (const cfg of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { configKey: cfg.configKey },
      update: {},
      create: { ...cfg, updatedById: admin.id },
    });
  }
  console.log('✅ 系统参数:', systemConfigs.length + '条');

  // ========== 21. 创建示例设计师账户 ==========
  const designerHash = await bcrypt.hash('designer123', 10);
  const designer = await prisma.user.upsert({
    where: { phone: '13800000001' },
    update: {},
    create: {
      name: '张设计师',
      phone: '13800000001',
      passwordHash: designerHash,
      role: 'DESIGNER',
      departmentId: 'dept-design',
      isActive: true,
    },
  });
  console.log('✅ 设计师账户: 13800000001 / designer123');

  // ========== 22. 风格偏好 ==========
  const styles = ['现代简约', '欧式', '中式', '简约', '轻奢', '北欧', '美式', '日式', '混搭'];
  for (let i = 0; i < styles.length; i++) {
    await prisma.decorationStyleConfig.upsert({
      where: { id: `style-${i + 1}` },
      update: {},
      create: { id: `style-${i + 1}`, name: styles[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 23. 暂缓原因 ==========
  const postponeReasons = ['交房延期', '资金问题', '家人意见', '方案不满意', '暂时不考虑', '其他'];
  for (let i = 0; i < postponeReasons.length; i++) {
    await prisma.postponeReasonConfig.upsert({
      where: { id: `postpone-${i + 1}` },
      update: {},
      create: { id: `postpone-${i + 1}`, name: postponeReasons[i], isActive: true, sortOrder: i + 1 },
    });
  }

  // ========== 24. 费用类型 ==========
  const expenseTypes = ['材料费', '人工费', '营销费', '办公费', '差旅费', '其他'];
  for (let i = 0; i < expenseTypes.length; i++) {
    await prisma.expenseTypeConfig.upsert({
      where: { id: `expense-${i + 1}` },
      update: {},
      create: { id: `expense-${i + 1}`, name: expenseTypes[i], isActive: true, sortOrder: i + 1 },
    });
  }

  console.log('');
  console.log('🎉 数据库初始化完成！');
  console.log('');
  console.log('📋 登录信息:');
  console.log('   管理员: 13900000000 / admin123');
  console.log('   设计师: 13800000001 / designer123');
  console.log('');
  console.log('📂 数据库: shangge_db @ localhost:5432');
  console.log('🌐 API文档: http://localhost:3000/docs');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
