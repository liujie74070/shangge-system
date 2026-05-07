# 尚格放心装肥西店一体化信息系统

## 项目概述

为企业装修公司开发的全链路信息化系统，覆盖 **获客→转化→交付→财务→售后→经营分析**。

## 技术栈

| 层 | 选型 |
|---|------|
| 前端 | React 18 + TypeScript + Ant Design 5 + ECharts + React Router |
| 后端 | Node.js + NestJS + Prisma ORM |
| 数据库 | PostgreSQL |
| 认证 | JWT + Passport (NestJS) |

## 快速启动

### 1. 启动数据库
```bash
cd shangge-system
docker-compose up -d
```

### 2. 安装后端依赖并迁移数据库
```bash
cd server
npm install

# 创建数据库表
npx prisma migrate dev --name init

# 填充初始数据（管理员、字典数据）
npx prisma db seed
```

### 3. 启动后端
```bash
npm run start:dev
# API 运行在 http://localhost:3001
# Swagger 文档: http://localhost:3001/docs
```

### 4. 安装前端依赖并启动
```bash
cd ../client
npm install
npm run dev
# 前端运行在 http://localhost:8080
```

### 5. 根目录启动（同时运行前后端）
```bash
npm run dev
```

## 登录信息

| 账号 | 密码 | 角色 |
|------|------|------|
| 13900000000 | admin123 | 管理员/总经理 |
| 13800000001 | designer123 | 设计师 |

## 功能模块

### 第一阶段 MVP (当前)
- ✅ 用户认证 (JWT + RBAC 9角色)
- ✅ 客户管理 (CRUD + 撞单检测 + 阶段流转 + 分配)
- ✅ 跟进记录 + 今日待办
- ✅ 预约管理 + 到店记录
- ✅ 量房记录
- ✅ 方案与报价
- ✅ 合同管理 + 收款登记
- ✅ 流失管理
- ✅ 转介绍管理
- ✅ 数据看板 (KPI + 漏斗 + 趋势图)
- ✅ 系统配置中心 (32张字典表 + 业务规则)
- ✅ 用户管理 + 部门管理

### 第二阶段 (待开发)
- [ ] 施工管理 (8节点 + 验收 + 巡检)
- [ ] 费用审批 + 利润分析
- [ ] 售后完善 + 满意度回访
- [ ] OA审批流引擎
- [ ] 任务 + 公告 + 考勤
- [ ] 营销活动 + 渠道管理
- [ ] 设计审批流程

### 第三阶段 (待开发)
- [ ] 采购管理 + 供应商
- [ ] 库存管理
- [ ] 绩效提成核算
- [ ] ROI 分析深化
- [ ] 多门店支持

## 项目结构

```
shangge-system/
├── docker-compose.yml
├── package.json              # 根目录 monorepo 脚本
├── server/
│   ├── prisma/
│   │   ├── schema.prisma     # 数据库 Schema (35张表)
│   │   └── seed.ts           # 初始化数据
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── prisma.service.ts
│       └── modules/
│           ├── auth/          # JWT认证 + 登录
│           ├── users/         # 用户CRUD
│           ├── departments/   # 部门管理
│           ├── stores/        # 门店管理
│           ├── config/        # 配置中心 (32字典表)
│           ├── customers/     # 客户CRM核心
│           ├── follow-ups/    # 跟进记录
│           ├── appointments/  # 预约管理
│           ├── visits/        # 到店记录
│           ├── measurements/  # 量房记录
│           ├── proposals/     # 方案与报价
│           ├── contracts/     # 合同管理
│           ├── payments/      # 收款管理
│           ├── churns/        # 流失管理
│           ├── constructions/ # 施工管理
│           ├── after-sales/   # 售后管理
│           ├── referrals/      # 转介绍管理
│           ├── dashboard/     # 数据看板
│           ├── upload/         # 文件上传
│           ├── activity-log/  # 操作日志
│           └── notifications/ # 消息通知
└── client/
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx            # 路由配置
        ├── theme/             # 样式 + CSS变量
        ├── services/          # API 调用
        ├── components/layout/ # 主框架布局
        └── pages/             # 页面组件
```

## 角色权限说明

| 角色 | 数据范围 | 核心权限 |
|------|----------|----------|
| 总经理 (GM) | 全公司 | 全部权限 |
| 副总 (VP) | 全公司 | 业务字典 + 规则 |
| 事业部总监 | 本事业部 | 本部门管理 |
| 市场经理 | 市场部 | 渠道 + 邀约数据 |
| 设计经理 | 设计部 | 设计师 + 转化数据 |
| 销售 | 仅自己 | 录入 + 跟进 |
| 设计师 | 分配客户 | 量房→方案→报价→签单 |
| 客服 | 基础字段 | 录入 + 预约 |
| 财务 | 签约客户 | 收款 + 报表 |
| 项目经理 | 施工客户 | 施工进度管理 |

## 设计说明

- **UI风格**: Swiss Modernism 2.0 + Flat Design
- **主色调**: 橙色 (#FA8C16)
- **字体**: Noto Sans SC (中文) + Inter (数字)
- **响应式**: 桌面端侧边栏 + 移动端底部Tab
