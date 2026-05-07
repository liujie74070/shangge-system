import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = '/api';

const http = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// 请求拦截器：附加 JWT
http.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ========== Auth Store ==========
interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  avatar?: string;
  department?: { id: string; name: string; type: string; store?: { id: string; name: string } };
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

class AuthStore {
  token: string | null = Cookies.get('token') || null;
  user: User | null = null;

  async login(phone: string, password: string) {
    const res = await http.post<{ access_token: string; user: User }>('/auth/login', { phone, password });
    this.token = res.access_token;
    this.user = res.user;
    Cookies.set('token', res.access_token, { expires: 1 });
  }

  logout() {
    this.token = null;
    this.user = null;
    Cookies.remove('token');
  }
}

export const useAuthStore = new AuthStore();

// ========== API Services ==========
export const authApi = {
  login: (phone: string, password: string) => http.post('/auth/login', { phone, password }),
  getProfile: () => http.get('/auth/me'),
};

export const customerApi = {
  list: (params: Record<string, any>) => http.get('/customers', { params }),
  get: (id: string) => http.get(`/customers/${id}`),
  create: (data: any) => http.post('/customers', data),
  update: (id: string, data: any) => http.put(`/customers/${id}`, data),
  stageTransition: (id: string, toStage: string, remark?: string) =>
    http.post(`/customers/${id}/stage`, { toStage, remark }),
  assign: (id: string, toOwnerId: string, reason?: string) =>
    http.post(`/customers/${id}/assign`, { toOwnerId, reason }),
  delete: (id: string) => http.delete(`/customers/${id}`),
  checkCollision: (params: { phone?: string; wechat?: string; communityName?: string; name?: string }) =>
    http.get('/customers/collision-check', { params }),
};

export const dashboardApi = {
  overview: (params?: any) => http.get('/dashboard/overview', { params }),
  funnel: (params?: any) => http.get('/dashboard/funnel', { params }),
  sources: (params?: any) => http.get('/dashboard/sources', { params }),
  signedTrend: (months?: number) => http.get('/dashboard/signed-trend', { params: { months } }),
  designerRanking: (params?: any) => http.get('/dashboard/designer-ranking', { params }),
  churnStats: (params?: any) => http.get('/dashboard/churn-stats', { params }),
};

export const dictApi = {
  get: (type: string) => http.get(`/config/dict/${type}`),
  create: (type: string, data: any) => http.post(`/config/dict/${type}`, data),
  update: (type: string, id: string, data: any) => http.put(`/config/dict/${type}/${id}`, data),
  delete: (type: string, id: string) => http.delete(`/config/dict/${type}/${id}`),
};

export const followUpApi = {
  list: (customerId: string) => http.get(`/follow-ups/customer/${customerId}`),
  create: (data: any) => http.post('/follow-ups', data),
  todayTodos: () => http.get('/follow-ups/today-todos'),
  overdue: () => http.get('/follow-ups/overdue'),
};

export const appointmentApi = {
  create: (data: any) => http.post('/appointments', data),
  list: (customerId: string) => http.get(`/appointments/customer/${customerId}`),
  arrive: (id: string, data: { isArrived: boolean; noShowReason?: string }) =>
    http.put(`/appointments/${id}/arrive`, data),
};

export const contractApi = {
  list: (params?: any) => http.get('/contracts', { params }),
  get: (id: string) => http.get(`/contracts/${id}`),
  getByCustomer: (customerId: string) => http.get(`/contracts/customer/${customerId}`),
  update: (id: string, data: any) => http.put(`/contracts/${id}`, data),
  sign: (id: string, data: any) => http.post(`/contracts/${id}/sign`, data),
};

export const paymentApi = {
  create: (data: any) => http.post('/payments', data),
  listByContract: (contractId: string) => http.get(`/payments/contract/${contractId}`),
  listByCustomer: (customerId: string) => http.get(`/payments/customer/${customerId}`),
};

export const userApi = {
  list: (params?: any) => http.get('/users', { params }),
  get: (id: string) => http.get(`/users/${id}`),
  create: (data: any) => http.post('/users', data),
  update: (id: string, data: any) => http.put(`/users/${id}`, data),
  delete: (id: string) => http.delete(`/users/${id}`),
  getDesigners: () => http.get('/users/designers'),
};

export const departmentApi = {
  list: () => http.get('/departments'),
  get: (id: string) => http.get(`/departments/${id}`),
  create: (data: any) => http.post('/departments', data),
  update: (id: string, data: any) => http.put(`/departments/${id}`, data),
};

export const configApi = {
  getBusinessRules: () => http.get('/config/business-rules'),
  upsertBusinessRule: (key: string, data: any) => http.post(`/config/business-rules/${key}`, data),
  getSystemConfigs: () => http.get('/config/system'),
  getSystemConfig: (key: string) => http.get(`/config/system/${key}`),
  upsertSystemConfig: (key: string, data: any) => http.post(`/config/system/${key}`, data),
};

export const notificationApi = {
  list: (params?: any) => http.get('/notifications', { params }),
  markRead: (id: string) => http.put(`/notifications/${id}/read`),
  markAllRead: () => http.put('/notifications/read-all'),
};

export default http;
