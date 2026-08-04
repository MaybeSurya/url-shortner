import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link } from '../../types';
import { linkService, getErrorMessage } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({ isOpen, onClose, link }) => {
  const [target, setTarget] = useState('');
  const [customurl, setCustomurl] = useState('');
  const [password, setPassword] = useState('');
  const [expireIn, setExpireIn] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    if (link) {
      setTarget(link.target || '');
      setCustomurl(link.address || '');
      setPassword('');
      setExpireIn(link.expire_in ? new Date(link.expire_in).toISOString().slice(0, 16) : '');
    }
  }, [link]);

  const editMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => linkService.editLink(payload.id, payload.data),
    onSuccess: () => {
      toast.success('Link updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      onClose();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    editMutation.mutate({
      id: link.id,
      data: {
        target: target.trim(),
        customurl: customurl.trim() || undefined,
        password: password || undefined,
        expire_in: expireIn || undefined,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Link Configuration"
      description="Update target destination, alias, or access password."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Target Destination URL"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />

        <Input
          label="Custom Alias / Path"
          value={customurl}
          onChange={(e) => setCustomurl(e.target.value)}
        />

        <Input
          label="Update Access Password"
          type="password"
          placeholder="Leave blank to keep existing password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Expiration Date & Time"
          type="datetime-local"
          value={expireIn}
          onChange={(e) => setExpireIn(e.target.value)}
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/60">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={editMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
