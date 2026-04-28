'use client';

import { useState } from 'react';
import { RegisterSchema } from '@/lib/utils/validation';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setMessage('');

    const parsed = RegisterSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors([data.error || 'Registration failed']);
        return;
      }

      setMessage(data.message || 'Account created. Awaiting admin approval.');
      setEmail('');
      setPassword('');
      onSuccess?.();
    } catch {
      setErrors(['Registration failed']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </div>

      {errors.length > 0 ? (
        <div className="space-y-1">
          {errors.map((error, idx) => (
            <p key={idx} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      ) : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <button type="submit" disabled={loading} className="w-full">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
