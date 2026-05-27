import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setDevLink('');

    try {
      const payload = identifier.includes('@') ? { email: identifier } : { auid: identifier };
      const res = await authApi.forgotPassword(payload);
      setMessage(res.message || 'If the account exists, a reset link has been prepared.');
      setDevLink(res.data?.resetUrl || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not prepare reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen px-4 pt-28">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Reset Password</h1>
          <p className="text-muted-foreground text-sm">Use your official email or AUID.</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Official email or AUID"
            />
            <Button type="submit" className="w-full" disabled={loading || !identifier.trim()}>
              {loading ? 'Preparing...' : 'Send Reset Link'}
            </Button>
          </form>

          {message && <p className="text-muted-foreground text-sm">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {devLink && (
            <a className="text-primary block truncate text-sm underline" href={devLink}>
              Development reset link
            </a>
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default ForgotPasswordPage;
