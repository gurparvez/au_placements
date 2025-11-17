import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface StudentCardProps {
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
  return (
    <Card className="mx-auto w-full max-w-3xl rounded-2xl bg-gray-100 p-4 shadow-md">
      <CardContent className="flex items-start gap-4 p-0">
        {/* Profile Image */}
        <img
          src={image_url}
          alt={name}
          className="h-14 w-14 rounded-full bg-gray-300 object-cover"
        />

        {/* Main Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{name}</h2>
            <span className="text-sm text-gray-600">{className}</span>
            <span className="flex items-center gap-1 text-sm text-gray-700">
              <MapPin size={15} /> {location}
            </span>
            <Badge className="rounded-full bg-green-300 px-3 py-0.5 text-black">{exprience}</Badge>
          </div>

          <p className="mt-1 text-sm text-gray-700">{headline}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium">
            <span>{feild_preference}</span>
            <Badge className="rounded-full bg-blue-200 px-3 py-0.5 text-black">{open_to}</Badge>
          </div>

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="rounded-full bg-gray-300 px-3 py-1 text-sm text-black">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}