import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentCardProps {
  userId: string; // <-- NEW
  image_url: string;
  name: string;
  class: string;
  location: string;
  headline: string;
  feild_preference: string;
  open_to: string;
  exprience: string;
  skills: string[];
}

export default function StudentCard({
  userId,
  image_url,
  name,
  class: className,
  location,
  headline,
  feild_preference,
  open_to,
  exprience,
  skills,
}: StudentCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="
        rounded-2xl shadow-sm transition 
        cursor-pointer hover:shadow-md hover:-translate-y-0.5
      "
      onClick={() => navigate(`/profiles/${userId}`)}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <img
          src={image_url}
          alt={name}
          className="bg-muted h-14 w-14 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-foreground text-lg font-semibold">{name}</h2>
            <span className="text-muted-foreground text-sm">{className}</span>
            <span className="text-muted-foreground flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" /> {location}
            </span>
            <Badge className="rounded-full px-3 py-0.5">{exprience}</Badge>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">{headline}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium">
            <span className="text-muted-foreground">{feild_preference}</span>
            <Badge className="rounded-full px-3 py-0.5">{open_to}</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-muted rounded-full px-3 py-1 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
