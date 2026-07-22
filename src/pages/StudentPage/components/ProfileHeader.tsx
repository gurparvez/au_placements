import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Pencil, MapPin, ExternalLink, IdCard, Lock } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/context/hooks';
import { avatarColor, initials } from '@/utils/avatar';
import { availLabel } from '@/utils/dates';
import { getProfileCompleteness } from '../lib/completeness';
import EditPhotoDialog from './EditPhotoDialog';
import EditIntroDialog from './EditIntroDialog';

const ProfileHeader: React.FC = () => {
  const { profile } = useAppSelector((s) => s.student);
  const { user } = useAppSelector((s) => s.auth);

  const [photoOpen, setPhotoOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);

  if (!profile || !user) return null;

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const initial = initials(user.firstName, user.lastName) || 'U';
  const { percent, missing } = getProfileCompleteness(profile);

  const lf = profile.looking_for;
  const avail = availLabel(lf);

  return (
    <Card className="gap-0 overflow-hidden p-0">
      {/* Cover band — editorial register masthead */}
      <div
        className="relative h-24 w-full sm:h-28"
        style={{
          background: 'linear-gradient(120deg, var(--surface-2), var(--surface-3))',
          borderBottom: '2px solid var(--brass)',
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(70% 140% at 10% 0%, color-mix(in srgb, var(--brass) 14%, transparent), transparent 62%)' }}
        />
        <span className="ledger-label absolute top-3.5 left-5">The Akal &amp; Eternal Register</span>
      </div>

      <div className="px-5 pb-6 sm:px-7">
        {/* Avatar overlapping cover */}
        <div className="-mt-12 sm:-mt-14">
          <div className="relative inline-block">
            <Avatar className="ring-card h-24 w-24 ring-4 sm:h-28 sm:w-28">
              <AvatarImage src={profile.profile_image || undefined} alt={fullName || 'Profile photo'} />
              <AvatarFallback
                className="text-3xl font-semibold text-white"
                style={{ backgroundColor: avatarColor(fullName) }}
              >
                {initial}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              aria-label="Change profile photo"
              className="bg-primary text-primary-foreground ring-card hover:bg-primary-hover absolute right-0 bottom-1 rounded-full p-1.5 shadow-card ring-2 transition focus-visible:ring-2 focus-visible:ring-[var(--ring-soft)] focus-visible:outline-none"
            >
              <Camera className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Identity + actions */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium capitalize tracking-[-0.02em] sm:text-3xl">
              {fullName || 'Your name'}
            </h1>
            {profile.headline && (
              <p className="text-muted-foreground mt-1 text-base">{profile.headline}</p>
            )}

            {profile.location && (
              <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {profile.location}
              </div>
            )}

            {lf?.type && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="capitalize">Open to {lf.type}</Badge>
                {avail && (
                  <span className="data text-muted-foreground text-xs">{avail}</span>
                )}
              </div>
            )}

            {/* Read-only account meta */}
            <div className="text-text-subtle mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              {user.auid && (
                <span className="data flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" aria-hidden /> {user.auid}
                </span>
              )}
              {user.university && (
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" aria-hidden /> {user.university}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild aria-label="View profile as a recruiter">
              <Link to={`/profiles/${user._id}`}>
                <ExternalLink className="h-4 w-4 sm:mr-1" aria-hidden />
                <span className="hidden sm:inline">View as recruiter</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIntroOpen(true)}
              aria-label="Edit intro"
            >
              <Pencil className="h-4 w-4 sm:mr-1" aria-hidden />
              <span className="hidden sm:inline">Edit intro</span>
            </Button>
          </div>
        </div>

        {/* Profile strength */}
        <div className="bg-bg-2 mt-6 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profile strength</span>
            <span className="data text-brass text-sm font-semibold">{percent}%</span>
          </div>
          <div className="bg-surface-2 mt-2 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {missing.length > 0 ? (
            <div className="mt-3">
              <p className="text-muted-foreground text-xs">To strengthen your profile:</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {missing.slice(0, 4).map((m) => (
                  <li
                    key={m}
                    className="text-muted-foreground rounded-full border border-border px-2.5 py-0.5 text-xs"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2 text-xs">Your profile is complete.</p>
          )}
        </div>
      </div>

      <EditPhotoDialog
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        currentImage={profile.profile_image}
        fallback={initial}
      />
      <EditIntroDialog open={introOpen} onOpenChange={setIntroOpen} />
    </Card>
  );
};

export default ProfileHeader;
