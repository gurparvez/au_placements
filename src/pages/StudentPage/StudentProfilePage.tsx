import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "@/context/hooks";
import { fetchStudentProfile, clearStudentState } from "@/context/student/studentSlice";
import { logoutUser, clearAuth } from "@/context/auth/authSlice";

import ProfileHero from "./components/ProfileHero";
import { Button } from "@/components/ui/button";
import ContactSection from "./components/ContactSection";
import ExperienceSection from "./components/ExperienceSection";
import ProjectsSection from "./components/ProjectSection";
import SkillsSection from "./components/SkillsSection";
import EducationSection from "./components/EducationSection";

const StudentProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { profile, loading, error } = useAppSelector((s) => s.student);
  const authUser = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    // Only fetch profile if user is logged in
    if (authUser) {
      dispatch(fetchStudentProfile());
    }
  }, [dispatch, authUser]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      dispatch(clearAuth());
      dispatch(clearStudentState());

      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ⛔ If NOT logged in
  if (!authUser) {
    return (
      <div className="mt-10 p-10 text-center text-lg">
        <div className="text-red-500 mb-4">No user found. Please log in first.</div>

        <div className="mt-4 flex gap-4 justify-center">
          <Button onClick={() => navigate("/login")}>Login</Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Home
          </Button>
        </div>
      </div>
    );
  }

  // ⏳ Loading
  if (loading) {
    return <div className="mt-10 p-10 text-center text-lg">Loading…</div>;
  }

  // ❌ API error (user exists but API failed)
  if (error) {
    return (
      <div className="mt-10 p-10 text-center text-lg text-red-500">
        ⚠️ Error: {error}
      </div>
    );
  }

  // ⚠️ Logged-in user but NO profile exists
  if (!profile) {
    return (
      <div className="mt-10 p-10 text-center text-lg">
        <div className="text-red-500 mb-4">No profile found. Create your profile first.</div>

        <div className="mt-4 flex gap-4 justify-center">
          <Button onClick={() => navigate("/profiles/create")}>Create Profile</Button>

          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // 🎉 Profile exists
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="bg-muted h-48 w-full rounded-md"></div>
      <ProfileHero />
      <ContactSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <EducationSection />
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
    </div>
  );
};

export default StudentProfilePage;
