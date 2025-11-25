import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { updateStudentProfile } from '@/context/student/studentSlice';
import { type ProjectPayload } from '@/api/students.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Plus, Trash2, Github, Globe, Loader2 } from 'lucide-react';
import SkillPicker from '@/components/SkillPicker';
import skillsApi, { type Skill } from '@/api/skills'; 

// Local Interface to bridge the gap between API Response and Form State
interface ProjectUI {
  _id?: string;
  title: string;
  start_date: string;
  end_date?: string;
  on_going?: boolean;
  tech_used: string[];          // IDs for API
  tech_used_resolved?: Skill[]; // Full Objects for UI
  code_url?: string;
  live_url?: string;
  description?: string;
}

const ProjectsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.student);

  // Local state for editing
  const [projectList, setProjectList] = useState<ProjectUI[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [resolvingSkills, setResolvingSkills] = useState(false);

  // --- 1. Load Projects & FETCH SKILLS from API ---
  useEffect(() => {
    const fetchSkillsForProjects = async () => {
      if (!profile?.projects) return;

      setResolvingSkills(true);

      try {
        // Map over projects and create a Promise to resolve each one
        const resolvedProjectsPromises = profile.projects.map(async (p: any) => {
          // Ensure we have an array of IDs
          const skillIds: string[] = p.tech_used 
            ? p.tech_used.map((t: any) => (typeof t === 'string' ? t : t._id))
            : [];

          // Fetch full skill details for these IDs
          // We use Promise.all to fetch them in parallel for speed
          const skillPromises = skillIds.map((id) => 
            skillsApi.getSkillById(id)
              .then((res) => res.skill) // Extract .skill from response
              .catch(() => null) // Return null if fail, filter later
          );

          const fetchedSkills = await Promise.all(skillPromises);
          const validSkills = fetchedSkills.filter((s): s is Skill => s !== null);

          // Return the constructed ProjectUI object
          return {
            _id: p._id,
            title: p.title || '',
            start_date: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '',
            end_date: p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : '',
            on_going: p.on_going || false,
            description: p.description || '',
            code_url: p.code_url || '',
            live_url: p.live_url || '',
            tech_used: skillIds,
            tech_used_resolved: validSkills, // <--- Hydrated from API
          };
        });

        const resolvedList = await Promise.all(resolvedProjectsPromises);
        setProjectList(resolvedList);
      } catch (error) {
        console.error("Error resolving project skills:", error);
      } finally {
        setResolvingSkills(false);
      }
    };

    fetchSkillsForProjects();
  }, [profile]); // Re-run if profile changes

  if (!profile) return null;

  // --- Handlers ---

  const handleInputChange = (index: number, field: keyof ProjectUI, value: any) => {
    const updatedList = [...projectList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setProjectList(updatedList);
  };

  const handleSkillsChange = (index: number, newSkillIds: string[]) => {
    // Note: We don't need to manually update tech_used_resolved here because 
    // SkillPicker manages the UI display of selected items internally,
    // and we only need to send the IDs (tech_used) to the backend on Save.
    const updatedList = [...projectList];
    updatedList[index] = { 
      ...updatedList[index], 
      tech_used: newSkillIds 
    };
    setProjectList(updatedList);
  };

  const handleAddNew = () => {
    setProjectList([
      ...projectList,
      { 
        title: '', 
        start_date: '', 
        description: '', 
        tech_used: [], 
        tech_used_resolved: [] 
      },
    ]);
  };

  const handleDelete = (index: number) => {
    const updatedList = projectList.filter((_, i) => i !== index);
    setProjectList(updatedList);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // The useEffect will naturally re-sync data if needed, or we can leave it
  };

  const handleSave = () => {
    const isValid = projectList.every(p => p.title && p.start_date);
    if (!isValid) {
      alert("Title and Start Date are required for all projects.");
      return;
    }

    const payload: ProjectPayload[] = projectList.map((p) => ({
      title: p.title,
      start_date: p.start_date,
      end_date: p.end_date || undefined,
      on_going: p.on_going,
      tech_used: p.tech_used, // Send IDs
      code_url: p.code_url || undefined,
      live_url: p.live_url || undefined,
      description: p.description
    }));

    dispatch(updateStudentProfile({ projects: payload }));
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-lg font-semibold">Projects</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={resolvingSkills} // Disable edit while initial skills serve loads
            className="h-8 w-8 p-0"
          >
            {resolvingSkills ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* --- VIEW MODE --- */}
        {!isEditing && (
          <div className="space-y-4">
            {resolvingSkills && projectList.length === 0 && (
               <div className="text-muted-foreground flex items-center gap-2 text-sm">
                 <Loader2 className="h-3 w-3 animate-spin" /> Loading project details...
               </div>
            )}

            {!resolvingSkills && projectList.length === 0 && (
              <p className="text-muted-foreground text-sm">No projects added.</p>
            )}

            {projectList.map((pr) => (
              <div key={pr._id} className="bg-muted/40 space-y-2 rounded-md p-4 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-base flex items-center gap-2">
                      {pr.title}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                       {new Date(pr.start_date).getFullYear()} 
                       {pr.on_going ? ' - Present' : ''}
                    </div>
                  </div>
                  
                  {/* Links */}
                  <div className="flex gap-3">
                    {pr.code_url && (
                      <a href={pr.code_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {pr.live_url && (
                      <a href={pr.live_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {pr.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {pr.description}
                  </p>
                )}

                {/* --- SKILL BUBBLES --- */}
                {pr.tech_used_resolved && pr.tech_used_resolved.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {pr.tech_used_resolved.map((skill) => (
                      <span
                        key={skill._id}
                        // Bubble Styling
                        className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium"
                      >
                        {skill.displayName || skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
          <div className="space-y-6">
            {projectList.map((pr, index) => (
              <div key={index} className="border-muted relative rounded-md border p-4 shadow-sm">
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid gap-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium">Project Title *</label>
                    <Input
                      value={pr.title}
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      placeholder="e.g. Portfolio Website"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium">Start Date *</label>
                      <Input
                        type="date"
                        value={pr.start_date}
                        onChange={(e) => handleInputChange(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">End Date</label>
                      <Input
                        type="date"
                        disabled={pr.on_going}
                        value={pr.end_date}
                        onChange={(e) => handleInputChange(index, 'end_date', e.target.value)}
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id={`ongoing-${index}`} 
                          checked={pr.on_going}
                          onCheckedChange={(checked) => handleInputChange(index, 'on_going', checked)}
                        />
                        <label
                          htmlFor={`ongoing-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Ongoing
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-medium flex items-center gap-1"><Github className="w-3 h-3"/> Code URL</label>
                       <Input 
                          value={pr.code_url}
                          onChange={(e) => handleInputChange(index, 'code_url', e.target.value)}
                          placeholder="https://github.com/..."
                       />
                    </div>
                    <div>
                       <label className="text-xs font-medium flex items-center gap-1"><Globe className="w-3 h-3"/> Live URL</label>
                       <Input 
                          value={pr.live_url}
                          onChange={(e) => handleInputChange(index, 'live_url', e.target.value)}
                          placeholder="https://my-app.com"
                       />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium">Description</label>
                    <Textarea
                      value={pr.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* SKILL PICKER */}
                  <div>
                    <SkillPicker 
                      label="Technologies Used"
                      selected={pr.tech_used} 
                      setSelected={(newIds) => handleSkillsChange(index, newIds)}
                      // Crucial: Pass the fetched objects so chips show names immediately
                      initialData={pr.tech_used_resolved}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={handleAddNew}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsSection;