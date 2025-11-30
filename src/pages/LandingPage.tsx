import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LandingPage: React.FC = () => {
  return (
    <main className="from-background via-background to-muted/40 relative min-h-screen bg-linear-to-b">
      {/* Decorative blurred glow behind hero */}
      <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
        <div className="bg-primary/10 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <section
        aria-label="Placement Hero"
        className="relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 pt-32 pb-20"
      >
        {/* Hero - centered */}
        <div className="flex flex-col items-center text-center">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            {/* 🟢 Updated Branding */}
            Akal & Eternal Placement Portal
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Get Placed Through the Campus
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base md:text-lg">
            {/* 🟢 Updated Copy */}
            Discover opportunities, showcase your profile, and connect with recruiters through the
            centralized placement platform for
            <span className="text-foreground font-medium"> Akal University</span> and
            <span className="text-foreground font-medium"> Eternal University</span>.
          </p>

          {/* Small highlight chips */}
          <div className="text-muted-foreground mt-6 flex flex-wrap justify-center gap-2 text-xs">
            <span className="rounded-full border px-3 py-1">Unified Student Profiles</span>
            <span className="rounded-full border px-3 py-1">Dual-Campus Opportunities</span>
            <span className="rounded-full border px-3 py-1">For Students & Recruiters</span>
          </div>
        </div>

        {/* Cards - ONE COLUMN with subtle hover effects */}
        <div className="flex flex-col gap-6">
          {/* About */}
          <Card className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">About the Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                This portal serves as the bridge between the talented students of the Kalgidhar
                Trust's universities and leading industry organizations.
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>
                  Comprehensive profiles for students from{' '}
                  <strong>Akal University (Talwandi Sabo)</strong> and{' '}
                  <strong>Eternal University (Baru Sahib)</strong>.
                </li>
                <li>Streamlined shortlisting and tracking for recruiters across both campuses.</li>
                <li>Guided placement process for technical and non-technical departments.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Students Placed */}
          <Card className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Students Placed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                role="region"
                aria-label="Students placed content"
                className="bg-muted flex h-28 items-center justify-center rounded-md border border-dashed transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="text-center">
                  <div className="text-4xl font-semibold">120+</div>
                  <div className="text-muted-foreground text-xs">
                    Students placed in the last session
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Track placement statistics across batches and branches to see how our students are
                performing in the industry.
              </p>
            </CardContent>
          </Card>

          {/* Companies */}
          <Card className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Companies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                role="region"
                aria-label="Companies content"
                className="bg-muted flex h-28 items-center justify-center rounded-md border border-dashed transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="text-center">
                  <div className="text-4xl font-semibold">30+</div>
                  <div className="text-muted-foreground text-xs">
                    Partner companies & recruiters
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                From startups to established organizations, companies can discover skilled talent
                directly from both campuses through structured recruitment drives.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
