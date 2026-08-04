import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService, getErrorMessage } from '../../services/api';
import { toast } from 'sonner';
import { staggerContainer, staggerChild, ease } from '../../lib/motion';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      toast.success(data.message || 'Account created! Please check your email.');
      navigate('/login');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    signupMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="auth-bg" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: ease.smooth }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary mb-4">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-on-surface">Create account</h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Start shortening and analyzing your links
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
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
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
                autoComplete="email"
                required
              />
            </motion.div>

            <motion.div variants={staggerChild}>
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-3.5 h-3.5" />}
                helper="Must be at least 8 characters"
                autoComplete="new-password"
                required
              />
            </motion.div>

            <motion.div variants={staggerChild}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={signupMutation.isPending}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Create account
              </Button>
            </motion.div>
          </motion.form>

          <div className="px-6 py-3.5 bg-surface-container border-t border-outline-variant text-center">
            <p className="text-xs text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
