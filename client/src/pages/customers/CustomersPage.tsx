import { useState, useEffect } from 'react';
import {
  Table, Button, Space, Input, Select, Tag, Typography, Card,
  Modal, message, Popconfirm, Drawer, Descriptions, Timeline,
  Steps, Divider, Badge, Row, Col,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, PhoneOutlined, UserOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { customerApi, dictApi, userApi } from '../../services/auth';

const { Title, Text } = Typography;
const { confirm } = Modal;

const STAGE_COLORS: Record<string, string> = {
  LEAD: 'default', CONTACTED: 'processing', QUALIFIED: 'success',
  INVITED: 'warning', VISITED: 'warning', MEASURED: 'warning',
  DESIGNING: 'purple', QUOTED: 'cyan', NEGOTIATING: 'magenta',
  SIGNED: 'success', LOST: 'error', POSTPONED: 'default',
};

const STAGE_LABELS: Record<string, string> = {
  LEAD: '新线索', CONTACTED: '已联系', QUALIFIED: '有效客户',
  INVITED: '已邀约', VISITED: '已进店', MEASURED: '已量房',
  DESIGNING: '方案中', QUOTED: '已报价', NEGOTIATING: '谈单中',
  SIGNED: '已签约', TO_CONSTRUCTION: '已转施工', CONSTRUCTING: '施工中',
  COMPLETED: '已完工', AFTER_SALES: '售后中', LOST: '已流失',
  POSTPONED: '暂缓', REFERRAL_READY: '可转介绍',
};

const INTENT_COLORS: Record<string, string> = {
  A: 'red', B: 'orange', C: 'blue', D: 'default',
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 筛选
  const [keyword, setKeyword] = useState('');
  const [stage, setStage] = useState<string | undefined>();
  const [intentLevel, setIntentLevel] = useState<string | undefined>();
  const [source, setSource] = useState<string | undefined>();

  // 字典
  const [sources, setSources] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);

  // 详情抽屉
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // 分配抽屉
  const [assignVisible, setAssignVisible] = useState(false);
  const [assigningCustomer, setAssigningCustomer] = useState<any>(null);

  useEffect(() => {
    dictApi.get('customerSources').then((r: any) => setSources(r)).catch(() => {});
    userApi.getDesigners().then((r: any) => setDesigners(r)).catch(() => {});
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res: any = await customerApi.list({
        skip: (page - 1) * pageSize,
        take: pageSize,
        keyword: keyword || undefined,
        stage,
        intentLevel,
        source,
      });
      setCustomers(res.customers);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, stage, intentLevel, source]);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    await customerApi.delete(id);
    message.success('删除成功');
    fetchCustomers();
  };

  const handleAssign = async (customerId: string, toOwnerId: string) => {
    await customerApi.assign(customerId, toOwnerId);
    message.success('分配成功');
    setAssignVisible(false);
    fetchCustomers();
  };

  const openDetail = async (id: string) => {
    const customer = await customerApi.get(id);
    setSelectedCustomer(customer);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '客户姓名',
      dataIndex: 'name',
      width: 120,
      render: (name: string, row: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.phone}</Text>
        </Space>
      ),
    },
    {
      title: '意向等级',
      dataIndex: 'intentLevel',
      width: 80,
      render: (v: string) => <Tag color={INTENT_COLORS[v]}>{v || 'C'}</Tag>,
    },
    {
      title: '客户阶段',
      dataIndex: 'stage',
      width: 120,
      render: (v: string) => (
        <Tag color={STAGE_COLORS[v]}>{STAGE_LABELS[v] || v}</Tag>
      ),
    },
    {
      title: '小区',
      dataIndex: 'communityName',
      width: 140,
      ellipsis: true,
      render: (v: string) => <Text type="secondary">{v || '-'}</Text>,
    },
    {
      title: '面积',
      dataIndex: 'houseArea',
      width: 80,
      render: (v: number) => v ? <span className="font-numbers">{v}m²</span> : '-',
    },
    {
      title: '预算',
      dataIndex: 'budgetRange',
      width: 100,
      render: (v: string) => <Text type="secondary">{v || '-'}</Text>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 120,
      ellipsis: true,
      render: (v: string) => <Text type="secondary">{v || '-'}</Text>,
    },
    {
      title: '设计师',
      dataIndex: 'designOwner',
      width: 100,
      render: (v: any) => v?.name || '-',
    },
    {
      title: '最后跟进',
      dataIndex: 'lastFollowUpAt',
      width: 110,
      render: (v: string) => v ? dayjs(v).format('MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => openDetail(row.id)} />
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => navigate(`/customers/${row.id}/edit`)} />
          <Button size="small" type="text" icon={<UserOutlined />} onClick={() => { setAssigningCustomer(row); setAssignVisible(true); }} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>客户管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/customers/new')}
        >
          新建客户
        </Button>
      </div>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size={12}>
          <Input
            placeholder="搜索姓名/手机/小区"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Select
            placeholder="阶段"
            style={{ width: 130 }}
            allowClear
            value={stage}
            onChange={(v) => { setStage(v); setPage(1); }}
            options={Object.entries(STAGE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Select
            placeholder="意向等级"
            style={{ width: 100 }}
            allowClear
            value={intentLevel}
            onChange={(v) => { setIntentLevel(v); setPage(1); }}
            options={[
              { value: 'A', label: <><Tag color="red">A</Tag> 高意向</> },
              { value: 'B', label: <><Tag color="orange">B</Tag> 中意向</> },
              { value: 'C', label: <><Tag color="blue">C</Tag> 低意向</> },
              { value: 'D', label: <><Tag>D</Tag> 无效</> },
            ]}
          />
          <Select
            placeholder="来源"
            style={{ width: 140 }}
            allowClear
            value={source}
            onChange={(v) => { setSource(v); setPage(1); }}
            options={sources.map((s) => ({ value: s.name, label: s.name }))}
          />
          <Button type="primary" onClick={handleSearch}>查询</Button>
          <Button onClick={() => { setKeyword(''); setStage(undefined); setIntentLevel(undefined); setSource(undefined); setPage(1); }}>重置</Button>
          <Text type="secondary" style={{ marginLeft: 8 }}>共 {total} 条</Text>
        </Space>
      </Card>

      {/* 表格 */}
      <div className="card" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </div>

      {/* 客户详情抽屉 */}
      <Drawer
        title={
          <Space>
            <UserOutlined />
            <span>{selectedCustomer?.name}</span>
            <Tag color={STAGE_COLORS[selectedCustomer?.stage]}>
              {STAGE_LABELS[selectedCustomer?.stage]}
            </Tag>
          </Space>
        }
        placement="right"
        width={640}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {selectedCustomer && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="手机号">{selectedCustomer.phone}</Descriptions.Item>
              <Descriptions.Item label="意向">{<Tag color={INTENT_COLORS[selectedCustomer.intentLevel]}>{selectedCustomer.intentLevel}</Tag>}</Descriptions.Item>
              <Descriptions.Item label="小区">{selectedCustomer.communityName || '-'}</Descriptions.Item>
              <Descriptions.Item label="户型">{selectedCustomer.houseType || '-'}</Descriptions.Item>
              <Descriptions.Item label="面积">{selectedCustomer.houseArea ? `${selectedCustomer.houseArea}m²` : '-'}</Descriptions.Item>
              <Descriptions.Item label="预算">{selectedCustomer.budgetRange || selectedCustomer.expectedBudget ? `${selectedCustomer.budgetRange || ''} ${selectedCustomer.expectedBudget ? '≈' + selectedCustomer.expectedBudget + '元' : ''}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="来源">{selectedCustomer.source || '-'}</Descriptions.Item>
              <Descriptions.Item label="设计师">{selectedCustomer.designOwner?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="录入人">{selectedCustomer.createdBy?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{dayjs(selectedCustomer.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="最近跟进">{selectedCustomer.lastFollowUpAt ? dayjs(selectedCustomer.lastFollowUpAt).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedCustomer.remark || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">最近跟进</Divider>
            {selectedCustomer.followUps?.length > 0 ? (
              <Timeline
                items={selectedCustomer.followUps.map((f: any) => ({
                  color: '#FA8C16',
                  children: (
                    <div>
                      <Space>
                        <Tag>{f.method}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(f.followUpAt).format('MM-DD HH:mm')}</Text>
                        <Text type="secondary">by {f.follower?.name}</Text>
                      </Space>
                      <div style={{ marginTop: 4, color: '#262626' }}>{f.content}</div>
                      {f.nextAction && <div style={{ marginTop: 4, fontSize: 12, color: '#FA8C16' }}>→ {f.nextAction}</div>}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">暂无跟进记录</Text>
            )}

            <Divider orientation="left">阶段变更</Divider>
            {selectedCustomer.stageLogs?.length > 0 ? (
              <Timeline
                items={selectedCustomer.stageLogs.map((log: any) => ({
                  color: '#52C41A',
                  children: (
                    <div>
                      <Space>
                        <Tag color={STAGE_COLORS[log.fromStage]}>{STAGE_LABELS[log.fromStage] || log.fromStage}</Tag>
                        <span>→</span>
                        <Tag color={STAGE_COLORS[log.toStage]}>{STAGE_LABELS[log.toStage] || log.toStage}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(log.createdAt).format('MM-DD HH:mm')}</Text>
                      </Space>
                      {log.remark && <div style={{ fontSize: 12, color: '#8C8C8C', marginTop: 2 }}>{log.remark}</div>}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">暂无阶段变更记录</Text>
            )}
          </div>
        )}
      </Drawer>

      {/* 分配抽屉 */}
      <Drawer
        title="分配设计师"
        placement="right"
        width={400}
        open={assignVisible}
        onClose={() => setAssignVisible(false)}
      >
        {assigningCustomer && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">当前客户：</Text>
              <Text strong>{assigningCustomer.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>{assigningCustomer.phone}</Text>
            </div>
            <Select
              placeholder="选择设计师"
              style={{ width: '100%', marginBottom: 16 }}
              options={designers.map((d: any) => ({ value: d.id, label: `${d.name} (${d.department?.name || ''})` }))}
              onChange={(value) => handleAssign(assigningCustomer.id, value)}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
