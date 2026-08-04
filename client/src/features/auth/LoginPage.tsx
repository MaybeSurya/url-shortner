import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { toast } from 'sonner';
import { staggerContainer, staggerChild, ease } from '../../lib/motion';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { siteName } = useConfig();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      toast.success('Signed in successfully');
      await refreshUser();
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="auth-bg" aria-hidden="true" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: ease.smooth }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary mb-4 shadow-sm">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-on-surface">
            Welcome back
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Sign in to your {siteName} workspace
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden card-etched">
          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="p-6 space-y-4"
          >
            <motion.div variants={staggerChild}>
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
                error={errors.email}
                autoComplete="email"
                required
              />
            </motion.div>

            <motion.div variants={staggerChild}>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                leftIcon={<Lock className="w-3.5 h-3.5" />}
                error={errors.password}
                autoComplete="current-password"
                required
              />
            </motion.div>

            <motion.div variants={staggerChild} className="flex items-center justify-end">
              <Link
                to="/reset-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.div variants={staggerChild}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loginMutation.isPending}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Sign in
              </Button>
            </motion.div>
          </motion.form>

          {/* Internal platform notice */}
          <div className="px-6 py-3.5 bg-surface-container-low border-t border-outline-variant text-center">
            <p className="text-2xs text-on-surface-variant leading-relaxed">
              Internal platform access. Public registration is disabled. Contact your administrator for account credentials.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
