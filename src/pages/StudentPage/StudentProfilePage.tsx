import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { useAppSelector, useAppDispatch } from '@/context/hooks';
import { fetchStudentProfile, clearStudentState } from '@/context/student/studentSlice';
import { logoutUser, clearAuth, updateUserPassword } from '@/context/auth/authSlice';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectSection';
import SkillsSection from './components/SkillsSection';
import EducationSection from './components/EducationSection';
import CertificatesSection from './components/CertificatesSection';

const StatusScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 pt-24 pb-16">
    <Card className="w-full max-w-md items-center gap-0 p-8 text-center">{children}</Card>
  </div>
);

/* ----------------------- Change password dialog ----------------------- */

const ChangePasswordDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setOldPassword('');
      setNewPassword('');
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateUserPassword({ oldPassword, newPassword })).unwrap();
      toast.success('Password updated');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Enter your current password and a new one.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="cp-old" className="mb-1.5 block text-sm font-medium">
              Current password
            </label>
            <Input
              id="cp-old"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cp-new" className="mb-1.5 block text-sm font-medium">
              New password
            </label>
            <Input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !oldPassword || !newPassword}>
            {saving ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden /> Saving…
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ----------------------------- Page shell ----------------------------- */

const StudentProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { profile, loading, error } = useAppSelector((s) => s.student);
  const authUser = useAppSelector((s) => s.auth.user);

  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (authUser) dispatch(fetchStudentProfile());
  }, [dispatch, authUser]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(clearAuth());
      dispatch(clearStudentState());
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!authUser) {
    return (
      <StatusScreen>
        <span className="eyebrow">Restricted</span>
        <h1 className="mt-3 text-2xl font-semibold">Please sign in first</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          You need an account to view and edit your profile.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate('/login')}>Sign in</Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </StatusScreen>
    );
  }

  if (loading && !profile) {
    return (
      <StatusScreen>
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" aria-hidden />
        <p className="text-muted-foreground mt-3 text-sm">Loading your profile…</p>
      </StatusScreen>
    );
  }

  if (error && !profile) {
    return (
      <StatusScreen>
        <span className="eyebrow text-destructive">Error</span>
        <p className="text-foreground mt-3 text-base">{error}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => dispatch(fetchStudentProfile())}>Try again</Button>
        </div>
      </StatusScreen>
    );
  }

  if (!profile) {
    return (
      <StatusScreen>
        <span className="eyebrow">No profile yet</span>
        <h1 className="mt-3 text-2xl font-semibold">Create your profile</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          You don't have a profile yet — let's build one.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate('/profiles/create')}>Create profile</Button>
          <Button variant="destructive" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </StatusScreen>
    );
  }

  return (
    <div className="bg-secondary/30 text-foreground min-h-screen">
      <div className="mx-auto w-full max-w-[1080px] space-y-4 px-6 pt-24 pb-16">
        <ProfileHeader />
        <AboutSection />
        <ExperienceSection />
        <EducationSection />
        <ProjectsSection />
        <SkillsSection />
        <CertificatesSection />
        <ContactSection />

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setPwOpen(true)}>
            <KeyRound className="mr-1 h-4 w-4" aria-hidden /> Change password
          </Button>
          <Button onClick={handleLogout} variant="destructive">
            Log out
          </Button>
        </div>
      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
};

export default StudentProfilePage;
