
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { config } from '@/components/CustomComponents/config';
import socket  from '@/socket/Socket';

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
    let url = config.Api + "Employee/login/";
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
        const data = await response.json();
    // Handle mobile restriction (403)
    if (response.status == 403) {
      toast({
        title: "Login failed",
        description: data.message || "Login not allowed",
      });
      return { success: false };
    }

    // Handle other errors
    if (!response.ok) {
      toast({
        title: "Login failed",
        description: data.message || "Login failed",
      });
      throw new Error(data.message || "Login failed");
    }else{
       socket.connect();
      socket.emit("joinRoom", { employeeId:data.employee._id });
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
localStorage.setItem('hrms_user', JSON.stringify(data.employee));
localStorage.setItem('userId', json.stringify(data.employee._id))
localStorage.setItem('hrms_userEmail', JSON.stringify(data.employee.email));
     return {...data.employee, success: true };
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

const logout = async () => {
  try {
    let email = JSON.parse(localStorage.getItem("hrms_user"));
    let url = config.Api + "Employee/logout/";
    
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


  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
