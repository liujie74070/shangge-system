import { useState, useEffect } from 'react';
import {
  Table, Card, Space, Input, Select, Tag, Typography, Button,
  Modal, Form, DatePicker, InputNumber, message, Row, Col, Drawer,
  Descriptions, Timeline, Spin,
} from 'antd';
import { SearchOutlined, FileTextOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contractApi, customerApi } from '../../services/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  '未收款': 'default', '已收定金': 'processing',
  '部分收款': 'warning', '已收齐': 'success',
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res: any = await contractApi.list({ skip: (page - 1) * pageSize, take: pageSize, paymentStatus, keyword });
      setContracts(res.contracts);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, [page, pageSize, paymentStatus]);

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      width: 160,
      render: (v: string) => <Text code style={{ fontSize: 12 }}>{v || '待编号'}</Text>,
    },
    {
      title: '客户姓名',
      render: (_: any, row: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.customer?.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.customer?.phone}</Text>
        </Space>
      ),
    },
    {
      title: '小区',
      dataIndex: ['customer', 'communityName'],
      width: 120,
      ellipsis: true,
      render: (v: string) => <Text type="secondary">{v || '-'}</Text>,
    },
    {
      title: '房屋面积',
      dataIndex: 'houseArea',
      width: 100,
      render: (v: number) => v ? <span className="font-numbers">{v}m²</span> : '-',
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      width: 120,
      render: (v: number) => <Text strong className="font-numbers">{v?.toLocaleString() || 0}</Text>,
    },
    {
      title: '已收款',
      dataIndex: 'receivedAmount',
      width: 100,
      render: (v: number) => <Text type="secondary" className="font-numbers">{v?.toLocaleString() || 0}</Text>,
    },
    {
      title: '未收款',
      dataIndex: 'unpaidAmount',
      width: 100,
      render: (v: number) => <Text type="danger" className="font-numbers">{v?.toLocaleString() || 0}</Text>,
    },
    {
      title: '收款状态',
      dataIndex: 'paymentStatus',
      width: 100,
      render: (v: string) => <Tag color={PAYMENT_STATUS_COLORS[v] || 'default'}>{v}</Tag>,
    },
    {
      title: '签约时间',
      dataIndex: 'signedAt',
      width: 110,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, row: any) => (
        <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => { setSelected(row); setDetailVisible(true); }} />
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>合同管理</Title>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索客户/合同号"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={fetchContracts}
            allowClear
          />
          <Select
            placeholder="收款状态"
            style={{ width: 130 }}
            allowClear
            value={paymentStatus}
            onChange={(v) => { setPaymentStatus(v); setPage(1); }}
            options={[
              { value: '未收款', label: '未收款' },
              { value: '已收定金', label: '已收定金' },
              { value: '部分收款', label: '部分收款' },
              { value: '已收齐', label: '已收齐' },
            ]}
          />
          <Button type="primary" onClick={fetchContracts}>查询</Button>
          <Text type="secondary" style={{ marginLeft: 8 }}>共 {total} 份合同</Text>
        </Space>
      </Card>

      <div className="card" style={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page, pageSize, total,
            showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </div>

      {/* 合同详情 */}
      <Drawer
        title={<Space><FileTextOutlined /> 合同详情</Space>}
        placement="right"
        width={560}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {selected && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="合同编号" span={2}><Text code>{selected.contractNo || '待编号'}</Text></Descriptions.Item>
              <Descriptions.Item label="客户姓名">{selected.customer?.name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selected.customer?.phone}</Descriptions.Item>
              <Descriptions.Item label="小区">{selected.customer?.communityName || '-'}</Descriptions.Item>
              <Descriptions.Item label="面积">{selected.houseArea ? `${selected.houseArea}m²` : '-'}</Descriptions.Item>
              <Descriptions.Item label="合同金额" style={{ color: '#FA8C16' }}>
                <Text strong className="font-numbers">{selected.contractAmount?.toLocaleString()}</Text> 元
              </Descriptions.Item>
              <Descriptions.Item label="已收款">
                <Text className="font-numbers">{selected.receivedAmount?.toLocaleString()}</Text> 元
              </Descriptions.Item>
              <Descriptions.Item label="未收款">
                <Text type="danger" className="font-numbers">{selected.unpaidAmount?.toLocaleString()}</Text> 元
              </Descriptions.Item>
              <Descriptions.Item label="收款状态">
                <Tag color={PAYMENT_STATUS_COLORS[selected.paymentStatus]}>{selected.paymentStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="产品类型">{selected.productType || '-'}</Descriptions.Item>
              <Descriptions.Item label="套餐类型">{selected.packageType || '-'}</Descriptions.Item>
              <Descriptions.Item label="签约时间">{selected.signedAt ? dayjs(selected.signedAt).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
              <Descriptions.Item label="设计师">{selected.customer?.designOwner?.name || '-'}</Descriptions.Item>
            </Descriptions>

            {selected.payments?.length > 0 && (
              <>
                <Divider orientation="left">收款记录</Divider>
                <Timeline
                  items={selected.payments.map((p: any) => ({
                    color: '#52C41A',
                    children: (
                      <div>
                        <Space>
                          <Text strong className="font-numbers">{p.amount?.toLocaleString()}</Text>元
                          <Tag>{p.type}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(p.paidAt).format('MM-DD HH:mm')}</Text>
                        </Space>
                        <div style={{ fontSize: 12, color: '#8C8C8C' }}>
                          方式: {p.method} · 登记人: {p.recordedBy?.name}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
