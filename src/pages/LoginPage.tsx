import React, { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '@/context/store';
import { loginUser, registerUser } from '@/context/auth/authSlice';
import { useNavigate } from 'react-router-dom';

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
  auid: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux auth state
  const authLoading = useSelector((s: RootState) => s.auth.loading);
  const authError = useSelector((s: RootState) => s.auth.error);
  const user = useSelector((s: RootState) => s.auth.user);

  const [mode, setMode] = useState<AuthMode>('login');

  const [loginForm, setLoginForm] = useState<LoginForm>({
    auid: '',
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

  /* ----------------------- ID Card Validation ----------------------- */
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

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        idCard: 'File must be 5MB or smaller',
      }));
      return;
    }

    setIdCardFile(file);
  };

  /* ----------------------- Register Validation ----------------------- */
  const validateRegister = () => {
    const e: { [k: string]: string } = {};

    if (!registerForm.auid.trim()) e.auid = 'AU ID is required';
    if (!registerForm.firstName.trim()) e.firstName = 'First name is required';
    if (!registerForm.lastName.trim()) e.lastName = 'Last name is required';

    if (!registerForm.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim()))
      e.email = 'Enter a valid email';

    if (!registerForm.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(registerForm.phone.trim()))
      e.phone = 'Enter a valid 10-digit phone number';

    if (!registerForm.password.trim()) e.password = 'Password is required';
    if (!idCardFile) e.idCard = 'ID card image is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* --------------------------- LOGIN --------------------------- */
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const res = await dispatch(
      loginUser({
        auid: loginForm.auid.trim(),
        password: loginForm.password.trim(),
      })
    );

    if (loginUser.fulfilled.match(res)) {
      navigate('/profiles');
    }
  };

  /* -------------------------- REGISTER -------------------------- */
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    const res = await dispatch(
      registerUser({
        ...registerForm,
        id_card: idCardFile!,
      })
    );

    if (registerUser.fulfilled.match(res)) {
      navigate('/profiles/create');
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
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
                ? 'Login with your AU ID and password'
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
                {authError && <p className="text-sm text-red-600">{authError}</p>}

                <div className="space-y-1">
                  <label className="text-sm font-medium">AUID</label>
                  <Input
                    placeholder="227106009"
                    value={loginForm.auid}
                    onChange={(e) => setLoginForm((f) => ({ ...f, auid: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? 'Logging in…' : 'Login'}
                </Button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                {authError && <p className="text-sm text-red-600">{authError}</p>}

                {/* AU ID */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">AU ID</label>
                  <Input
                    value={registerForm.auid}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, auid: e.target.value }))}
                  />
                  {errors.auid && <p className="text-xs text-red-600">{errors.auid}</p>}
                </div>

                {/* Name Fields */}
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
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
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
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

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
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

                {/* ID Card Upload */}
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

                    <Button asChild variant="outline" type="button">
                      <label
                        htmlFor="id-card-upload"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </label>
                    </Button>

                    {idCardFile && (
                      <span className="text-muted-foreground max-w-[150px] truncate text-xs">
                        {idCardFile.name}
                      </span>
                    )}
                  </div>

                  {errors.idCard && <p className="text-xs text-red-600">{errors.idCard}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? 'Registering…' : 'Register'}
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
