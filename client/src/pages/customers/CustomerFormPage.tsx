import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, DatePicker, Button, Card, Row, Col,
  Typography, Space, message, Alert, Divider, Spin,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { customerApi, dictApi, userApi } from '../../services/auth';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STAGE_COLORS: Record<string, string> = {
  LEAD: '新线索', CONTACTED: '已联系', QUALIFIED: '有效客户',
  INVITED: '已邀约', VISITED: '已进店', MEASURED: '已量房',
  DESIGNING: '方案中', QUOTED: '已报价', NEGOTIATING: '谈单中',
  SIGNED: '已签约', LOST: '已流失', POSTPONED: '暂缓',
};

export default function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [collision, setCollision] = useState<any>(null);
  const [showCollision, setShowCollision] = useState(false);

  const [sources, setSources] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [renoTypes, setRenoTypes] = useState<any[]>([]);
  const [houseStatuses, setHouseStatuses] = useState<any[]>([]);
  const [budgetRanges, setBudgetRanges] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);

  const isEdit = !!id;

  useEffect(() => {
    Promise.all([
      dictApi.get('customerSources'),
      dictApi.get('customerStages'),
      dictApi.get('intentLevels'),
      dictApi.get('renovationTypes'),
      dictApi.get('houseStatuses'),
      dictApi.get('budgetRanges'),
      dictApi.get('decorationStyles'),
      userApi.getDesigners(),
    ]).then(([s, st, i, r, h, b, ds, d]: any) => {
      setSources(s);
      setStages(st);
      setIntents(i);
      setRenoTypes(r);
      setHouseStatuses(h);
      setBudgetRanges(b);
      setStyles(ds);
      setDesigners(d);
    });

    if (id) {
      customerApi.get(id).then((c: any) => {
        form.setFieldsValue({
          ...c,
          decorationTime: c.decorationTime ? dayjs(c.decorationTime) : null,
        });
      }).finally(() => setFetching(false));
    }
  }, [id]);

  const handlePhoneBlur = async (e: any) => {
    const phone = e.target.value;
    if (!phone || phone.length < 11) return;
    try {
      const result: any = await customerApi.checkCollision({ phone });
      if (result.level !== 'NONE') {
        setCollision(result);
        setShowCollision(true);
      }
    } catch {}
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        decorationTime: values.decorationTime?.toISOString(),
      };
      if (isEdit) {
        await customerApi.update(id!, data);
        message.success('保存成功');
      } else {
        await customerApi.create(data);
        message.success('创建成功');
      }
      navigate('/customers');
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')} />
          <Title level={4} style={{ margin: 0 }}>{isEdit ? '编辑客户' : '新建客户'}</Title>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          保存
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ intentLevel: 'C', stage: 'LEAD' }}
      >
        <Row gutter={16}>
          {/* 基本信息 */}
          <Col xs={24} lg={12}>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="name" label="客户姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                    ]}
                  >
                    <Input placeholder="请输入手机号" onBlur={handlePhoneBlur} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="性别">
                    <Select placeholder="请选择" allowClear>
                      <Select.Option value="男">男</Select.Option>
                      <Select.Option value="女">女</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="age" label="年龄">
                    <Input type="number" placeholder="年龄" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="wechat" label="微信号">
                    <Input placeholder="请输入微信号" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="idNumber" label="身份证号">
                    <Input placeholder="选填" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="intentLevel" label="意向等级">
                <Select placeholder="请选择">
                  {intents.map((i) => (
                    <Select.Option key={i.id} value={i.name}>
                      <span style={{ color: i.color, fontWeight: 600 }}>{i.name}</span>级
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="source" label="客户来源">
                <Select placeholder="请选择来源" allowClear>
                  {sources.map((s) => (
                    <Select.Option key={s.id} value={s.name}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="remark" label="备注">
                <TextArea rows={3} placeholder="备注信息" />
              </Form.Item>
            </Card>
          </Col>

          {/* 房屋信息 */}
          <Col xs={24} lg={12}>
            <Card title="房屋信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="communityName" label="小区名称">
                    <Input placeholder="请输入小区名称" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="houseAddress" label="房屋地址">
                    <Input placeholder="栋/单元/门牌号" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="houseType" label="户型">
                    <Input placeholder="如: 3室2厅" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="houseArea" label="面积(m²)">
                    <Input type="number" placeholder="建筑面积" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="renovationType" label="装修类型">
                    <Select placeholder="请选择" allowClear>
                      {renoTypes.map((r) => (
                        <Select.Option key={r.id} value={r.name}>{r.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="houseStatus" label="房屋状态">
                    <Select placeholder="请选择" allowClear>
                      {houseStatuses.map((h) => (
                        <Select.Option key={h.id} value={h.name}>{h.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="budgetRange" label="预算区间">
                    <Select placeholder="请选择" allowClear>
                      {budgetRanges.map((b) => (
                        <Select.Option key={b.id} value={b.name}>{b.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="decorationTime" label="预计装修时间">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="decorationStyle" label="风格偏好">
                <Select placeholder="请选择" allowClear>
                  {styles.map((s) => (
                    <Select.Option key={s.id} value={s.name}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="expectedBudget" label="预计预算(元)">
                <Input type="number" placeholder="具体金额" />
              </Form.Item>

              <Form.Item name="specialRequirement" label="特殊需求">
                <TextArea rows={2} placeholder="如: 需要衣帽间、开放式厨房" />
              </Form.Item>
            </Card>

            {/* 归属信息 */}
            <Card title="归属信息" size="small">
              <Form.Item name="designOwnerId" label="负责设计师">
                <Select placeholder="选择设计师" allowClear>
                  {designers.map((d) => (
                    <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* 撞单提示 */}
      {showCollision && collision && (
        <Alert
          type="warning"
          message={collision.message}
          description={
            <div>
              {collision.existingCustomers.map((c: any) => (
                <div key={c.id} style={{ padding: '4px 0' }}>
                  <a onClick={() => { setShowCollision(false); navigate(`/customers/${c.id}`); }}>
                    {c.name} - {c.phone} - {STAGE_COLORS[c.stage] || c.stage}
                  </a>
                </div>
              ))}
            </div>
          }
          showIcon
          closable
          onClose={() => setShowCollision(false)}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
}
