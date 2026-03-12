import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  _id: string;
  email: string;
  phone: string;
  fullName: string;
  profilePictureUrl?: string;
  role: string;
  registrationIds: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  loading: boolean;
  login: (token: string, user: Partial<User>) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseToken(token: string): { sub?: string } {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wt18_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi
        .getProfile()
        .then((res) => {
          const profile = res.data.data || res.data;
          const decoded = parseToken(token);
          setUser({
            _id: decoded.sub || '',
            email: profile.email || '',
            phone: profile.phone || localStorage.getItem('wt18_phone') || '',
            fullName: profile.fullName || '',
            profilePictureUrl: profile.profilePictureUrl || '',
            role: profile.role || '',
            registrationIds: profile.registrationIds || [],
          });
        })
        .catch(() => {
          localStorage.removeItem('wt18_token');
          localStorage.removeItem('wt18_user');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, userData: Partial<User>) => {
    localStorage.setItem('wt18_token', newToken);
    localStorage.setItem('wt18_user', JSON.stringify(userData));
    const decoded = parseToken(newToken);
    setToken(newToken);
    setUser({
      _id: decoded.sub || '',
      email: userData.email || '',
      phone: userData.phone || localStorage.getItem('wt18_phone') || '',
      fullName: userData.fullName || '',
      profilePictureUrl: userData.profilePictureUrl || '',
      role: userData.role || '',
      registrationIds: userData.registrationIds || [],
    });
  };

  const logout = () => {
    localStorage.removeItem('wt18_token');
    localStorage.removeItem('wt18_user');
    localStorage.removeItem('wt18_phone');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await authApi.getProfile();
    const profile = res.data.data || res.data;
    const decoded = token ? parseToken(token) : {};
    setUser({
      _id: decoded.sub || user?._id || '',
      email: profile.email || '',
      phone: profile.phone || localStorage.getItem('wt18_phone') || '',
      fullName: profile.fullName || '',
      profilePictureUrl: profile.profilePictureUrl || '',
      role: profile.role || '',
      registrationIds: profile.registrationIds || [],
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
