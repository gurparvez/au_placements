import React, { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';

type AuthMode = 'login' | 'register';

type RegisterForm = {
  auid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type LoginForm = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    auid: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleIdCardChange = (file?: File) => {
    setErrors((prev) => ({ ...prev, idCard: '' }));
    if (!file) {
      setIdCardFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        idCard: 'Only image files are allowed (JPG, PNG, etc.)',
      }));
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setErrors((prev) => ({
        ...prev,
        idCard: 'File must be 5MB or smaller',
      }));
      return;
    }

    setIdCardFile(file);
  };

  const validateRegister = () => {
    const e: { [k: string]: string } = {};

    if (!registerForm.auid.trim()) e.auid = 'AU ID is required';
    if (!registerForm.firstName.trim()) e.firstName = 'First name is required';
    if (!registerForm.lastName.trim()) e.lastName = 'Last name is required';

    if (!registerForm.email.trim()) {
      e.email = 'Email is required';
    } else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(registerForm.email.trim())) e.email = 'Enter a valid email';
    }

    if (!registerForm.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(registerForm.phone.trim())) {
      e.phone = 'Enter a valid 10-digit phone number';
    }

    if (!registerForm.password.trim()) e.password = 'Password is required';

    if (!idCardFile) e.idCard = 'ID card image is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log('Login form:', loginForm);
      alert('Login submit (hook to backend)');
    } catch (err) {
      console.error(err);
      alert('Login failed (wire to backend)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) {
      return;
    }
    setSubmitting(true);
    try {
      console.log('Register form:', registerForm, 'ID card:', idCardFile);
      alert('Register submit (hook to backend)');
    } catch (err) {
      console.error(err);
      alert('Registration failed (wire to backend)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* account for fixed navbar height */}
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-28 pb-10">
        <div className="mb-6 text-center">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            AU Placements
          </h2>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">
              {mode === 'login' ? 'Student Login' : 'Student Registration'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'login'
                ? 'Login with your registered email and password'
                : 'Create your AU Placement account'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Toggle */}
            <div className="bg-muted flex rounded-lg border p-1">
              <Button
                type="button"
                variant={mode === 'login' ? 'default' : 'ghost'}
                className="flex-1"
                aria-pressed={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setErrors({});
                }}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={mode === 'register' ? 'default' : 'ghost'}
                className="flex-1"
                aria-pressed={mode === 'register'}
                onClick={() => {
                  setMode('register');
                  setErrors({});
                }}
              >
                Register
              </Button>
            </div>

            <Separator />

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="login-email">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@au.ac.in"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="login-password">
                    Password
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Use your AU-registered email
                  </span>
                  <button
                    type="button"
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && mode === 'login' ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="auid">
                    AU ID
                  </label>
                  <Input
                    id="auid"
                    placeholder="AU2021XXX"
                    value={registerForm.auid}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, auid: e.target.value }))}
                  />
                  {errors.auid && <p className="text-xs text-red-600">{errors.auid}</p>}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium" htmlFor="firstName">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      value={registerForm.firstName}
                      onChange={(e) =>
                        setRegisterForm((f) => ({
                          ...f,
                          firstName: e.target.value,
                        }))
                      }
                    />
                    {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium" htmlFor="lastName">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      value={registerForm.lastName}
                      onChange={(e) =>
                        setRegisterForm((f) => ({
                          ...f,
                          lastName: e.target.value,
                        }))
                      }
                    />
                    {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="reg-email">
                    Email
                  </label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@au.ac.in"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Phone number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="reg-password">
                    Password
                  </label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm((f) => ({
                        ...f,
                        password: e.target.value,
                      }))
                    }
                  />
                  {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                </div>

                {/* ID Card upload */}
                <div className="space-y-1">
                  <span className="text-sm font-medium">ID Card (Photo)</span>
                  <div className="flex items-center gap-2">
                    <input
                      id="id-card-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleIdCardChange(e.target.files?.[0])}
                    />
                    <label htmlFor="id-card-upload">
                      <Button type="button" variant="outline" asChild>
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload ID card
                        </span>
                      </Button>
                    </label>
                    {idCardFile && (
                      <span className="text-muted-foreground max-w-[150px] truncate text-xs">
                        {idCardFile.name}
                      </span>
                    )}
                  </div>
                  {errors.idCard && <p className="text-xs text-red-600">{errors.idCard}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && mode === 'register' ? 'Registering...' : 'Register'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
