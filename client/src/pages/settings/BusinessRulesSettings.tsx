import { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Descriptions } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { configApi } from '../../services/auth';

const { Title, Text } = Typography;

export default function BusinessRulesSettings() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await configApi.getBusinessRules();
      setRules(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    const value = typeof rule.ruleValue === 'string' ? JSON.parse(rule.ruleValue) : rule.ruleValue;
    form.setFieldsValue({ ruleName: rule.ruleName, description: rule.description, ...value });
    setEditVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const { ruleName, description, ...ruleValue } = values;
      await configApi.upsertBusinessRule(editingRule.ruleKey, {
        ruleName: ruleName || editingRule.ruleName,
        ruleValue,
        description: description || editingRule.description,
      });
      message.success('保存成功');
      setEditVisible(false);
      fetchRules();
    } catch (err) {
      message.error('保存失败');
    }
  };

  const columns = [
    { title: '规则名称', dataIndex: 'ruleName', render: (v: string) => <Text strong>{v}</Text> },
    { title: '规则键', dataIndex: 'ruleKey', render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: '当前值',
      render: (_: any, row: any) => {
        const v = typeof row.ruleValue === 'string' ? JSON.parse(row.ruleValue) : row.ruleValue;
        return (
          <Space wrap>
            {Object.entries(v).map(([k, val]: [string, any]) => (
              <Tag key={k}>{k}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}</Tag>
            ))}
          </Space>
        );
      },
    },
    { title: '说明', dataIndex: 'description', render: (v: string) => <Text type="secondary">{v || '-'}</Text> },
    {
      title: '操作', width: 80,
      render: (_: any, row: any) => (
        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
      ),
    },
  ];

  const getFormItems = () => {
    if (!editingRule) return null;
    const v = typeof editingRule.ruleValue === 'string' ? JSON.parse(editingRule.ruleValue) : editingRule.ruleValue;

    const items: any[] = [];
    for (const [key, val] of Object.entries(v)) {
      if (typeof val === 'number') {
        items.push(<Form.Item key={key} name={key} label={key} initialValue={val}><InputNumber min={0} style={{ width: 120 }} /></Form.Item>);
      } else if (typeof val === 'boolean') {
        items.push(<Form.Item key={key} name={key} label={key} valuePropName="checked" initialValue={val}><Switch /></Form.Item>);
      } else if (typeof val === 'object') {
        items.push(<Form.Item key={key} name={key} label={key} initialValue={JSON.stringify(val)}><Input /></Form.Item>);
      }
    }
    return items;
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>业务规则配置</Title>
      <Card>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          以下规则将实时影响业务流程。修改后即时生效，无需重启服务。
        </Text>
        <Table columns={columns} dataSource={rules} rowKey="id" loading={loading} size="small" pagination={false} />
      </Card>

      <Modal
        title={`编辑规则: ${editingRule?.ruleName}`}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={() => form.submit()}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="ruleName" label="规则名称" initialValue={editingRule?.ruleName}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明" initialValue={editingRule?.description}>
            <Input />
          </Form.Item>
          <Divider>参数</Divider>
          {getFormItems()}
        </Form>
      </Modal>
    </div>
  );
}
