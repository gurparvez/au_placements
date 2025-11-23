import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/context/hooks";
import { updateStudentProfile } from "@/context/student/studentSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, MapPin, Upload } from "lucide-react";

const ProfileHero: React.FC = () => {
  const dispatch = useAppDispatch();

  const { profile, loading } = useAppSelector((state) => state.student);

  // Local editable fields
  const [name, setName] = useState(profile?.user.firstName || "");
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [about, setAbout] = useState(profile?.about || "");
  const [profileImg, setProfileImg] = useState<File | null>(null);

  // For edit mode
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) return null; // Prevent crash if profile not loaded

  const handleImageChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be <= 5MB");
      return;
    }

    setProfileImg(file);
  };

  const handleSave = () => {
    const payload: any = {};

    if (name !== profile.user.firstName) payload.firstName = name;
    if (headline !== profile.headline) payload.headline = headline;
    if (location !== profile.location) payload.location = location;
    if (about !== profile.about) payload.about = about;
    if (profileImg) payload.profile_image = profileImg;

    dispatch(updateStudentProfile(payload));

    setIsEditing(false);
  };

  return (
    <Card className="relative -mt-20 z-10">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Profile Image */}
          <div className="-mt-12 relative">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={profile.profile_image || "/avatar-placeholder.png"} />
              <AvatarFallback>
                {profile.user.firstName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Upload picture */}
            <label className="absolute bottom-0 right-0 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />
              <div className="bg-muted p-1 rounded-full shadow">
                <Upload className="h-4 w-4" />
              </div>
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {/* Name */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-xs"
                />
              ) : (
                <h1 className="text-2xl font-semibold">{profile.user.firstName}</h1>
              )}

              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 />
              </Button>
            </div>

            {/* Headline */}
            <div className="mt-1">
              {isEditing ? (
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              ) : (
                <p className="text-muted-foreground text-sm">{headline}</p>
              )}
            </div>

            {/* Location */}
            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />

              {isEditing ? (
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="max-w-xs"
                />
              ) : (
                <span>{location}</span>
              )}
            </div>

            {/* About section */}
            <div className="mt-3">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={3}
                  />

                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving…" : "Save"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{about}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHero;
