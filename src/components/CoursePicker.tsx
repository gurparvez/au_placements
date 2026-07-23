// src/components/CoursePicker.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Plus } from 'lucide-react';
import { coursesApi, type Course } from '@/api/courses';

interface CoursePickerProps {
  value?: string; // The selected course NAME (for display)
  onSelect: (course: Course) => void; // Passes full object back to parent
  error?: string;
  /** When false, the "Create …" affordance is hidden — pick from the list only.
   *  Creating courses is admin-only server-side anyway, so students get false. */
  allowCreate?: boolean;
}

const CoursePicker: React.FC<CoursePickerProps> = ({ value, onSelect, error, allowCreate = true }) => {
  const [query, setQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // State for creating a new course
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal query if parent value changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  /* ------------ Debounced Search ------------ */
  const debouncedSearch = useCallback(() => {
    const handler = setTimeout(async () => {
      if (!query.trim() || isCreating) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await coursesApi.searchCourses(query.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Course search error', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [query, isCreating]);

  // debouncedSearch returns its timer's canceller — returning it here makes React
  // clear the pending timer on every keystroke, so only the final query fires.
  useEffect(() => debouncedSearch(), [debouncedSearch]);

  /* ------------ Handle Click Outside ------------ */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsCreating(false); // Reset creation mode on close
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  /* ------------ Actions ------------ */
  const handleSelectExisting = (course: Course) => {
    onSelect(course); // Send to parent
    setQuery(course.name);
    setOpen(false);
  };

  const handleCreateStep1 = () => {
    setIsCreating(true);
    // Don't close dropdown, show category selection
  };

  const handleCreateFinal = async () => {
    if (!newCourseCategory) return;
    
    try {
      setCreatingLoading(true);
      // Create via API
      const newCourse = await coursesApi.createCourse(query.trim(), newCourseCategory);
      
      // Select it
      onSelect(newCourse);
      setQuery(newCourse.name);
      
      // Reset
      setOpen(false);
      setIsCreating(false);
      setNewCourseCategory('');
    } catch (err) {
      console.error('Failed to create course', err);
    } finally {
      setCreatingLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        value={query}
        placeholder="Search course (e.g. B.Tech CSE)..."
        aria-invalid={!!error || undefined}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setIsCreating(false); // If user types, reset creation mode
        }}
        onFocus={() => setOpen(true)}
      />
      
      {open && (query.trim().length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          
          {/* SEARCH LOADING */}
          {loading && (
             <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
               <Loader2 className="h-4 w-4 animate-spin" /> Searching...
             </div>
          )}

          {/* MODE 1: LIST RESULTS */}
          {!loading && !isCreating && (
            <div className="max-h-60 overflow-auto">
              {searchResults.map((course) => (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => handleSelectExisting(course)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-muted-foreground text-xs uppercase">{course.category}</span>
                  </div>
                  {course.name === value && <Check className="h-4 w-4 opacity-50" />}
                </button>
              ))}

              {searchResults.length === 0 && (
                allowCreate ? (
                  <button
                    type="button"
                    onClick={handleCreateStep1}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden />
                    Create &ldquo;{query}&rdquo;
                  </button>
                ) : (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    No matching course. Ask the placement cell if yours is missing.
                  </div>
                )
              )}
            </div>
          )}

          {/* MODE 2: SELECT CATEGORY FOR NEW COURSE */}
          {isCreating && (
            <div className="p-3 space-y-3">
              <div className="text-sm font-medium">
                Select category for <span className="text-primary">"{query}"</span>:
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {['ug', 'pg', 'diploma', 'phd'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCourseCategory(cat)}
                    className={`focus-visible:ring-ring/50 rounded-md border px-3 py-2 text-xs uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                      newCourseCategory === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8"
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsCreating(false); 
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    size="sm" 
                    className="h-8"
                    disabled={!newCourseCategory || creatingLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCreateFinal();
                    }}
                >
                    {creatingLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : 'Create & Select'}
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {error && <p className="text-destructive mt-1.5 text-xs">{error}</p>}
    </div>
  );
};

export default CoursePicker;