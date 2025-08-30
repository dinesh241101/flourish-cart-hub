
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    const adminData = localStorage.getItem('adminUser');
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    
    if (adminData && isLoggedIn === 'true') {
      setUser(JSON.parse(adminData));
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll use the hardcoded credentials
      // In production, this should verify against the admin_users table
      const ADMIN_CREDENTIALS = {
        email: 'admin@bmsstore.com',
        password: 'BMS@2024'
      };

      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser: AdminUser = {
          id: '1',
          email: email,
          name: 'BMS Admin',
          role: 'super_admin'
        };

        setUser(adminUser);
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        
        toast({
          title: "Login Successful!",
          description: "Welcome to BMS Store Admin Panel",
        });
        
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUser');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
