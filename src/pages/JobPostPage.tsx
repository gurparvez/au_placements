import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { createJob } from '@/context/job/jobSlice';
import type { CreateJobPayload, JobType } from '@/api/jobs';

const parseCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseNumberCsv = (value: string) =>
  parseCsv(value)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

const JobPostPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.jobs);
  const user = useAppSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    company_name: '',
    title: '',
    role: '',
    description: '',
    type: 'FullTime' as JobType,
    target_university: 'Both' as CreateJobPayload['target_university'],
    ctc_stipend: '',
    location: '',
    deadline: '',
    contact_person: '',
    min_cgpa: '',
    branches: '',
    programmes: '',
    batch_years: '',
    max_backlogs: '',
    no_active_backlogs: false,
  });

  const canPost = user?.roles?.some((role) =>
    ['admin', 'tpo', 'internal_poster', 'recruiter'].includes(role)
  );

  const update = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateJobPayload = {
      company_name: form.company_name,
      title: form.title,
      role: form.role || form.title,
      description: form.description,
      type: form.type,
      target_university: form.target_university,
      ctc_stipend: form.ctc_stipend || undefined,
      location: form.location || undefined,
      deadline: form.deadline,
      contact_person: form.contact_person || undefined,
      eligibility: {
        min_cgpa: form.min_cgpa ? Number(form.min_cgpa) : undefined,
        allowed_branches: parseCsv(form.branches),
        allowed_programmes: parseCsv(form.programmes),
        allowed_batch_years: parseNumberCsv(form.batch_years),
        max_backlogs: form.max_backlogs ? Number(form.max_backlogs) : undefined,
        no_active_backlogs: form.no_active_backlogs,
      },
    };

    const res = await dispatch(createJob(payload));
    if (createJob.fulfilled.match(res)) {
      navigate('/jobs');
    }
  };

  if (!user) {
    return (
      <main className="bg-background text-foreground min-h-screen px-4 pt-28">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6 text-center text-sm">Login to post an opportunity.</CardContent>
        </Card>
      </main>
    );
  }

  if (!canPost) {
    return (
      <main className="bg-background text-foreground min-h-screen px-4 pt-28">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6 text-center text-sm">
            Your account is not allowed to post opportunities.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pt-24 pb-10">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold">Post Opportunity</h1>
            <p className="text-muted-foreground text-sm">
              Create a listing and compute student eligibility automatically.
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.company_name}
                  onChange={(e) => update('company_name', e.target.value)}
                  placeholder="Company name"
                  required
                />
                <Input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Listing title"
                  required
                />
                <Input
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  placeholder="Role"
                />
                <Input
                  value={form.ctc_stipend}
                  onChange={(e) => update('ctc_stipend', e.target.value)}
                  placeholder="CTC / stipend"
                />
                <Input
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="Location"
                />
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update('deadline', e.target.value)}
                  required
                />
              </div>

              <Textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Description"
                rows={5}
                required
              />

              <div className="grid gap-4 md:grid-cols-3">
                <select
                  value={form.type}
                  onChange={(e) => update('type', e.target.value as JobType)}
                  className="bg-background rounded-md border px-3 py-2 text-sm"
                >
                  <option value="FullTime">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Project">Project</option>
                  <option value="Campus">Campus Event</option>
                </select>

                <select
                  value={form.target_university}
                  onChange={(e) =>
                    update('target_university', e.target.value as CreateJobPayload['target_university'])
                  }
                  className="bg-background rounded-md border px-3 py-2 text-sm"
                >
                  <option value="Both">Both Universities</option>
                  <option value="Akal University">Akal University</option>
                  <option value="Eternal University">Eternal University</option>
                </select>

                <Input
                  value={form.contact_person}
                  onChange={(e) => update('contact_person', e.target.value)}
                  placeholder="Contact person"
                />
              </div>

              <div className="rounded-md border p-4">
                <h2 className="mb-3 text-sm font-semibold">Eligibility</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    value={form.min_cgpa}
                    onChange={(e) => update('min_cgpa', e.target.value)}
                    placeholder="Minimum CGPA"
                  />
                  <Input
                    value={form.max_backlogs}
                    onChange={(e) => update('max_backlogs', e.target.value)}
                    placeholder="Maximum backlogs"
                  />
                  <Input
                    value={form.branches}
                    onChange={(e) => update('branches', e.target.value)}
                    placeholder="Branches, comma-separated"
                  />
                  <Input
                    value={form.programmes}
                    onChange={(e) => update('programmes', e.target.value)}
                    placeholder="Programmes, comma-separated"
                  />
                  <Input
                    value={form.batch_years}
                    onChange={(e) => update('batch_years', e.target.value)}
                    placeholder="Batch years, comma-separated"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.no_active_backlogs}
                      onChange={(e) => update('no_active_backlogs', e.target.checked)}
                    />
                    No active backlogs
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Opportunity'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default JobPostPage;
