import React from 'react';
import { BookOpen, Heart, Globe, GraduationCap, MapPin, Users, Leaf, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* ------------------- HERO SECTION ------------------- */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="bg-muted/50 dark:bg-muted/10 absolute inset-0 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-sm tracking-widest uppercase">
            Education • Values • Service
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Merging Science with <span className="text-primary">Spirituality</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
            A unique educational ecosystem driven by The Kalgidhar Trust, bringing world-class
            education to the rural heartlands of Northern India.
          </p>
        </div>
      </section>

      {/* ------------------- THE KALGIDHAR TRUST ------------------- */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">The Kalgidhar Trust, Baru Sahib</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded under the spiritual guidance of <b>Sant Attar Singh Ji</b> and executed by
                <b>Baba Iqbal Singh Ji</b>, The Kalgidhar Trust is a non-profit charitable
                organization focused on providing value-based education to the rural poor.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What started as a small one-room school in the remote valley of Baru Sahib has grown
                into a massive educational network consisting of 129 Akal Academies and two major
                universities, transforming the landscape of rural North India.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <Heart size={20} />
                  </div>
                  <span className="text-sm font-medium">Social Welfare</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <Users size={20} />
                  </div>
                  <span className="text-sm font-medium">Women Empowerment</span>
                </div>
              </div>
            </div>

            {/* Visual/Image Placeholder */}
            <div className="bg-muted relative aspect-video overflow-hidden rounded-xl border shadow-sm">
              <img
                src="/baruSahib.jpg"
                alt="Baru Sahib"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="flex flex-col items-center gap-2 text-white">
                  <MapPin size={32} />
                  <span className="text-sm">Baru Sahib: The Valley of Divine Peace</span>
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ------------------- THE UNIVERSITIES ------------------- */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Two Campuses, One Vision</h2>
            <p className="text-muted-foreground mt-4">
              Creating centres of excellence in Himachal Pradesh and Punjab.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Eternal University Card */}
            <Card className="dark:bg-card flex flex-col border-none shadow-lg transition-all hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Leaf size={24} />
                </div>
                <CardTitle className="text-2xl">Eternal University</CardTitle>
                <CardDescription className="text-base">
                  Baru Sahib, Himachal Pradesh
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground flex-1 space-y-4">
                <p>
                  Established in 2008, Eternal University is the first private university in
                  Himachal Pradesh. It focuses on holistic development, combining rigorous academics
                  with spiritual discipline.
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm">
                  <li>Specializes in Nursing, Engineering, & Music.</li>
                  <li>Located in a drug-free, smoke-free spiritual valley.</li>
                  <li>Deep focus on Renewable Energy & Food Security.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Akal University Card */}
            <Card className="dark:bg-card flex flex-col border-none shadow-lg transition-all hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <BookOpen size={24} />
                </div>
                <CardTitle className="text-2xl">Akal University</CardTitle>
                <CardDescription className="text-base">Talwandi Sabo, Punjab</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground flex-1 space-y-4">
                <p>
                  Located at Guru Kashi (Damdama Sahib), Akal University was established to uplift
                  the youth of Punjab through high-quality higher education, steering them away from
                  drugs and towards intellect.
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm">
                  <li>Advanced Research in Sri Guru Granth Sahib Studies.</li>
                  <li>Strong focus on Basic Sciences (Physics, Math, Chemistry).</li>
                  <li>Commitment to serving the rural farming community.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------- IMPACT STATS ------------------- */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold tracking-tighter">129+</div>
              <div className="text-sm font-medium opacity-80">Akal Academies</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold tracking-tighter">2</div>
              <div className="text-sm font-medium opacity-80">Universities</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold tracking-tighter">70k+</div>
              <div className="text-sm font-medium opacity-80">Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold tracking-tighter">100%</div>
              <div className="text-sm font-medium opacity-80">Drug-Free Campuses</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- CORE VALUES ------------------- */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Our Core Values</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Value 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Global Standards</h3>
              <p className="text-muted-foreground text-sm">
                Bringing modern curriculum and technology to the most remote rural areas.
              </p>
            </div>

            {/* Value 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Value-Based Education</h3>
              <p className="text-muted-foreground text-sm">
                Synthesizing scientific excellence with spiritual and moral values.
              </p>
            </div>

            {/* Value 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Service to Humanity</h3>
              <p className="text-muted-foreground text-sm">
                Instilling the spirit of "Sewa" (Selfless Service) in every student.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- CALL TO ACTION ------------------- */}
      <section className="bg-muted/20 border-t py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="mb-4 text-2xl font-semibold">Join our mission</h2>
          <p className="text-muted-foreground mb-8">
            Whether you are a student, a recruiter, or a volunteer, become part of the family.
          </p>
          <div className="flex justify-center gap-4">
            <a href="https://barusahib.org/home-1-3/what-we-do/" target="_blank">
              <Button size="lg">Learn More</Button>
            </a>
            <a href="https://barusahib.org/contact-us/" target="_blank">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
