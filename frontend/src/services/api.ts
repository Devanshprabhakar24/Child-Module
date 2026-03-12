import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wt18_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthRoute = url.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('wt18_token');
      localStorage.removeItem('wt18_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Auth ──
export const authApi = {
  register: (data: { email: string; phone: string; fullName: string }) =>
    api.post('/auth/register', data),

  sendOtp: (data: { email: string; phone?: string }) =>
    api.post('/auth/send-otp', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  firstLogin: (data: { registrationId: string; email: string; phone: string; otp: string }) =>
    api.post('/auth/first-login', data),

  login: (data: { registrationId: string; email: string; otp: string }) =>
    api.post('/auth/login', data),

  getProfile: () => api.get('/auth/profile'),

  getCloudinarySignature: () => api.get('/auth/cloudinary-signature'),
};

// ── Registration ──
export const registrationApi = {
  registerChild: (data: {
    childName: string;
    childGender: string;
    dateOfBirth: string;
    state: string;
    motherName: string;
    fatherName?: string;
    motherRegistrationId?: string;
    email: string;
    phone: string;
    phone2?: string;
    address?: string;
    registrationType?: string;
    channelPartnerId?: string;
    couponCode?: string;
  }) => api.post('/registration', data),

  getByRegistrationId: (id: string) => api.get(`/registration/${encodeURIComponent(id)}`),

  getByMother: (motherId: string) =>
    api.get(`/registration/mother/${encodeURIComponent(motherId)}`),

  getFamily: (parentUserId: string) =>
    api.get(`/registration/family/${encodeURIComponent(parentUserId)}`),

  linkParent: (registrationId: string, parentUserId: string) =>
    api.post(`/registration/${encodeURIComponent(registrationId)}/link-parent/${encodeURIComponent(parentUserId)}`),

  getTestMode: () => api.get('/registration/config/test-mode'),

  updateChild: (
    registrationId: string,
    data: { childName?: string; profilePictureUrl?: string },
  ) => api.patch(`/registration/${encodeURIComponent(registrationId)}`, data),
};

// ── Dashboard ──
export const dashboardApi = {
  getChildDashboard: (registrationId: string) =>
    api.get(`/dashboard/child/${encodeURIComponent(registrationId)}`),

  getFamily: () => api.get('/dashboard/family'),

  getVaccination: (registrationId: string) =>
    api.get(`/dashboard/vaccination/${encodeURIComponent(registrationId)}`),

  seedVaccinations: (data: { registrationId: string; dateOfBirth: string }) =>
    api.post('/dashboard/vaccination/seed', data),

  getMilestones: (registrationId: string) =>
    api.get(`/dashboard/milestones/${encodeURIComponent(registrationId)}`),

  getUpcomingMilestones: (registrationId: string) =>
    api.get(`/dashboard/milestones/${encodeURIComponent(registrationId)}/upcoming`),

  createMilestone: (data: {
    registrationId: string;
    title: string;
    description?: string;
    category: string;
    dueDate: string;
    vaccineName?: string;
  }) => api.post('/dashboard/milestones', data),

  updateMilestone: (milestoneId: string, data: { status: string; completedDate?: string; notes?: string }) =>
    api.patch(`/dashboard/milestones/${encodeURIComponent(milestoneId)}`, data),
};

// ── Reminders ──
export const remindersApi = {
  create: (data: { registrationId: string; milestoneId: string; channels: string[]; customMessage?: string }) =>
    api.post('/reminders', data),

  seed: (registrationId: string) =>
    api.post(`/reminders/seed/${encodeURIComponent(registrationId)}`),

  getByRegistration: (registrationId: string) =>
    api.get(`/reminders/${encodeURIComponent(registrationId)}`),

  getByMilestone: (milestoneId: string) =>
    api.get(`/reminders/milestone/${encodeURIComponent(milestoneId)}`),

  update: (reminderId: string, data: { channels?: string[]; customMessage?: string }) =>
    api.patch(`/reminders/${encodeURIComponent(reminderId)}`, data),
};

// ── Payments ──
export const paymentsApi = {
  getByRegistration: (registrationId: string) =>
    api.get(`/payments/${encodeURIComponent(registrationId)}`),

  getByOrder: (orderId: string) =>
    api.get(`/payments/order/${encodeURIComponent(orderId)}`),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/registration/verify-payment', data),

  confirmTestPayment: (registrationId: string) =>
    api.post(`/registration/confirm-test-payment/${encodeURIComponent(registrationId)}`),
};

// ── Profile ──
export const profileApi = {
  updateProfile: (data: { fullName?: string; profilePictureUrl?: string }) =>
    api.post('/auth/update-profile', data),
};

export default api;
