import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { updateUserDetails, updateUserPassword } from '@/context/auth/authSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // Ensure you have this component
import {
  Edit2,
  MapPin,
  Upload,
  Lock,
  Save,
  X,
  Mail,
  Phone,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';

// Helper to format dates for display
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

// Helper to format ISO date to YYYY-MM-DD for input fields
const toInputDate = (dateString?: string | Date) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

const ProfileHero: React.FC = () => {
  const dispatch = useAppDispatch();

  const { profile, loading: profileLoading } = useAppSelector((state) => state.student);
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  // --- LOCAL STATE ---

  // 1. Account Info (Auth Slice)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 2. Profile Info (Student Slice)
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [profileImg, setProfileImg] = useState<File | null>(null);

  // 3. Looking For Info (Student Slice)
  const [lookingForType, setLookingForType] = useState<'internship' | 'job'>('internship');
  const [lookingForFrom, setLookingForFrom] = useState('');
  const [lookingForTo, setLookingForTo] = useState('');

  // 4. Password Change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // 5. UI
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- SYNC STATE ---
  useEffect(() => {
    if (user && profile) {
      setFirstName(user.firstName || profile.user.firstName || '');
      setLastName(user.lastName || profile.user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      setHeadline(profile.headline || '');
      setLocation(profile.location || '');
      setAbout(profile.about || '');

      // Sync Looking For
      if (profile.looking_for) {
        setLookingForType(profile.looking_for.type || 'internship');
        setLookingForFrom(toInputDate(profile.looking_for.from_date));
        setLookingForTo(toInputDate(profile.looking_for.to_date));
      }
    }
  }, [user, profile, isEditing]);

  if (!profile || !user) return null;

  // --- HANDLERS ---

  const handleImageChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be <= 5MB');
      return;
    }
    setProfileImg(file);
  };

  const handleSave = async () => {
    setErrorMsg(null);
    try {
      // 1. Update Account Details
      if (
        firstName !== user.firstName ||
        lastName !== user.lastName ||
        email !== user.email ||
        phone !== user.phone
      ) {
        await dispatch(updateUserDetails({ firstName, lastName, email, phone })).unwrap();
      }

      // 2. Update Student Profile Details
      const profilePayload: any = {};

      if (headline !== profile.headline) profilePayload.headline = headline;
      if (location !== profile.location) profilePayload.location = location;
      if (about !== profile.about) profilePayload.about = about;
      if (profileImg) profilePayload.profile_image = profileImg;

      // Construct Looking For Object
      // We always send this object if in edit mode to ensure dates are updated correctly
      profilePayload.looking_for = {
        type: lookingForType,
        from_date: lookingForFrom, // Backend should handle string -> date
        to_date: lookingForTo || undefined, // Send undefined if empty
      };

      if (Object.keys(profilePayload).length > 0) {
        await dispatch(updateStudentProfile(profilePayload));
      }

      // 3. Update Password
      if (showPasswordChange && oldPassword && newPassword) {
        await dispatch(updateUserPassword({ oldPassword, newPassword })).unwrap();
        setOldPassword('');
        setNewPassword('');
        setShowPasswordChange(false);
        toast.success('Password updated successfully');
      }

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      setErrorMsg(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const isLoading = profileLoading || authLoading;

  // Prepare display dates for View Mode
  const displayFromDate = formatDate(profile.looking_for?.from_date);
  const displayToDate = formatDate(profile.looking_for?.to_date);

  return (
    <Card className="relative z-10 w-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* --- Avatar Section --- */}
          <div className="relative flex shrink-0 flex-col items-center md:items-start">
            <div className="relative">
              <Avatar className="border-background h-32 w-32 overflow-hidden border-4 shadow-sm">
                <AvatarImage
                  src={
                    profileImg
                      ? URL.createObjectURL(profileImg)
                      : profile.profile_image || '/avatar-placeholder.png'
                  }
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {firstName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <label className="bg-primary text-primary-foreground absolute right-0 bottom-0 cursor-pointer rounded-full p-2 shadow-md transition-opacity hover:opacity-90">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                  />
                  <Upload className="h-4 w-4" />
                </label>
              )}
            </div>
          </div>

          {/* --- Info Section --- */}
          <div className="w-full flex-1 space-y-4">
            {/* Header: Name & Edit Button */}
            <div className="flex items-start justify-between">
              <div className="w-full">
                {isEditing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        First Name
                      </span>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        Last Name
                      </span>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                ) : (
                  <h1 className="text-foreground text-2xl font-bold capitalize">
                    {user.firstName} {user.lastName}
                  </h1>
                )}
              </div>

              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="ml-4 shrink-0"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Headline */}
            <div>
              {isEditing ? (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    Headline
                  </span>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Computer Science Student at XYZ University"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-lg">{profile.headline}</p>
              )}
            </div>

            {/* Contact Info (Visible in both modes) */}
            <div className="mt-2">
              {isEditing ? (
                <div className="animate-in fade-in slide-in-from-top-2 grid gap-4 duration-300 md:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs font-medium uppercase">
                      Email
                    </span>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs font-medium uppercase">
                      Phone
                    </span>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      type="tel"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              {isEditing ? (
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-8 max-w-[200px]"
                  placeholder="City, Country"
                />
              ) : (
                <span>{profile.location || 'Location not set'}</span>
              )}
            </div>

            {/* --- LOOKING FOR SECTION --- */}
            <div className="pt-2">
              {isEditing ? (
                <div className="bg-muted/20 space-y-3 rounded-md border p-4">
                  <span className="text-muted-foreground block text-xs font-medium uppercase">
                    Availability & Preferences
                  </span>

                  {/* Type Selection */}
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="lookingFor"
                        checked={lookingForType === 'internship'}
                        onChange={() => setLookingForType('internship')}
                        className="accent-primary"
                      />
                      Internship
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="lookingFor"
                        checked={lookingForType === 'job'}
                        onChange={() => setLookingForType('job')}
                        className="accent-primary"
                      />
                      Job / Placement
                    </label>
                  </div>

                  {/* Date Range */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Available From</span>
                      <Input
                        type="date"
                        value={lookingForFrom}
                        onChange={(e) => setLookingForFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">
                        Available Until (Optional)
                      </span>
                      <Input
                        type="date"
                        value={lookingForTo}
                        onChange={(e) => setLookingForTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode for Looking For
                profile.looking_for && (
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="px-3 text-sm font-medium capitalize">
                      Open to {profile.looking_for.type}
                    </Badge>

                    {displayFromDate && (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          Available: {displayFromDate}
                          {displayToDate ? ` - ${displayToDate}` : ' onwards'}
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* About */}
            <div className="space-y-1 pt-2">
              {isEditing && (
                <span className="text-muted-foreground text-xs font-medium uppercase">About</span>
              )}
              {isEditing ? (
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="resize-none"
                />
              ) : (
                <div className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.about || 'No bio provided.'}
                </div>
              )}
            </div>

            {/* --- Password Change Section (Edit Mode Only) --- */}
            {isEditing && (
              <div className="bg-muted/30 mt-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Security
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                  >
                    {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
                  </Button>
                </div>

                {showPasswordChange && (
                  <div className="animate-in fade-in zoom-in-95 mt-3 grid gap-3 duration-200 md:grid-cols-2">
                    <Input
                      type="password"
                      placeholder="Current Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {isEditing && errorMsg && (
              <div className="bg-destructive/15 text-destructive animate-in slide-in-from-top-1 flex items-center gap-2 rounded-md p-3 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={isLoading} className="min-w-[120px]">
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setShowPasswordChange(false);
                    setErrorMsg(null);
                  }}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHero;
