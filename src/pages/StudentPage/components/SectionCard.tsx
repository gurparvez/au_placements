import React from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SectionCardProps {
  title: string;
  /** When provided, shows an edit/add control in the header. */
  onEdit?: () => void;
  /** Shows a "+" add affordance instead of a pencil when the section is empty. */
  isEmpty?: boolean;
  children: React.ReactNode;
}

/**
 * Shared LinkedIn-style section shell: a titled card with an optional
 * edit/add control that opens the section's own dialog editor.
 */
const SectionCard: React.FC<SectionCardProps> = ({ title, onEdit, isEmpty, children }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 gap-1.5 px-2"
          aria-label={isEmpty ? `Add ${title.toLowerCase()}` : `Edit ${title.toLowerCase()}`}
        >
          {isEmpty ? (
            <Plus className="h-4 w-4" aria-hidden />
          ) : (
            <Pencil className="h-4 w-4" aria-hidden />
          )}
          <span className="hidden text-xs sm:inline">{isEmpty ? 'Add' : 'Edit'}</span>
        </Button>
      )}
    </CardHeader>
    <CardContent className="pt-2">{children}</CardContent>
  </Card>
);

export default SectionCard;
