import { useState, useEffect } from 'react';
import {
  Table, Button, Space, Input, Select, Tag, Typography, Card,
  Modal, Form, message, Popconfirm, Row, Col,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi, departmentApi } from '../../services/auth';

const { Title, Text } = Typography;

const ROLE_COLORS: Record<string, string> = {
  GM: 'red', VP: 'orange', DIRECTOR: 'purple',
  MARKET_MGR: 'blue', DESIGN_MGR: 'cyan',
  SALES: 'green', DESIGNER: 'cyan',
  RECEPTIONIST: 'default', FINANCE: 'gold', PM: 'lime',
};

const ROLE_LABELS: Record<string, string> = {
  GM: '总经理', VP: '副总', DIRECTOR: '事业部总监',
  MARKET_MGR: '市场经理', DESIGN_MGR: '设计经理',
  SALES: '销售', DESIGNER: '设计师',
  RECEPTIONIST: '客服', FINANCE: '财务', PM: '项目经理',
};

export default function UsersSettings() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [depts, setDepts] = useState<any[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    departmentApi.list().then((r: any) => setDepts(r)).catch(() => {});
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await userApi.list({
        skip: (page - 1) * pageSize, take: pageSize, keyword: keyword || undefined, role,
      });
      setUsers(res.users);
      setTotal(res.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, pageSize, role]);

  const handleAdd = () => { setEditingUser(null); form.resetFields(); setFormVisible(true); };
  const handleEdit = (u: any) => { setEditingUser(u); form.setFieldsValue(u); setFormVisible(true); };
  const handleDelete = async (id: string) => { await userApi.delete(id); message.success('已停用'); fetchUsers(); };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await userApi.update(editingUser.id, values);
        message.success('更新成功');
      } else {
        await userApi.create(values);
        message.success('创建成功');
      }
      setFormVisible(false);
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: '手机号', dataIndex: 'phone' },
    { title: '角色', dataIndex: 'role', render: (r: string) => <Tag color={ROLE_COLORS[r]}>{ROLE_LABELS[r] || r}</Tag> },
    { title: '部门', dataIndex: ['department', 'name'], render: (n: string) => n || '-' },
    { title: '状态', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'success' : 'error'}>{v ? '启用' : '停用'}</Tag> },
    {
      title: '操作', width: 120,
      render: (_: any, row: any) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
          <Popconfirm title="确认停用？" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建用户</Button>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="搜索姓名/手机" prefix={<SearchOutlined />} style={{ width: 180 }}
            value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={fetchUsers} allowClear />
          <Select placeholder="角色" style={{ width: 140 }} allowClear value={role}
            onChange={(v) => { setRole(v); setPage(1); }}
            options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
          <Button type="primary" onClick={fetchUsers}>查询</Button>
        </Space>
      </Card>

      <div className="card" style={{ padding: 0 }}>
        <Table columns={columns} dataSource={users} rowKey="id" loading={loading}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); } }} />
      </div>

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ role: 'SALES' }}>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                  <Select options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="departmentId" label="部门">
                <Select placeholder="选择部门" allowClear options={depts.map((d) => ({ value: d.id, label: d.name }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="邮箱">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
