import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchJobApplicants, updateJobApplicationStatus } from '@/context/job/jobSlice';

const statuses = [
  'Applied',
  'Shortlisted',
  'InterviewScheduled',
  'Selected',
  'Rejected',
  'Offer Accepted',
  'Offer Declined',
];

const JobApplicantsPage: React.FC = () => {
  const { jobId } = useParams();
  const dispatch = useAppDispatch();
  const { applicants, loading, error } = useAppSelector((state) => state.jobs);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobId) dispatch(fetchJobApplicants(jobId));
  }, [dispatch, jobId]);

  const handleUpdate = async (applicationId: string) => {
    if (!jobId) return;
    await dispatch(
      updateJobApplicationStatus({
        jobId,
        applicationId,
        status: statusDrafts[applicationId],
        note: notes[applicationId],
      })
    );
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Applicants</h1>
          <p className="text-muted-foreground text-sm">
            Review applications and update candidate status.
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {loading && <p className="text-muted-foreground text-sm">Loading applicants...</p>}
        {!loading && applicants.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm">No applicants found.</CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {applicants.map((application) => {
            const user = application.user || {};
            const student = application.student || {};
            const selectedStatus = statusDrafts[application._id] || application.current_status;

            return (
              <Card key={application._id}>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold capitalize">
                      {user.firstName} {user.lastName}
                    </h2>
                    <div className="text-muted-foreground text-sm">
                      {user.programme} | {user.branch_department} | Batch {user.batch_year}
                    </div>
                    {student.cgpa_current !== undefined && (
                      <div className="text-muted-foreground text-sm">
                        Current CGPA: {student.cgpa_current}
                      </div>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Applied {new Date(application.applied_at).toLocaleDateString('en-IN')}
                  </div>
                </CardHeader>

                <CardContent className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setStatusDrafts((prev) => ({
                        ...prev,
                        [application._id]: e.target.value,
                      }))
                    }
                    className="bg-background rounded-md border px-3 py-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <Input
                    value={notes[application._id] || ''}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [application._id]: e.target.value }))
                    }
                    placeholder="Optional note"
                  />

                  <Button onClick={() => handleUpdate(application._id)}>Update</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default JobApplicantsPage;
