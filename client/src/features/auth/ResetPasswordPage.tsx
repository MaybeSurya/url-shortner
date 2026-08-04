import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService, getErrorMessage } from '../../services/api';
import { toast } from 'sonner';
import { staggerContainer, staggerChild, ease } from '../../lib/motion';

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const resetMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    resetMutation.mutate({ email });
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
          <h1 className="text-xl font-semibold tracking-tight text-on-surface">
            {sent ? 'Check your email' : 'Reset password'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            {sent
              ? `We sent a reset link to ${email}`
              : 'Enter your email to receive reset instructions'}
          </p>
        </div>

        {!sent ? (
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
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={resetMutation.isPending}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Send reset link
                </Button>
              </motion.div>
            </motion.form>

            <div className="px-6 py-3.5 bg-surface-container border-t border-outline-variant text-center">
              <Link
                to="/login"
                className="text-xs text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md p-6 text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
              <Send className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-xs text-on-surface-variant">
              If this email exists in our system, you'll receive a reset link shortly.
            </p>
            <Link to="/login">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to sign in
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
