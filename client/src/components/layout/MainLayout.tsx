import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Drawer } from 'antd';
import {
  HomeOutlined, TeamOutlined, FileTextOutlined, DollarOutlined,
  SettingOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  ProjectOutlined, CustomerServiceOutlined, LogoutOutlined, UserOutlined,
  ToolOutlined, BarChartOutlined, AuditOutlined, MessageOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../services/auth';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: '工作台' },
  { key: '/customers', icon: <TeamOutlined />, label: '客户管理' },
  { key: '/contracts', icon: <FileTextOutlined />, label: '合同管理' },
  { key: '/projects', icon: <ProjectOutlined />, label: '施工管理' },
  { key: '/after-sales', icon: <CustomerServiceOutlined />, label: '售后管理' },
  { key: '/reports', icon: <BarChartOutlined />, label: '经营报表' },
  {
    key: 'settings-group',
    icon: <SettingOutlined />,
    label: '系统设置',
    children: [
      { key: '/settings/users', icon: <TeamOutlined />, label: '用户管理' },
      { key: '/settings/departments', icon: <AuditOutlined />, label: '组织架构' },
      { key: '/settings/business-rules', icon: <ToolOutlined />, label: '业务规则' },
      { key: '/settings/system', icon: <SettingOutlined />, label: '系统参数' },
      { key: '/settings/dict', icon: <SettingOutlined />, label: '字典配置' },
    ],
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const selectedKey = '/' + location.pathname.split('/')[1];

  const handleMenuClick = ({ key }: any) => {
    navigate(key);
    setMobileOpen(false);
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => { logout(); navigate('/login'); },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      <Sider
        width={224}
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="desktop-sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#FA8C16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              SG
            </div>
            {!collapsed && (
              <Text strong style={{ color: '#fff', fontSize: 15, whiteSpace: 'nowrap' }}>
                尚格放心装
              </Text>
            )}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 224, transition: 'margin-left 250ms cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Header */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F0F0F0',
            height: 64,
          }}
        >
          <Space>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ cursor: 'pointer', fontSize: 18, color: '#262626', display: 'flex', alignItems: 'center' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* 移动端菜单按钮 */}
            <div
              onClick={() => setMobileOpen(true)}
              style={{ cursor: 'pointer', fontSize: 18, color: '#262626', display: 'none' }}
              className="mobile-menu-btn"
            >
              <MenuFoldOutlined />
            </div>
          </Space>

          <Space size={20}>
            <Badge count={0} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#8C8C8C' }} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#FA8C16' }} size={36}>
                  {user?.name?.[0] || 'U'}
                </Avatar>
                <div style={{ lineHeight: 1.3 }} className="user-info-desktop">
                  <Text strong style={{ fontSize: 14, display: 'block' }}>{user?.name || '用户'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{user?.department?.name || ''}</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容 */}
        <Content style={{ background: '#FAFAFA', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#FA8C16', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 14,
              }}
            >
              SG
            </div>
            <span>尚格放心装</span>
          </div>
        }
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          theme="dark"
        />
      </Drawer>
    </Layout>
  );
}
