
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { config } from '@/components/CustomComponents/config';
import socket  from '@/socket/Socket';
import { apiRequest } from '@/components/CustomComponents/apiRequest'
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem('hrms_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('hrms_user');
      }
    }
    setLoading(false);
  }, []);

  const loginpage = async (email, password) => {
    try {
      // Mock authentication - in production, this would be an API call
      const mockUsers = [
        {
          id: '1',
          email: 'admin@company.com',
          name: 'Karthi',
          role: 'Super Admin',
          department: 'Engineering',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '2',
          email: 'hr@company.com',
          name: 'Madhan Kumar',
          role: 'HR Manager',
          department: 'Human Resources',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        }
      ];

      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === 'password123') {
        const userWithToken = {
          ...foundUser,
          token: 'mock-jwt-token-' + Date.now(),
          loginTime: new Date().toISOString()
        };
        
        setUser(userWithToken);
        localStorage.setItem('hrms_user', JSON.stringify(userWithToken));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

const login = async (email, password) => {
  try {
    const hasTouch = (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    
    const isSmallScreen = window.screen.width < 900;

    const isMobileDevice = hasTouch && isSmallScreen;

    let url = config.Api + "/api/Employee/login/";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-is-mobile-hardware': isMobileDevice.toString(),
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status == 403) {
      toast({
        title: "Login failed",
        description: data.message || "Login not allowed",
      });
      return { success: false };
    }

    if (!response.ok) {
      toast({
        title: "Login failed",
        description: data.message || "Login failed",
      });
      throw new Error(data.message || "Login failed");
    } else {
      socket.connect();
      socket.emit("joinRoom", { employeeId: data.employee._id });
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.employee.name}!`,
      });
    }

    // store token in localStorage for later API calls
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(data.employee);
    
    // Fixed typo: 'json' to 'JSON' in the line below
    localStorage.setItem('hrms_user', JSON.stringify(data.employee));
    localStorage.setItem('userId', JSON.stringify(data.employee._id)); 
    localStorage.setItem('hrms_userEmail', JSON.stringify(data.employee.email));
    
    return { ...data.employee, success: true };

  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

const logout = async () => {
  try {
    let email = JSON.parse(localStorage.getItem("hrms_user"));
    let url = config.Api + "/api/Employee/logout/";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email:email.email }),
    });
    
    const data = await response.json();

    // Clear user state and localStorage
    setUser(null);
    localStorage.clear();

    // Disconnect socket
    if (socket.connected) {
      socket.disconnect();
    }

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

  } catch (error) {
    console.error("Logout Error:", error.message);
    throw error;
  }
};

// utils/getPermissions.js
const getPermissionsByPath = async(path) => {
  const roleName = user.role; // read role from localStorage
  if (!roleName) return null;

  try {
      const res = await apiRequest("RoleBased/getPermissions", {
      method: "POST",
      body: JSON.stringify({ roleName, path }),
    });

    const data = res
    if (data.success) {
      return data.permissions;
    } else {
      navigate('/dashboard')
      return null;
    }
  } catch (err) {
    console.error("Error fetching permissions:", err);
    return null;
  }
}


  const value = {
    user,
    login,
    logout,
    loading,
    getPermissionsByPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
