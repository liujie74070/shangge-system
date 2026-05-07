import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Card, Menu, Typography, Spin } from 'antd';
import {
  TeamOutlined, SettingOutlined, ToolOutlined, AuditOutlined,
  DatabaseOutlined, BgColorsOutlined, DollarOutlined, MessageOutlined,
} from '@ant-design/icons';
import UsersSettings from './UsersSettings';
import DictSettings from './DictSettings';
import BusinessRulesSettings from './BusinessRulesSettings';

const { Title } = Typography;

const menuItems = [
  { key: '/settings/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/settings/departments', icon: <AuditOutlined />, label: '组织架构' },
  { key: '/settings/dict', icon: <DatabaseOutlined />, label: '字典配置' },
  { key: '/settings/business-rules', icon: <ToolOutlined />, label: '业务规则' },
  { key: '/settings/system', icon: <SettingOutlined />, label: '系统参数' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* 左侧菜单 */}
      <div style={{
        width: 220,
        background: '#fff',
        borderRight: '1px solid #F0F0F0',
        padding: '24px 0',
        flexShrink: 0,
      }}>
        <Title level={5} style={{ padding: '0 24px 16px', margin: 0, color: '#8C8C8C', fontSize: 13 }}>
          系统设置
        </Title>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ border: 0 }}
        />
      </div>

      {/* 右侧内容 */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<UsersSettings />} />
          <Route path="/users" element={<UsersSettings />} />
          <Route path="/dict" element={<DictSettings />} />
          <Route path="/business-rules" element={<BusinessRulesSettings />} />
          <Route path="/departments" element={<div className="card"><Title level={4}>组织架构</Title><p style={{ color: '#8C8C8C' }}>coming soon...</p></div>} />
          <Route path="/system" element={<div className="card"><Title level={4}>系统参数</Title><p style={{ color: '#8C8C8C' }}>coming soon...</p></div>} />
        </Routes>
      </div>
    </div>
  );
}
