import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './theme/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#FA8C16',
            colorPrimaryBg: '#FFF7E6',
            colorPrimaryBgHover: '#FFE0B2',
            colorPrimaryBorder: '#FFB74D',
            colorPrimaryHover: '#FF9A2E',
            colorPrimaryActive: '#D46B08',
            colorText: '#262626',
            colorTextSecondary: '#8C8C8C',
            colorTextTertiary: '#BFBFBF',
            colorBorder: '#D9D9D9',
            colorBorderSecondary: '#F0F0F0',
            colorBgContainer: '#FFFFFF',
            colorBgLayout: '#FAFAFA',
            colorSuccess: '#52C41A',
            colorWarning: '#FAAD14',
            colorError: '#FF4D4F',
            colorInfo: '#1890FF',
            borderRadius: 6,
            borderRadiusSM: 4,
            borderRadiusLG: 8,
            fontSize: 14,
            fontSizeHeading1: 28,
            fontSizeHeading2: 22,
            fontSizeHeading3: 18,
            fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          components: {
            Layout: {
              siderBg: '#001529',
              triggerBg: '#FA8C16',
            },
            Menu: {
              darkItemBg: '#001529',
              darkSubMenuItemBg: '#000C17',
              darkItemSelectedBg: '#FA8C16',
              itemSelectedColor: '#FFFFFF',
            },
            Button: {
              primaryShadow: '0 2px 4px rgba(250,140,22,0.2)',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
