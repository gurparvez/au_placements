import React, { useEffect, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';

interface EditPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage?: string;
  fallback?: string;
}

const EditPhotoDialog: React.FC<EditPhotoDialogProps> = ({
  open,
  onOpenChange,
  currentImage,
  fallback = 'U',
}) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset local state whenever the dialog closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview((p) => {
        if (p) URL.revokeObjectURL(p);
        return null;
      });
    }
  }, [open]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSelect = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, WebP).');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }
    setFile(f);
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return URL.createObjectURL(f);
    });
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await dispatch(updateStudentProfile({ profile_image: file })).unwrap();
      toast.success('Profile photo updated');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Could not update photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Profile photo</DialogTitle>
          <DialogDescription>
            A clear headshot helps recruiters recognise you. JPG, PNG or WebP, up to 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <Avatar className="ring-border h-32 w-32 ring-1">
            <AvatarImage src={preview || currentImage || undefined} alt="Profile preview" />
            <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
          </Avatar>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleSelect(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" aria-hidden /> Choose photo
          </Button>
          {file && <span className="text-muted-foreground max-w-full truncate text-xs">{file.name}</span>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!file || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden /> Saving…
              </>
            ) : (
              'Save photo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPhotoDialog;
