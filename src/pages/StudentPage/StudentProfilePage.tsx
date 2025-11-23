import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/context/hooks';
import { fetchStudentProfile } from '@/context/student/studentSlice';
import ProfileHero from './components/ProfileHero';

const StudentProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error } = useAppSelector((s) => s.student);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  if (loading) return <div className="p-10 mt-10 text-center text-lg">Loading…</div>;

  if (error) return <div className="p-10 mt-10 text-center text-lg text-red-500">⚠️ Error: {error}</div>;

  if (!profile)
    return (
      <div className="p-10 mt-10 text-center text-lg text-red-500">
        No profile found. Create your profile first.
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 mt-10">
      <ProfileHero />
    </div>
  );
};

export default StudentProfilePage;
