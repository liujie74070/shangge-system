import { useState, useEffect } from 'react';
import {
  Table, Button, Space, Select, Tag, Typography, Card,
  Modal, Form, Input, message, Popconfirm, Tabs, InputNumber,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { dictApi } from '../../services/auth';

const { Title, Text } = Typography;

const DICT_TYPES = [
  { key: 'customerSources', label: '客户来源' },
  { key: 'customerStages', label: '客户阶段' },
  { key: 'intentLevels', label: '意向等级' },
  { key: 'renovationTypes', label: '装修类型' },
  { key: 'houseStatuses', label: '房屋状态' },
  { key: 'budgetRanges', label: '预算区间' },
  { key: 'decorationStyles', label: '风格偏好' },
  { key: 'followUpMethods', label: '跟进方式' },
  { key: 'churnReasons', label: '流失原因' },
  { key: 'postponeReasons', label: '暂缓原因' },
  { key: 'constructionNodes', label: '施工节点' },
  { key: 'afterSalesIssueTypes', label: '售后问题' },
  { key: 'afterSalesStatuses', label: '售后状态' },
  { key: 'paymentMethods', label: '收款方式' },
  { key: 'paymentTypes', label: '收款类型' },
  { key: 'productTypes', label: '产品类型' },
  { key: 'packageTypes', label: '套餐类型' },
  { key: 'expenseTypes', label: '费用类型' },
];

export default function DictSettings() {
  const [activeDict, setActiveDict] = useState('customerSources');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dictApi.get(activeDict);
      setData(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeDict]);

  const handleAdd = () => { setEditingItem(null); form.resetFields(); setFormVisible(true); };
  const handleEdit = (item: any) => { setEditingItem(item); form.setFieldsValue(item); setFormVisible(true); };
  const handleDelete = async (id: string) => {
    await dictApi.delete(activeDict, id);
    message.success('删除成功');
    fetchData();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await dictApi.update(activeDict, editingItem.id, values);
      } else {
        await dictApi.create(activeDict, values);
      }
      message.success(editingItem ? '更新成功' : '创建成功');
      setFormVisible(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const getColumns = () => {
    const cols: any[] = [
      { title: '序号', dataIndex: 'sortOrder', width: 70, render: (v: number) => v || '-' },
      { title: '名称', dataIndex: 'name' },
    ];

    if (activeDict === 'budgetRanges') {
      cols.push(
        { title: '最小金额', dataIndex: 'minAmount', render: (v: number) => v != null ? v.toLocaleString() : '-' },
        { title: '最大金额', dataIndex: 'maxAmount', render: (v: number) => v != null ? v.toLocaleString() : '-' },
      );
    }

    cols.push(
      { title: '状态', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? '启用' : '停用'}</Tag> },
      {
        title: '操作', width: 120,
        render: (_: any, row: any) => (
          <Space size={4}>
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.id)}>
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    );
    return cols;
  };

  const tabItems = DICT_TYPES.map((d) => ({ key: d.key, label: d.label }));

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>字典配置</Title>

      <Card>
        <Tabs
          activeKey={activeDict}
          onChange={(k) => setActiveDict(k)}
          type="card"
          tabBarStyle={{ marginBottom: 16 }}
          items={tabItems}
          style={{ maxHeight: 60 }}
          size="small"
        />
        {tabItems.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <Button type="primary" icon={<PlusOutlined />} size="small" onClick={handleAdd}>新增</Button>
            </div>
            <Table columns={getColumns()} dataSource={data} rowKey="id" loading={loading} size="small" pagination={false} />
          </>
        )}
      </Card>

      <Modal
        title={editingItem ? '编辑' : '新增'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
          {activeDict !== 'intentLevels' && activeDict !== 'afterSalesStatuses' && activeDict !== 'constructionNodes' && (
            <Form.Item name="isActive" label="状态" initialValue={true}>
              <Select options={[{ value: true, label: '启用' }, { value: false, label: '停用' }]} />
            </Form.Item>
          )}
          {activeDict === 'budgetRanges' && (
            <Space>
              <Form.Item name="minAmount" label="最小金额">
                <InputNumber min={0} style={{ width: 120 }} />
              </Form.Item>
              <Form.Item name="maxAmount" label="最大金额">
                <InputNumber min={0} style={{ width: 120 }} placeholder="空=无上限" />
              </Form.Item>
            </Space>
          )}
          {activeDict === 'customerStages' && (
            <Form.Item name="color" label="颜色">
              <Input type="color" style={{ width: 100, height: 32 }} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
