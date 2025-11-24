import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "@/context/hooks";
import { fetchStudentProfile, clearStudentState } from "@/context/student/studentSlice";
import { logoutUser, clearAuth } from "@/context/auth/authSlice";

import ProfileHero from "./components/ProfileHero";
import { Button } from "@/components/ui/button";

const StudentProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { profile, loading, error } = useAppSelector((s) => s.student);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      // Clear both slices
      dispatch(clearAuth());
      dispatch(clearStudentState());

      // Redirect
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return <div className="mt-10 p-10 text-center text-lg">Loading…</div>;

  if (error)
    return <div className="mt-10 p-10 text-center text-lg text-red-500">⚠️ Error: {error}</div>;

  if (!profile)
    return (
      <div className="mt-10 p-10 text-center text-lg text-red-500">
        No profile found. Create your profile first.
      </div>
    );

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl space-y-6 px-4 py-8">
      <ProfileHero />
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
    </div>
  );
};

export default StudentProfilePage;
