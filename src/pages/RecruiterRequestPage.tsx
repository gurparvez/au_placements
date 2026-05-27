import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import recruitersApi from '@/api/recruiters';
import type { CreateRecruiterRequestPayload } from '@/api/recruiters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const initialForm: CreateRecruiterRequestPayload = {
  company_name: '',
  cin_registration_number: '',
  contact_person: '',
  designation: '',
  official_email: '',
  phone: '',
  website: '',
  company_brief: '',
};

const RecruiterRequestPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (key: keyof CreateRecruiterRequestPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setMessage('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await recruitersApi.createRequest({
        ...form,
        website: form.website?.trim() || undefined,
      });
      setForm(initialForm);
      setMessage('Recruiter request submitted for admin review.');
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to submit recruiter request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-10">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold">Recruiter Access Request</h1>
            <p className="text-muted-foreground text-sm">Third-party company onboarding</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              {message && <div className="rounded-md border border-green-500/40 p-3 text-sm text-green-600">{message}</div>}
              {error && <div className="rounded-md border border-red-500/40 p-3 text-sm text-red-600">{error}</div>}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={form.company_name}
                    onChange={(e) => update('company_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">CIN / Registration Number</label>
                  <Input
                    value={form.cin_registration_number}
                    onChange={(e) => update('cin_registration_number', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input
                    value={form.contact_person}
                    onChange={(e) => update('contact_person', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Designation</label>
                  <Input
                    value={form.designation}
                    onChange={(e) => update('designation', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Official Email</label>
                  <Input
                    type="email"
                    value={form.official_email}
                    onChange={(e) => update('official_email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Website</label>
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Brief About Company</label>
                <Textarea
                  value={form.company_brief}
                  onChange={(e) => update('company_brief', e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default RecruiterRequestPage;
