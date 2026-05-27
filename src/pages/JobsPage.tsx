import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { applyToJob, fetchJobs } from '@/context/job/jobSlice';
import type { JobListing } from '@/api/jobs';

const typeLabel: Record<string, string> = {
  FullTime: 'Full-Time',
  Internship: 'Internship',
  Project: 'Project',
  Campus: 'Campus',
};

const formatDeadline = (value: string) => {
  if (!value) return 'Deadline not set';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const JobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, applyingJobId, error } = useAppSelector((state) => state.jobs);
  const user = useAppSelector((state) => state.auth.user);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [university, setUniversity] = useState('');

  useEffect(() => {
    dispatch(
      fetchJobs({
        type: type || undefined,
        target_university: university || undefined,
      })
    );
  }, [dispatch, type, university]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((job) =>
      [job.company_name, job.title, job.role, job.location, job.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [jobs, query]);

  const handleApply = async (job: JobListing) => {
    const res = await dispatch(applyToJob(job._id));
    if (applyToJob.fulfilled.match(res)) {
      dispatch(
        fetchJobs({
          type: type || undefined,
          target_university: university || undefined,
        })
      );
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-24 pb-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Opportunities</h1>
            <p className="text-muted-foreground text-sm">
              Browse campus jobs, internships, projects, and events.
            </p>
          </div>
          <div className="text-muted-foreground text-sm">{filteredJobs.length} listings shown</div>
        </div>

        <div className="mb-5 space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, role, location..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-card rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Type (Any)</option>
              <option value="FullTime">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Project">Project</option>
              <option value="Campus">Campus Event</option>
            </select>

            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="bg-card rounded-md border px-3 py-2 text-sm"
            >
              <option value="">University (Any)</option>
              <option value="Akal University">Akal University</option>
              <option value="Eternal University">Eternal University</option>
            </select>
          </div>
          <Separator />
        </div>

        {error && <div className="mb-4 rounded-md border border-red-300 p-3 text-sm text-red-600">{error}</div>}

        {loading && <div className="text-muted-foreground text-center text-sm">Loading...</div>}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-muted-foreground mt-10 text-center text-sm">No opportunities found.</div>
        )}

        <div className="grid gap-4">
          {!loading &&
            filteredJobs.map((job) => {
              const eligibility = job.my_eligibility;
              const isEligible = eligibility?.eligible;
              const alreadyApplied = Boolean(job.my_application);
              const canApply = Boolean(user && isEligible && !alreadyApplied);

              return (
                <Card key={job._id}>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-muted-foreground text-sm">{job.company_name}</div>
                        <h2 className="text-xl font-semibold">{job.role || job.title}</h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{typeLabel[job.type] || job.type}</Badge>
                        <Badge variant="outline">{job.target_university}</Badge>
                        {user && eligibility && (
                          <Badge variant={isEligible ? 'default' : 'destructive'}>
                            {isEligible ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                        )}
                        {alreadyApplied && <Badge>Applied</Badge>}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3 text-sm">{job.description}</p>

                    <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        Apply by {formatDeadline(job.deadline)}
                      </span>
                      {job.ctc_stipend && <span>{job.ctc_stipend}</span>}
                    </div>

                    {user && eligibility && !eligibility.eligible && eligibility.reasons.length > 0 && (
                      <div className="bg-muted/50 rounded-md border p-3 text-sm">
                        <div className="font-medium">Why not eligible</div>
                        <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-5">
                          {eligibility.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-2">
                      {!user && (
                        <Button asChild variant="outline">
                          <Link to="/login">Login to Apply</Link>
                        </Button>
                      )}
                      <Button
                        disabled={!canApply || applyingJobId === job._id}
                        onClick={() => handleApply(job)}
                      >
                        {alreadyApplied
                          ? job.my_application?.current_status || 'Applied'
                          : applyingJobId === job._id
                            ? 'Applying...'
                            : 'Apply'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </main>
  );
};

export default JobsPage;
