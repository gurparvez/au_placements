import React, { useEffect, useState, useCallback, useRef, useId } from 'react';
import { Input } from '@/components/ui/input';
import { skillsApi } from '@/api/skills';
import type { Skill } from '@/api/skills';
import { FILTER_SKILLS } from '@/utils/skills';
import { Loader2, X, Check, Plus } from 'lucide-react';

interface SkillPickerProps {
  selected: string[];
  setSelected: (skills: string[]) => void;
  // NEW: Pass the full objects of existing skills so we can show their names immediately
  initialData?: Skill[]; 
  label?: string;
}

const SkillPicker: React.FC<SkillPickerProps> = ({ selected, setSelected, initialData = [], label }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [skillMap, setSkillMap] = useState<Record<string, Skill>>({});
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  /* ------------ 1. Initialize Map with Initial Data ------------ */
  useEffect(() => {
    if (initialData.length > 0) {
      setSkillMap((prev) => {
        const copy = { ...prev };
        initialData.forEach((s) => (copy[s._id] = s));
        return copy;
      });
    }
  }, [initialData]);

  /* ------------ Select / Unselect skill ------------ */
  const safeSelected = selected ?? [];

  const toggleSkill = (skillId: string) => {
    if (safeSelected.includes(skillId)) {
      setSelected(safeSelected.filter((id) => id !== skillId));
    } else {
      setSelected([...safeSelected, skillId]);
    }
  };

  // Reset the search box so the user can immediately add the next skill.
  const resetInput = () => {
    setQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  // Select a skill from the dropdown, then clear the input (keeps dropdown open
  // showing suggestions for the next pick).
  const selectSkillById = (skillId: string) => {
    if (!safeSelected.includes(skillId)) setSelected([...safeSelected, skillId]);
    resetInput();
    setOpen(true);
  };

  const clearAll = () => setSelected([]);

  /* ------------ Debounced search ------------ */
  const debouncedSearch = useCallback(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await skillsApi.searchSkills(query.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Skill search error:', err);
        setSearchResults([]);
        setError('Failed to search skills. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  // debouncedSearch returns its timer's canceller — returning it here makes React
  // clear the pending timer on every keystroke, so only the final query fires.
  useEffect(() => debouncedSearch(), [debouncedSearch]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSkillMap((prev) => {
        const copy = { ...prev };
        searchResults.forEach((s) => (copy[s._id] = s));
        return copy;
      });
    }
  }, [searchResults]);

  /* ------------ Add (upsert) a skill by name and select it ------------ */
  // Works for both a typed custom skill and a curated suggestion. The backend
  // upserts by normalized name, so clicking an existing skill won't duplicate.
  const addAndSelect = async (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;

    try {
      setLoading(true);
      setError(null);
      const res: any = await skillsApi.addSkill(name);
      const newSkill: Skill = res.skill || res;

      setSelected(safeSelected.includes(newSkill._id) ? safeSelected : [...safeSelected, newSkill._id]);
      setSkillMap((prev) => ({ ...prev, [newSkill._id]: newSkill }));
      resetInput();
    } catch (err) {
      console.error('Failed to add skill:', err);
      setError('Failed to add skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!query.trim()) return;
    await addAndSelect(query);
    setOpen(true);
  };

  /* ------------ Close dropdown on outside click ------------ */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  /* ------------ Curated suggestions (from the built-in skills list) ------------ */
  const q = query.trim().toLowerCase();
  const selectedNames = new Set(
    (safeSelected.map((id) => skillMap[id]?.name?.toLowerCase()).filter(Boolean) as string[])
  );
  const dbNames = new Set(searchResults.map((s) => s.name.toLowerCase()));
  const curatedSuggestions = FILTER_SKILLS.filter((name) => {
    const lower = name.toLowerCase();
    if (selectedNames.has(lower) || dbNames.has(lower)) return false;
    return q ? lower.includes(q) : true;
  }).slice(0, q ? 8 : 12);

  const hasDropdownContent =
    searchResults.length > 0 || curatedSuggestions.length > 0 || !!query.trim();

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={inputId} className="eyebrow mb-1 block text-muted-foreground">
        {label ?? 'Skills'}
      </label>

      <Input
        ref={inputRef}
        id={inputId}
        aria-label={label ?? 'Search skills'}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        placeholder="Search skills (e.g. React)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />

      {/* Dropdown */}
      {open && hasDropdownContent && (
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border shadow-md"
        >
          {loading && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching...
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {/* SHOW SEARCH RESULTS */}
          {!loading &&
            !error &&
            searchResults.map((skill) => {
              const isSelected = safeSelected.includes(skill._id);
              return (
                <button
                  key={skill._id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectSkillById(skill._id)}
                  className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset flex w-full items-center justify-between px-3 py-2 text-sm"
                >
                  <span>{skill.displayName || skill.name}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" aria-hidden />
                  )}
                </button>
              );
            })}

          {/* CURATED SUGGESTIONS (from built-in list) */}
          {!loading && !error && curatedSuggestions.length > 0 && (
            <>
              {!q && (
                <div className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-medium">
                  Suggestions
                </div>
              )}
              {curatedSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => addAndSelect(name)}
                  className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset flex w-full items-center justify-between px-3 py-2 text-sm"
                >
                  <span>{name}</span>
                  <Plus className="text-muted-foreground h-4 w-4" aria-hidden />
                </button>
              ))}
            </>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && query.trim() && searchResults.length === 0 && curatedSuggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No skills found.</div>
          )}

          {/* ADD NEW SKILL */}
          {!loading && !error && query.trim() &&
            !searchResults.some((s) => s.name.toLowerCase() === query.trim().toLowerCase()) &&
            !curatedSuggestions.some((n) => n.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset w-full px-3 py-2 text-left text-sm text-primary font-medium"
              onClick={handleAddSkill}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                Add “{query.trim()}” as new skill
              </span>
            </button>
          )}
        </div>
      )}

      {/* SELECTED SKILLS CHIPS */}
      {safeSelected.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              {safeSelected.length} skill{safeSelected.length === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive text-xs font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
          {safeSelected.map((id) => {
            const displayName = skillMap[id]?.displayName || skillMap[id]?.name;
            return (
              <span
                key={id}
                className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-3 py-1 text-xs"
              >
                {/* Display lookup from map OR muted loading placeholder */}
                {displayName ?? (
                  <span className="flex items-center gap-1 text-primary-foreground/60">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Loading
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleSkill(id)}
                  aria-label={`Remove ${displayName ?? 'skill'}`}
                  className="hover:bg-primary-foreground/20 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ml-1 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillPicker;
