import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Info, RefreshCw, XCircle } from 'lucide-react';
import recruitersApi from '@/api/recruiters';
import type {
  RecruiterAccountRequest,
  RecruiterRequestStatus,
  RecruiterReviewAction,
  ReviewRecruiterRequestResult,
} from '@/api/recruiters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/context/hooks';

const statusOptions: (RecruiterRequestStatus | '')[] = [
  'Pending',
  'MoreInfoRequested',
  'Approved',
  'Rejected',
  '',
];

const statusLabel: Record<string, string> = {
  Pending: 'Pending',
  MoreInfoRequested: 'More Info',
  Approved: 'Approved',
  Rejected: 'Rejected',
  '': 'All',
};

const statusVariant = (status: RecruiterRequestStatus): 'default' | 'destructive' | 'secondary' => {
  if (status === 'Approved') return 'default';
  if (status === 'Rejected') return 'destructive';
  return 'secondary';
};

const AdminRecruiterRequestsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const canReview = user?.roles?.some((role) => ['admin', 'tpo'].includes(role));

  const [status, setStatus] = useState<RecruiterRequestStatus | ''>('Pending');
  const [requests, setRequests] = useState<RecruiterAccountRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState('');
  const [error, setError] = useState('');
  const [lastApproval, setLastApproval] = useState<ReviewRecruiterRequestResult | null>(null);

  const load = async () => {
    if (!canReview) return;

    setLoading(true);
    setError('');
    try {
      const data = await recruitersApi.listRequests(status);
      setRequests(data);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to load recruiter requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [canReview, status]);

  const review = async (requestId: string, action: RecruiterReviewAction) => {
    setReviewingId(requestId);
    setError('');
    setLastApproval(null);

    try {
      const result = await recruitersApi.reviewRequest(requestId, {
        action,
        decision_note: notes[requestId]?.trim() || undefined,
      });
      if (result.temporary_password) setLastApproval(result);
      await load();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to review recruiter request.');
      }
    } finally {
      setReviewingId('');
    }
  };

  if (!user) {
    return (
      <main className="bg-background text-foreground min-h-screen px-4 pt-28">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6 text-center text-sm">Login to review recruiter requests.</CardContent>
        </Card>
      </main>
    );
  }

  if (!canReview) {
    return (
      <main className="bg-background text-foreground min-h-screen px-4 pt-28">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6 text-center text-sm">
            Your account cannot review recruiter requests.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Recruiter Requests</h1>
            <p className="text-muted-foreground text-sm">Third-party company account approvals</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RecruiterRequestStatus | '')}
              className="bg-card rounded-md border px-3 py-2 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {statusLabel[option]}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-md border border-red-500/40 p-3 text-sm text-red-600">{error}</div>}

        {lastApproval?.temporary_password && (
          <div className="mb-4 rounded-md border border-green-500/40 p-3 text-sm text-green-600">
            Recruiter login created: {lastApproval.login_identifier} /{' '}
            {lastApproval.temporary_password}
          </div>
        )}

        {loading && <div className="text-muted-foreground text-center text-sm">Loading...</div>}

        {!loading && requests.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm">No recruiter requests found.</CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-muted-foreground text-sm">
                      {request.cin_registration_number}
                    </div>
                    <h2 className="text-xl font-semibold">{request.company_name}</h2>
                  </div>
                  <Badge variant={statusVariant(request.status)}>
                    {statusLabel[request.status]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Contact</span>
                    <div>{request.contact_person}</div>
                    <div className="text-muted-foreground">{request.designation}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email</span>
                    <div>{request.official_email}</div>
                    <div className="text-muted-foreground">{request.phone}</div>
                  </div>
                  {request.website && (
                    <div>
                      <span className="text-muted-foreground">Website</span>
                      <div>{request.website}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Submitted</span>
                    <div>{new Date(request.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">{request.company_brief}</p>

                {request.decision_note && (
                  <div className="bg-muted rounded-md border p-3 text-sm">
                    <span className="font-medium">Decision note</span>
                    <p className="text-muted-foreground mt-1">{request.decision_note}</p>
                  </div>
                )}

                {request.status !== 'Approved' && (
                  <Textarea
                    value={notes[request._id] || ''}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [request._id]: e.target.value }))
                    }
                    placeholder="Decision note"
                    rows={2}
                  />
                )}

                {request.status !== 'Approved' && (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => review(request._id, 'approve')}
                      disabled={reviewingId === request._id}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => review(request._id, 'request_info')}
                      disabled={reviewingId === request._id}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Request Info
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => review(request._id, 'reject')}
                      disabled={reviewingId === request._id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminRecruiterRequestsPage;
