import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Plus, Trash2, Briefcase } from 'lucide-react';

// Interface matching your backend schema roughly
interface ExperienceItem {
  _id?: string;
  role: string;
  company: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

const ExperienceSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);

  // Local state for the list of experiences
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile?.experience) {
      setExperienceList(profile.experience);
    }
  }, [profile]);

  if (!profile) return null;

  // --- Handlers ---

  const handleInputChange = (index: number, field: keyof ExperienceItem, value: string) => {
    const updatedList = [...experienceList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setExperienceList(updatedList);
  };

  const handleAddNew = () => {
    setExperienceList([
      ...experienceList,
      { role: '', company: '', start_date: '', description: '' },
    ]);
  };

  const handleDelete = (index: number) => {
    const updatedList = experienceList.filter((_, i) => i !== index);
    setExperienceList(updatedList);
  };

  const handleCancel = () => {
    setExperienceList(profile.experience || []);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Dispatch the ENTIRE array to replace the current list on the backend
    dispatch(updateStudentProfile({ experience: experienceList }));
    setIsEditing(false);
  };

  // Helper to format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-lg font-semibold">Experience</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* --- VIEW MODE --- */}
        {!isEditing && (
          <div className="space-y-4">
            {profile.experience.length === 0 && (
              <p className="text-muted-foreground text-sm">No experience added.</p>
            )}

            {profile.experience.map((exp) => (
              <div key={exp._id} className="bg-muted rounded-md p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      {exp.role}
                    </h3>
                    <p className="text-muted-foreground text-sm">{exp.company}</p>
                  </div>
                  <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(exp.start_date).getFullYear()} –{' '}
                    {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
          <div className="space-y-6">
            {experienceList.map((exp, index) => (
              <div key={index} className="border-muted relative rounded-md border p-4 shadow-sm">
                
                {/* Delete Button (Top Right of individual item) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid gap-3">
                  {/* Role & Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Role</label>
                      <Input
                        value={exp.role}
                        onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Company</label>
                      <Input
                        value={exp.company}
                        onChange={(e) => handleInputChange(index, 'company', e.target.value)}
                        placeholder="Google, etc."
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={formatDateForInput(exp.start_date)}
                        onChange={(e) => handleInputChange(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">End Date (Leave blank if Present)</label>
                      <Input
                        type="date"
                        value={formatDateForInput(exp.end_date)}
                        onChange={(e) => handleInputChange(index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium">Description</label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      placeholder="Describe your responsibilities..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Button */}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={handleAddNew}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>

            {/* Save/Cancel Actions */}
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

export default ExperienceSection;
