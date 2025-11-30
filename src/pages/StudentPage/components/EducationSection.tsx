import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { type EducationPayload } from '@/api/students.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Plus, Trash2, GraduationCap, Loader2 } from 'lucide-react';
import CoursePicker from '@/components/CoursePicker';
import type { Course } from '@/api/courses';
import coursesApi from '@/api/courses'; // 🟢 Assuming you have this, or use axios directly

// Local Interface for UI State
interface EducationUI {
  _id?: string;
  institute: string;
  from_date: string;
  to_date: string;
  course: string; // ID (for API)
  course_name?: string; // Display Name (for Picker UI & View Mode)
  specialization?: string;
}

const EducationSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);

  // Local state
  const [eduList, setEduList] = useState<EducationUI[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [resolving, setResolving] = useState(false);

  // 🟢 Sync & Resolve Data
  useEffect(() => {
    const resolveEducationData = async () => {
      if (!profile?.education) return;

      setResolving(true);

      // Map over the profile education and resolve course names if missing
      const resolvedData = await Promise.all(
        profile.education.map(async (edu: any) => {
          let courseId = '';
          let courseName = '';

          // Check if course is Populated Object or String ID
          if (edu.course && typeof edu.course === 'object') {
            courseId = edu.course._id;
            courseName = edu.course.name;
          } else if (typeof edu.course === 'string') {
            courseId = edu.course;
            // If we only have ID, we try to fetch the name (or fallback)
            try {
              // 🟢 Fetch course details if it's just a string ID
              const res = await coursesApi.getCourseById(courseId);
              courseName = res.course.name;
            } catch (e) {
              console.error('Failed to fetch course name', e);
              courseName = 'Unknown Course';
            }
          }

          return {
            _id: edu._id,
            institute: edu.institute || '',
            from_date: edu.from_date ? new Date(edu.from_date).toISOString().split('T')[0] : '',
            to_date: edu.to_date ? new Date(edu.to_date).toISOString().split('T')[0] : '',
            course: courseId,
            course_name: courseName, // 🟢 Now we definitely have a name
            specialization: edu.specialization || '',
          };
        })
      );

      setEduList(resolvedData);
      setResolving(false);
    };

    resolveEducationData();
  }, [profile]);

  if (!profile) return null;

  // --- Handlers ---

  const handleInputChange = (index: number, field: keyof EducationUI, value: string) => {
    const updatedList = [...eduList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setEduList(updatedList);
  };

  const handleCourseSelect = (index: number, course: Course) => {
    const updatedList = [...eduList];
    updatedList[index] = {
      ...updatedList[index],
      course: course._id,
      course_name: course.name,
    };
    setEduList(updatedList);
  };

  const handleAddNew = () => {
    setEduList([
      ...eduList,
      { institute: '', course: '', course_name: '', from_date: '', to_date: '' },
    ]);
  };

  const handleDelete = (index: number) => {
    const updatedList = eduList.filter((_, i) => i !== index);
    setEduList(updatedList);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Data re-syncs automatically via useEffect
  };

  const handleSave = () => {
    const isValid = eduList.every((e) => e.institute && e.course && e.from_date && e.to_date);
    if (!isValid) {
      alert('Institute, Course, and Dates are required.');
      return;
    }

    const payload: EducationPayload[] = eduList.map((e) => ({
      institute: e.institute,
      course: e.course, // Send ID
      from_date: e.from_date,
      to_date: e.to_date,
      specialization: e.specialization || undefined,
    }));

    dispatch(updateStudentProfile({ education: payload }));
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-lg font-semibold">Education</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
            disabled={resolving}
          >
            {resolving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* --- VIEW MODE --- */}
        {/* 🟢 We now read from 'eduList' because it is fully resolved with names */}
        {!isEditing && (
          <div className="space-y-4">
            {resolving && (
              <div className="text-muted-foreground text-sm">Loading education details...</div>
            )}

            {!resolving && eduList.length === 0 && (
              <p className="text-muted-foreground text-sm">No education details added.</p>
            )}

            {!resolving &&
              eduList.map((edu) => (
                <div key={edu._id || Math.random()} className="bg-muted/40 rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        {edu.institute}
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        {/* 🟢 Display the resolved name */}
                        {edu.course_name || 'Loading Course...'}
                        <span className="mx-1">•</span>
                        {new Date(edu.from_date).getFullYear()} –{' '}
                        {new Date(edu.to_date).getFullYear()}
                      </div>
                    </div>
                  </div>

                  {edu.specialization && (
                    <div className="text-muted-foreground mt-2 text-sm">
                      <span className="text-foreground/80 font-medium">Specialization:</span>{' '}
                      {edu.specialization}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
          <div className="space-y-6">
            {eduList.map((edu, index) => (
              <div key={index} className="border-muted relative rounded-md border p-4 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-medium">Institute / College *</label>
                    <Input
                      value={edu.institute}
                      onChange={(e) => handleInputChange(index, 'institute', e.target.value)}
                      placeholder="e.g. Harvard University"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">Degree / Course *</label>
                    <CoursePicker
                      value={edu.course_name}
                      onSelect={(course) => handleCourseSelect(index, course)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium">From *</label>
                      <Input
                        type="date"
                        value={edu.from_date}
                        onChange={(e) => handleInputChange(index, 'from_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">To *</label>
                      <Input
                        type="date"
                        value={edu.to_date}
                        onChange={(e) => handleInputChange(index, 'to_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Specialization (Optional)</label>
                    <Input
                      value={edu.specialization}
                      onChange={(e) => handleInputChange(index, 'specialization', e.target.value)}
                      placeholder="e.g. Artificial Intelligence"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>

            <div className="flex justify-end gap-2 border-t pt-2">
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

export default EducationSection;
