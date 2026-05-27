import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { markStudentProfileReviewed } from '@/context/student/studentSlice';
import { formatDate } from '@/utils/formatDate';

const StudentCoreSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);
  const { user } = useAppSelector((state) => state.auth);

  if (!profile) return null;

  const completion = profile.profile_completion ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Student Core</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">Version {profile.profile_version || 1}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => dispatch(markStudentProfileReviewed())}
            >
              Confirm Review
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Profile Completion</span>
            <span className="text-muted-foreground">{completion}%</span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </div>

        {profile.cgpa_current !== undefined && (
          <div className="text-sm">
            <span className="text-muted-foreground">Current CGPA: </span>
            <span className="font-medium">{profile.cgpa_current}</span>
          </div>
        )}

        {profile.last_profile_reviewed_at && (
          <div className="text-muted-foreground text-sm">
            Last reviewed {formatDate(profile.last_profile_reviewed_at)}
          </div>
        )}

        {(user?.programme || user?.branch_department || user?.batch_year) && (
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            {user?.programme && (
              <div>
                <span className="text-muted-foreground">Programme: </span>
                <span className="font-medium">{user.programme}</span>
              </div>
            )}
            {user?.branch_department && (
              <div>
                <span className="text-muted-foreground">Branch/Department: </span>
                <span className="font-medium">{user.branch_department}</span>
              </div>
            )}
            {user?.batch_year && (
              <div>
                <span className="text-muted-foreground">Batch: </span>
                <span className="font-medium">{user.batch_year}</span>
              </div>
            )}
          </div>
        )}

        {profile.academic_records?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Academic Records</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {profile.academic_records.map((record) => (
                <div key={record._id} className="bg-muted/40 rounded-md border p-3 text-sm">
                  <div className="font-medium">Semester {record.semester}</div>
                  <div className="text-muted-foreground">
                    {record.academic_year || 'Academic year not set'}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {record.cgpa !== undefined && <span>CGPA {record.cgpa}</span>}
                    {record.marks_percentage !== undefined && (
                      <span>Marks {record.marks_percentage}%</span>
                    )}
                    <span>Backlogs {record.backlog_count ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.links?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Additional Links</h3>
            <div className="flex flex-wrap gap-2">
              {profile.links.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-muted hover:text-primary inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {profile.supporting_documents?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Supporting Documents</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {profile.supporting_documents.map((document) => (
                <a
                  key={document._id}
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-muted hover:text-primary flex items-center gap-2 rounded-md border p-3 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{document.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {(profile.achievements?.length > 0 || profile.extracurricular_activities?.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {profile.achievements?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Achievements</h3>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  {profile.achievements.map((achievement) => (
                    <li key={achievement._id}>{achievement.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {profile.extracurricular_activities?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Extra-Curricular Activities</h3>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  {profile.extracurricular_activities.map((activity) => (
                    <li key={activity._id}>{activity.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCoreSection;
