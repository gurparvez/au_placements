import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchMyApplications } from '@/context/job/jobSlice';
import type { JobListing } from '@/api/jobs';

const ApplicationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applications, error } = useAppSelector((state) => state.jobs);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) dispatch(fetchMyApplications());
  }, [dispatch, user]);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">My Applications</h1>
          <p className="text-muted-foreground text-sm">Track the opportunities you applied to.</p>
        </div>

        {!user && (
          <Card>
            <CardContent className="p-6 text-sm">Login to view your applications.</CardContent>
          </Card>
        )}

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {user && applications.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm">No applications yet.</CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {applications.map((application) => {
            const listing = application.listing as JobListing;
            return (
              <Card key={application._id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm">{listing.company_name}</div>
                    <h2 className="text-lg font-semibold">{listing.role || listing.title}</h2>
                  </div>
                  <Badge>{application.current_status}</Badge>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  Applied on {new Date(application.applied_at).toLocaleDateString('en-IN')}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ApplicationsPage;
