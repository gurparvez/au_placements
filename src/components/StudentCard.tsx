import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentCardProps {
  userId: string;
  image_url: string;
  name: string;
  class: string;
  location: string;
  headline: string;
  feild_preference: string;
  open_to: string;
  looking_for_start?: string;
  looking_for_end?: string;
  exprience: string;
  skills: string[];
}

// Helper to format date "2025-01-01" -> "Jan 2025"
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

export default function StudentCard({
  userId,
  image_url,
  name,
  class: className,
  location,
  headline,
  feild_preference,
  open_to,
  looking_for_start,
  looking_for_end,
  exprience,
  skills,
}: StudentCardProps) {
  const navigate = useNavigate();

  const startDate = formatDate(looking_for_start);
  const endDate = formatDate(looking_for_end);

  return (
    <Card
      className="cursor-pointer rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => navigate(`/profiles/${userId}`)}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <img src={image_url} alt={name} className="bg-muted h-14 w-14 rounded-full object-cover" />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-foreground text-lg font-semibold capitalize">{name}</h2>
            <span className="text-muted-foreground text-sm">{className}</span>
            <span className="text-muted-foreground flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" /> {location}
            </span>
            <Badge className="rounded-full px-3 py-0.5">{exprience}</Badge>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">{headline}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium">
            <span className="text-muted-foreground">{feild_preference}</span>

            {/* 🟢 Updated Open To Section */}
            <div className="flex items-center gap-2">
              <Badge className="rounded-full px-3 py-0.5">{open_to}</Badge>

              {/* Show dates if available */}
              {startDate && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <CalendarDays className="h-3 w-3" />
                  {startDate} {endDate ? ` - ${endDate}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="bg-muted rounded-full px-3 py-1 text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
