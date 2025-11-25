import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Loader2 } from 'lucide-react';
import SkillPicker from '@/components/SkillPicker';
import skillsApi, { type Skill } from '@/api/skills';

const SkillsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);

  // State
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [resolvedSkills, setResolvedSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [resolving, setResolving] = useState(false);

  // --- 1. Load & Resolve Skills ---
  useEffect(() => {
    const resolveProfileSkills = async () => {
      if (!profile?.skills) return;

      setResolving(true);
      try {
        // 1. Separate IDs from Objects
        const rawSkills = profile.skills;
        
        // Determine IDs for the Edit State
        const ids: string[] = rawSkills.map((s: any) => 
          typeof s === 'string' ? s : s._id
        );
        setSkillIds(ids);

        // 2. Resolve Full Objects for UI Display
        // If the API already populated them, use them. If they are strings, fetch them.
        const skillPromises = rawSkills.map(async (s: any) => {
          if (typeof s === 'object' && s.name) {
            return s as Skill;
          }
          // It's an ID, fetch it
          try {
            const res = await skillsApi.getSkillById(s);
            return res.skill;
          } catch (e) {
            return null;
          }
        });

        const results = await Promise.all(skillPromises);
        const validSkills = results.filter((s): s is Skill => s !== null);
        
        setResolvedSkills(validSkills);

      } catch (error) {
        console.error("Error resolving skills:", error);
      } finally {
        setResolving(false);
      }
    };

    resolveProfileSkills();
  }, [profile]);

  if (!profile) return null;

  // --- Handlers ---

  const handleSkillsChange = (newIds: string[]) => {
    setSkillIds(newIds);
    // Note: We don't verify names here locally; SkillPicker handles the UI 
    // and resolvedSkills will update after save -> success -> useEffect re-run
  };

  const handleCancel = () => {
    // Reset to profile state
    const ids = profile.skills.map((s: any) => (typeof s === 'string' ? s : s._id));
    setSkillIds(ids);
    setIsEditing(false);
  };

  const handleSave = () => {
    dispatch(updateStudentProfile({ skills: skillIds }));
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-lg font-semibold">Skills</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={resolving}
            className="h-8 w-8 p-0"
          >
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {/* --- VIEW MODE --- */}
        {!isEditing && (
          <div className="flex flex-wrap gap-2">
            {resolving && resolvedSkills.length === 0 && (
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                 <Loader2 className="h-3 w-3 animate-spin" /> Loading skills...
              </p>
            )}

            {!resolving && resolvedSkills.length === 0 && (
              <p className="text-muted-foreground text-sm">No skills added yet.</p>
            )}

            {resolvedSkills.map((s) => (
              <div
                key={s._id}
                className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium"
              >
                {s.displayName || s.name}
              </div>
            ))}
          </div>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
          <div className="space-y-4">
            <SkillPicker
              selected={skillIds}
              setSelected={handleSkillsChange}
              // Pass resolved skills so chips show names immediately
              initialData={resolvedSkills}
              label="Search & Add Skills"
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;