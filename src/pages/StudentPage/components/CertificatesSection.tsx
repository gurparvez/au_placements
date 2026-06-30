import React, { useEffect, useState } from 'react';
import { Award, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SectionCard from './SectionCard';
import { formatDate } from '@/utils/formatDate';

interface CertItem {
  _id?: string;
  name: string;
  issued_by: string;
  issue_date: string;
  certificate_url?: string;
  valid_until?: string;
}

const toInputDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

const CertificatesSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.student);

  const [open, setOpen] = useState(false);
  const [list, setList] = useState<CertItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setList((profile?.certificates as CertItem[]) ?? []);
  }, [open, profile]);

  if (!profile) return null;

  const change = (i: number, field: keyof CertItem, value: string) =>
    setList((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const addRow = () =>
    setList((prev) => [...prev, { name: '', issued_by: '', issue_date: '' }]);

  const removeRow = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = list.filter((c) => c.name.trim() && c.issued_by.trim() && c.issue_date);
      await dispatch(updateStudentProfile({ certificates: cleaned })).unwrap();
      toast.success('Certificates updated');
      setOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const items = (profile.certificates as CertItem[]) ?? [];

  return (
    <>
      <SectionCard
        title="Licenses & certifications"
        onEdit={() => setOpen(true)}
        isEmpty={items.length === 0}
      >
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add certifications and courses you've completed.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {items.map((c) => (
              <li key={c._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="bg-surface-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Award className="text-muted-foreground h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-medium">{c.name}</h3>
                  <p className="text-muted-foreground text-sm">{c.issued_by}</p>
                  <p className="data text-text-subtle mt-0.5 text-xs">
                    Issued {formatDate(c.issue_date)}
                    {c.valid_until ? ` · Expires ${formatDate(c.valid_until)}` : ''}
                  </p>
                  {c.certificate_url && (
                    <a
                      href={c.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-1.5 inline-flex items-center gap-1 text-xs hover:underline"
                    >
                      Show credential <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit certifications</DialogTitle>
            <DialogDescription>Add the credentials you've earned.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {list.map((c, i) => (
              <div key={i} className="bg-bg-2 relative rounded-lg border border-border p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-danger absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeRow(i)}
                  aria-label={`Delete certificate ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`cert-name-${i}`} className="mb-1.5 block text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id={`cert-name-${i}`}
                      value={c.name}
                      onChange={(e) => change(i, 'name', e.target.value)}
                      placeholder="AWS Certified Cloud Practitioner"
                    />
                  </div>
                  <div>
                    <label htmlFor={`cert-issuer-${i}`} className="mb-1.5 block text-sm font-medium">
                      Issuing organisation
                    </label>
                    <Input
                      id={`cert-issuer-${i}`}
                      value={c.issued_by}
                      onChange={(e) => change(i, 'issued_by', e.target.value)}
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label htmlFor={`cert-issue-${i}`} className="mb-1.5 block text-sm font-medium">
                      Issue date
                    </label>
                    <Input
                      id={`cert-issue-${i}`}
                      type="date"
                      value={toInputDate(c.issue_date)}
                      onChange={(e) => change(i, 'issue_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`cert-valid-${i}`} className="mb-1.5 block text-sm font-medium">
                      Expiry date <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id={`cert-valid-${i}`}
                      type="date"
                      value={toInputDate(c.valid_until)}
                      onChange={(e) => change(i, 'valid_until', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`cert-url-${i}`} className="mb-1.5 block text-sm font-medium">
                      Credential URL <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id={`cert-url-${i}`}
                      value={c.certificate_url ?? ''}
                      onChange={(e) => change(i, 'certificate_url', e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={addRow}>
              <Plus className="mr-1 h-4 w-4" aria-hidden /> Add certification
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden /> Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificatesSection;
