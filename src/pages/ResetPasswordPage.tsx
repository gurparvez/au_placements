import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authApi from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await authApi.resetPassword({ token, newPassword: password });
      setMessage(res.message || 'Password reset successfully.');
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen px-4 pt-28">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Choose New Password</h1>
          <p className="text-muted-foreground text-sm">Your reset link expires in one hour.</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {!token && <p className="text-sm text-red-600">Missing reset token.</p>}

          {token && (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
              <Button type="submit" className="w-full" disabled={loading || password.length < 8}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {message && <p className="text-muted-foreground text-sm">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {message && (
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPasswordPage;
