import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Tag, Space, Button, Timeline, Card, Typography, Spin, message, Modal } from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SwapOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { customerApi, followUpApi, appointmentApi, dictApi } from '../../services/auth';

const { Title, Text } = Typography;

const STAGE_COLORS: Record<string, string> = {
  LEAD: 'default', CONTACTED: 'processing', QUALIFIED: 'success',
  INVITED: 'warning', VISITED: 'warning', MEASURED: 'warning',
  DESIGNING: 'purple', QUOTED: 'cyan', NEGOTIATING: 'magenta',
  SIGNED: 'success', LOST: 'error',
};

const STAGE_LABELS: Record<string, string> = {
  LEAD: '新线索', CONTACTED: '已联系', QUALIFIED: '有效客户',
  INVITED: '已邀约', VISITED: '已进店', MEASURED: '已量房',
  DESIGNING: '方案中', QUOTED: '已报价', NEGOTIATING: '谈单中',
  SIGNED: '已签约', LOST: '已流失',
};

const STAGES_ORDER = ['LEAD', 'CONTACTED', 'QUALIFIED', 'INVITED', 'VISITED', 'MEASURED', 'DESIGNING', 'QUOTED', 'NEGOTIATING', 'SIGNED'];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageModalVisible, setStageModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      customerApi.get(id),
      followUpApi.list(id),
      appointmentApi.list(id),
      dictApi.get('customerStages'),
    ]).then(([c, f, a, s]: any) => {
      setCustomer(c);
      setFollowUps(f);
      setAppointments(a);
      setStages(s);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleStageChange = async (toStage: string) => {
    if (!id) return;
    try {
      await customerApi.stageTransition(id, toStage, '');
      message.success('阶段变更成功');
      const updated = await customerApi.get(id);
      setCustomer(updated);
      setStageModalVisible(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || '阶段变更失败');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  if (!customer) return null;

  const currentStageIdx = STAGES_ORDER.indexOf(customer.stage);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')} />
          <Title level={4} style={{ margin: 0 }}>{customer.name}</Title>
          <Tag color={STAGE_COLORS[customer.stage]} style={{ fontSize: 14 }}>
            {STAGE_LABELS[customer.stage] || customer.stage}
          </Tag>
          <Tag color={customer.intentLevel === 'A' ? 'red' : customer.intentLevel === 'B' ? 'orange' : 'blue'}>
            {customer.intentLevel || 'C'}级
          </Tag>
        </Space>
        <Space>
          <Button icon={<SwapOutlined />} onClick={() => setStageModalVisible(true)}>变更阶段</Button>
          <Button icon={<EditOutlined />} type="primary" onClick={() => navigate(`/customers/${id}/edit`)}>编辑</Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
        {/* 左侧信息 */}
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div className="card">
            <Title level={5} style={{ marginBottom: 16 }}>基本信息</Title>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="手机号">{customer.phone}</Descriptions.Item>
              <Descriptions.Item label="微信">{customer.wechat || '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">{customer.gender || '-'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{customer.age || '-'}</Descriptions.Item>
              <Descriptions.Item label="小区">{customer.communityName || '-'}</Descriptions.Item>
              <Descriptions.Item label="户型">{customer.houseType || '-'}</Descriptions.Item>
              <Descriptions.Item label="面积">{customer.houseArea ? `${customer.houseArea}m²` : '-'}</Descriptions.Item>
              <Descriptions.Item label="装修类型">{customer.renovationType || '-'}</Descriptions.Item>
              <Descriptions.Item label="预算区间">{customer.budgetRange || '-'}</Descriptions.Item>
              <Descriptions.Item label="风格偏好">{customer.decorationStyle || '-'}</Descriptions.Item>
              <Descriptions.Item label="客户来源">{customer.source || '-'}</Descriptions.Item>
              <Descriptions.Item label="录入人">{customer.createdBy?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="设计师">{customer.designOwner?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="录入时间">{dayjs(customer.createdAt).format('YYYY-MM-DD')}</Descriptions.Item>
            </Descriptions>
          </div>

          {/* 跟进记录 */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>跟进记录</Title>
            </div>
            {followUps.length > 0 ? (
              <Timeline
                items={followUps.slice(0, 10).map((f: any) => ({
                  color: '#FA8C16',
                  children: (
                    <div>
                      <Space>
                        <Tag>{f.method}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(f.followUpAt).format('MM-DD HH:mm')}</Text>
                        <Text type="secondary">by {f.follower?.name}</Text>
                      </Space>
                      <div style={{ marginTop: 4 }}>{f.content}</div>
                      {f.nextAction && <Text type="secondary" style={{ fontSize: 12 }}>→ {f.nextAction}</Text>}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">暂无跟进记录</Text>
            )}
          </div>
        </Space>

        {/* 右侧时间线 */}
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* 阶段进度 */}
          <div className="card">
            <Title level={5} style={{ marginBottom: 16 }}>转化进度</Title>
            <Steps
              direction="vertical"
              size="small"
              current={currentStageIdx >= 0 ? currentStageIdx : 0}
              items={STAGES_ORDER.map((s) => ({
                title: STAGE_LABELS[s] || s,
                status: customer.stage === s ? 'process' : (STAGES_ORDER.indexOf(customer.stage) > STAGES_ORDER.indexOf(s) ? 'finish' : 'wait'),
                icon: customer.stage === s ? <ClockCircleOutlined style={{ color: '#FA8C16' }} /> : undefined,
              }))}
            />
          </div>

          {/* 预约记录 */}
          <div className="card">
            <Title level={5} style={{ marginBottom: 16 }}>预约记录</Title>
            {appointments.length > 0 ? (
              appointments.map((a: any) => (
                <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
                  <Space>
                    <Text strong>{dayjs(a.appointmentTime).format('MM-DD HH:mm')}</Text>
                    <Tag color={a.isArrived ? 'success' : 'default'}>{a.isArrived ? '已到店' : '未到店'}</Tag>
                  </Space>
                  <div style={{ fontSize: 12, color: '#8C8C8C', marginTop: 2 }}>
                    邀约人: {a.inviter?.name} {a.host ? `→ 接待: ${a.host.name}` : ''}
                  </div>
                </div>
              ))
            ) : (
              <Text type="secondary">暂无预约记录</Text>
            )}
          </div>
        </Space>
      </div>

      {/* 阶段变更弹窗 */}
      <Modal
        title="变更客户阶段"
        open={stageModalVisible}
        onCancel={() => setStageModalVisible(false)}
        footer={null}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          {STAGES_ORDER.map((s) => (
            <Button
              key={s}
              type={customer.stage === s ? 'primary' : 'default'}
              disabled={customer.stage === s}
              onClick={() => handleStageChange(s)}
              style={{ textAlign: 'center' }}
            >
              {STAGE_LABELS[s]}
            </Button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
