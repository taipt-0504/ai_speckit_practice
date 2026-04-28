'use client';

import { useEffect, useState } from 'react';

interface PendingUser {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export function PendingUsersList() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPendingUsers() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/users/pending', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load users');
        setUsers([]);
        return;
      }
      setUsers(data.pending_users || []);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, action: 'approve' | 'reject') {
    const response = await fetch(`/api/users/${id}/${action}`, {
      method: 'POST',
      credentials: 'include',
    });
    if (response.ok) {
      await loadPendingUsers();
    }
  }

  useEffect(() => {
    loadPendingUsers();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-600">Loading pending users...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (users.length === 0) {
    return <p className="text-sm text-gray-600">No pending users.</p>;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="rounded-md border border-gray-200 p-4">
          <p className="font-medium text-gray-900">{user.email}</p>
          <p className="text-sm text-gray-600">Status: {user.status}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => updateStatus(user.id, 'approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => updateStatus(user.id, 'reject')}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
