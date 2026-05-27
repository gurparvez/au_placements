import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authApi from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token ? 'loading' : 'idle'
  );
  const [message, setMessage] = useState(token ? 'Verifying your email...' : '');
  const [devLink, setDevLink] = useState('');

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail({ token })
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Verification link is invalid or expired.');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setDevLink('');

    try {
      const payload = identifier.includes('@') ? { email: identifier } : { auid: identifier };
      const res = await authApi.resendVerification(payload);
      setStatus('success');
      setMessage(res.message || 'Verification link prepared.');
      setDevLink(res.data?.verificationUrl || '');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.message || 'Could not prepare verification link.');
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen px-4 pt-28">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Verify Email</h1>
          <p className="text-muted-foreground text-sm">Confirm your official university email.</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <p className={status === 'error' ? 'text-sm text-red-600' : 'text-muted-foreground text-sm'}>
              {message}
            </p>
          )}

          {devLink && (
            <a className="text-primary block truncate text-sm underline" href={devLink}>
              Development verification link
            </a>
          )}

          {!token && (
            <form className="space-y-3" onSubmit={handleResend}>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Official email or AUID"
              />
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Preparing...' : 'Resend Verification'}
              </Button>
            </form>
          )}

          {status === 'success' && (
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default VerifyEmailPage;
