import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, UserCheck, ArrowRight, Briefcase, GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Redux Hooks
import { useAppSelector } from '@/context/hooks';

const LandingPage: React.FC = () => {
  // Get Auth State
  const { user, loading } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* ------------------- HERO SECTION ------------------- */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Decorative Glow */}
        <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 flex justify-center">
          <div className="bg-primary/20 h-96 w-96 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-6 px-3 py-1 text-sm tracking-widest uppercase">
            Akal & Eternal Placement Portal
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Where Talent Meets <br className="hidden md:block" />
            <span className="text-primary">Opportunity</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg md:text-xl">
            The official centralized placement platform connecting leading organizations with the
            bright minds of <span className="text-foreground font-medium">Akal University</span> and{' '}
            <span className="text-foreground font-medium">Eternal University</span>.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* 1. Start Hiring Button */}
            <Link to="/students">
              <Button size="lg" className="h-12 px-8 text-base">
                Start Hiring <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* 2. Login / Profile Button */}
            {!loading &&
              (user ? (
                <Link to="/profiles">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    View Profile
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Student Login
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ------------------- STATS BAR ------------------- */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tighter sm:text-4xl">120+</div>
              <div className="text-xs font-medium uppercase opacity-80">Students Placed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tighter sm:text-4xl">30+</div>
              <div className="text-xs font-medium uppercase opacity-80">Partner Companies</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tighter sm:text-4xl">2</div>
              <div className="text-xs font-medium uppercase opacity-80">Premium Campuses</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tighter sm:text-4xl">50+</div>
              <div className="text-xs font-medium uppercase opacity-80">Recruitment Drives</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- FOR RECRUITERS & STUDENTS ------------------- */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Streamlining the Process</h2>
            <p className="text-muted-foreground mt-4">
              A dedicated ecosystem designed to simplify recruitment for everyone.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Recruiters Side */}
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Briefcase size={24} />
              </div>
              <h3 className="text-2xl font-semibold">For Recruiters</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Access a unified database of pre-verified students from two prestigious
                universities. Filter by skills, experience, and academic performance to find your
                perfect match.
              </p>
              <ul className="space-y-3">
                <li className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    ✓
                  </div>
                  Direct access to student profiles
                </li>
                <li className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    ✓
                  </div>
                  Schedule interviews & track applications
                </li>
                <li className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    ✓
                  </div>
                  Zero-friction hiring process
                </li>
              </ul>
            </div>

            {/* Students Side */}
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-2xl font-semibold">For Students</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Showcase your skills, projects, and achievements to top recruiters. One profile is
                all you need to apply for internships and full-time placements across the network.
              </p>
              <ul className="space-y-3">
                <li className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    ✓
                  </div>
                  Build a professional portfolio
                </li>
                <li className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    ✓
                  </div>
                  Apply to exclusive campus drives
                </li>
                <li className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                    ✓
                  </div>
                  Get discovered by industry leaders
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ------------------- FEATURES GRID ------------------- */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background/60 hover:bg-background border-none shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-muted mb-2 w-fit rounded-md p-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle>Dual Campus Reach</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Tap into talent pools from both the Himalayan serenity of Baru Sahib and the heart
                of Punjab at Talwandi Sabo.
              </CardContent>
            </Card>

            <Card className="bg-background/60 hover:bg-background border-none shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-muted mb-2 w-fit rounded-md p-2">
                  <UserCheck className="h-5 w-5" />
                </div>
                <CardTitle>Verified Profiles</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Every student profile is verified by university administration, ensuring authentic
                data regarding grades and skills.
              </CardContent>
            </Card>

            <Card className="bg-background/60 hover:bg-background border-none shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <div className="bg-muted mb-2 w-fit rounded-md p-2">
                  <Search className="h-5 w-5" />
                </div>
                <CardTitle>Smart Filtering</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Advanced search capabilities allow recruiters to find candidates based on specific
                technical stacks and experience.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
