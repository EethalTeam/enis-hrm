import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ENISLogo from '@/data/ENIS-Logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleDemoLogin = (account) => {
    setEmail(account.email);
    setPassword('password123');
  };

  const demoAccounts = [
    { email: 'admin@company.com', role: 'Super Admin', name: 'Karthi' },
    { email: 'hr@company.com', role: 'HR Manager', name: 'Madhan  Kumar' }
  ];

  return (
    <>
      <Helmet>
        <title>Login - ENIS-HRMS</title>
        <meta name="description" content="Access your ENIS-HRMS account. Secure login for HR management, employee tracking, and business operations." />
        <meta property="og:title" content="Login - ENIS-HRMS" />
        <meta property="og:description" content="Secure access to your comprehensive HR management system with advanced features and analytics." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#235e10] to-[#235e10] rounded-2xl flex items-center justify-center animate-float" style={{}}>
                {/* <Building2 className="w-8 h-8 text-white" /> */}
                <img src={ENISLogo} alt="ENIS Logo" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">ENIS-HRMS</h1>
                <p className="text-gray-400">Complete HR Management Solution</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Streamline Your HR Operations
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Manage employees, track attendance, process payroll, and deliver projects with our comprehensive enterprise-grade HRMS platform.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="glass-effect rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">Empower People</div>
                  <div className="text-sm text-gray-400">Simplify Work</div>
                </div>
                <div className="glass-effect rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">Smart HR</div>
                  <div className="text-sm text-gray-400">Stronger Teams</div>
                </div>
                <div className="glass-effect rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">Boost Efficiency</div>
                  <div className="text-sm text-gray-400">Empower Success</div>
                </div>
                <div className="glass-effect rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">Your Workforce</div>
                  <div className="text-sm text-gray-400">Our Priority</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="glass-effect border-white/10">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">
                  Sign in to access your HRMS dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 glass-effect border-white/10 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 glass-effect border-white/10 text-white placeholder-gray-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="space-y-3">
                  {/* <div className="text-center">
                    <p className="text-sm text-gray-400 mb-3">Or click a demo account to log in</p>
                  </div> */}
                  {/* <div className="grid gap-2">
                    {demoAccounts.map((account, index) => (
                      <button
                        key={index}
                        onClick={() => handleDemoLogin(account)}
                        className="w-full text-left p-3 glass-effect rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-white">{account.name}</p>
                            <p className="text-xs text-gray-400">{account.email}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            {account.role}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;