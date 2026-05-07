import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Spin, Select, DatePicker, Table, Tag } from 'antd';
import {
  TeamOutlined, FileTextOutlined, DollarOutlined, RiseOutlined,
  FallOutlined, TrophyOutlined, WarningOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { dashboardApi } from '../../services/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const formatCurrency = (v: number) => {
  if (v >= 10000) return (v / 10000).toFixed(1) + '万';
  return v?.toLocaleString() || '0';
};

const STAGE_COLORS: Record<string, string> = {
  LEAD: '#8C8C8C', CONTACTED: '#1890FF', QUALIFIED: '#52C41A',
  INVITED: '#FA8C16', VISITED: '#FA8C16', MEASURED: '#D46B08',
  DESIGNING: '#722ED1', QUOTED: '#13C2C2', NEGOTIATING: '#EB2F96',
  SIGNED: '#52C41A', LOST: '#FF4D4F',
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.overview(),
      dashboardApi.funnel(),
      dashboardApi.signedTrend(6),
    ]).then(([ov, fn, tr]) => {
      setOverview(ov);
      setFunnel(fn);
      setTrend(tr);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 漏斗图配置
  const funnelOption = funnel ? {
    tooltip: { trigger: 'item' },
    color: ['#FA8C16', '#FF9A2E', '#FFB74D', '#FFD180', '#FFE0B2', '#FFF7E6'],
    series: [{
      type: 'funnel',
      left: '10%', top: 20, bottom: 20, right: '10%',
      min: 0, max: funnel.counts[0] || 1,
      minSize: '15%',
      maxSize: '100%',
      sort: 'descending',
      gap: 4,
      label: { show: true, position: 'inside', formatter: '{b}: {c}', color: '#fff', fontSize: 12 },
      itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
      data: funnel.counts.map((count: number, i: number) => ({
        value: count, name: funnel.labels[i],
        itemStyle: { color: ['#8C8C8C', '#1890FF', '#52C41A', '#FA8C16', '#FF9A2E', '#FFB74D', '#D46B08', '#13C2C2', '#EB2F96', '#52C41A'][i] },
      })),
    }],
  } : {};

  // 趋势图配置
  const trendOption = trend.length > 0 ? {
    tooltip: { trigger: 'axis' },
    legend: { data: ['签单数', '签单金额(万)'], bottom: 0 },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: trend.map((t: any) => t.month), axisLabel: { fontSize: 12 } },
    yAxis: [
      { type: 'value', name: '签单数', axisLabel: { fontSize: 12 } },
      { type: 'value', name: '金额(万)', axisLabel: { fontSize: 12 } },
    ],
    series: [
      {
        name: '签单数', type: 'bar',
        data: trend.map((t: any) => t.count),
        itemStyle: { color: '#FA8C16', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '签单金额(万)', type: 'line', yAxisIndex: 1,
        data: trend.map((t: any) => +(t.amount / 10000).toFixed(2)),
        itemStyle: { color: '#1890FF' },
        smooth: true,
      },
    ],
  } : {};

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>经营看板</Title>
        <Space>
          <Select defaultValue="month" style={{ width: 120 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="quarter">本季度</Select.Option>
            <Select.Option value="year">本年</Select.Option>
          </Select>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            label: '总线索', value: overview?.totalCustomers || 0,
            icon: <TeamOutlined style={{ color: '#1890FF', fontSize: 24 }} />,
            color: '#1890FF', bg: '#E6F4FF',
          },
          {
            label: '活跃客户', value: overview?.activeCustomers || 0,
            icon: <ClockCircleOutlined style={{ color: '#FA8C16', fontSize: 24 }} />,
            color: '#FA8C16', bg: '#FFF7E6',
          },
          {
            label: '已签约', value: overview?.signedCustomers || 0,
            icon: <TrophyOutlined style={{ color: '#52C41A', fontSize: 24 }} />,
            color: '#52C41A', bg: '#F6FFED',
          },
          {
            label: '已流失', value: overview?.lostCustomers || 0,
            icon: <WarningOutlined style={{ color: '#FF4D4F', fontSize: 24 }} />,
            color: '#FF4D4F', bg: '#FFF2F0',
          },
          {
            label: '签单总额', value: formatCurrency(overview?.totalSignedAmount || 0),
            icon: <DollarOutlined style={{ color: '#722ED1', fontSize: 24 }} />,
            color: '#722ED1', bg: '#F9F0FF',
          },
          {
            label: '回款金额', value: formatCurrency(overview?.totalReceivedAmount || 0),
            icon: <RiseOutlined style={{ color: '#13C2C2', fontSize: 24 }} />,
            color: '#13C2C2', bg: '#E6FFFB',
          },
        ].map((kpi, i) => (
          <Col xs={12} sm={8} lg={4} key={i}>
            <div className="kpi-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: kpi.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {kpi.icon}
              </div>
              <div>
                <div className="kpi-value" style={{ color: kpi.color, fontSize: 22 }}>{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <div className="card">
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>转化漏斗</Text>
            {funnel && funnel.counts[0] > 0 ? (
              <ReactECharts option={funnelOption} style={{ height: 320 }} />
            ) : (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8C8C' }}>
               暂无数据
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="card">
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>签单业绩趋势</Text>
            {trend.length > 0 ? (
              <ReactECharts option={trendOption} style={{ height: 320 }} />
            ) : (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8C8C' }}>
                暂无数据
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* 阶段分布 */}
      <div className="card">
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>客户阶段分布</Text>
        <Row gutter={[8, 8]}>
          {funnel?.labels?.map((label: string, i: number) => {
            const count = funnel?.counts?.[i] || 0;
            const total = funnel?.counts?.[0] || 1;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
            return (
              <Col xs={12} sm={8} lg={4} key={i}>
                <div style={{ padding: '12px 16px', background: '#FAFAFA', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
                    <Tag color={STAGE_COLORS[funnel.stages[i]]} style={{ margin: 0 }}>{count}</Tag>
                  </div>
                  <div style={{ background: '#E8E8E8', borderRadius: 4, height: 4 }}>
                    <div
                      style={{
                        width: `${pct}%`, height: '100%', borderRadius: 4,
                        background: STAGE_COLORS[funnel.stages[i]] || '#8C8C8C',
                        transition: 'width 600ms ease-out',
                      }}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>{pct}%</Text>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
}
