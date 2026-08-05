import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Key, Lock, Copy, Check, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { authService, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  
  // Password change state
  const [currentpassword, setCurrentpassword] = useState('');
  const [newpassword, setNewpassword] = useState('');
  
  // Email change state
  const [_newEmail, _setNewEmail] = useState('');
  const [_emailPassword, _setEmailPassword] = useState('');

  // API Key state
  const [apiKey, setApiKey] = useState(user?.apikey || '');
  const [hasCopiedKey, setHasCopiedKey] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setCurrentpassword('');
      setNewpassword('');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const apiKeyMutation = useMutation({
    mutationFn: authService.generateApiKey,
    onSuccess: (data) => {
      setApiKey(data.apikey);
      refreshUser();
      toast.success('New API Key generated!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: authService.deleteAccount,
    onSuccess: () => {
      toast.success('Account deleted.');
      logout();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentpassword || !newpassword) return;
    passwordMutation.mutate({ currentpassword, newpassword });
  };

  const handleCopyApiKey = async () => {
    const keyToCopy = apiKey || user?.apikey;
    if (!keyToCopy) return;
    try {
      await navigator.clipboard.writeText(keyToCopy);
      setHasCopiedKey(true);
      toast.success('API Key copied to clipboard!');
      setTimeout(() => setHasCopiedKey(false), 2000);
    } catch {
      toast.error('Failed to copy key.');
    }
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    deleteMutation.mutate({ password: deletePassword });
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Account Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage your account profile, security credentials, and API access keys.
        </p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle>{user?.email}</CardTitle>
              <CardDescription>Role: {user?.role || 'User'}</CardDescription>
            </div>
          </div>
          <Badge variant={user?.admin ? 'danger' : 'indigo'}>
            {user?.admin ? 'Administrator' : 'Standard User'}
          </Badge>
        </CardHeader>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>API Access Key</CardTitle>
              <CardDescription>Use this key to authenticate programmatic API requests.</CardDescription>
            </div>
          </div>
          <Button
            onClick={() => apiKeyMutation.mutate()}
            variant="outline"
            size="sm"
            isLoading={apiKeyMutation.isPending}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Generate Key
          </Button>
        </CardHeader>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={apiKey || user?.apikey || 'No API key generated yet.'}
            className="font-mono text-xs"
          />
          <Button
            onClick={handleCopyApiKey}
            variant="secondary"
            size="md"
            leftIcon={hasCopiedKey ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
          >
            {hasCopiedKey ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Card>

      {/* Security - Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-secondary" />
            <div>
              <CardTitle>Security & Password</CardTitle>
              <CardDescription>Update your account access password.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentpassword}
            onChange={(e) => setCurrentpassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newpassword}
            onChange={(e) => setNewpassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" isLoading={passwordMutation.isPending}>
            Update Password
          </Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/30 bg-error/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-error" />
            <div>
              <CardTitle className="text-error">Danger Zone</CardTitle>
              <CardDescription>Permanently delete your user account and all links.</CardDescription>
            </div>
          </div>
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            variant="danger"
            size="sm"
          >
            Delete Account
          </Button>
        </CardHeader>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User Account?"
        description="This action cannot be undone. Enter your current password to confirm account deletion."
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <Input
            label="Confirm Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/60">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={deleteMutation.isPending}>
              Permanently Delete Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
