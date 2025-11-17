import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LandingPage: React.FC = () => {
  return (
    <section aria-label="AU Placement Hero" className="mx-auto w-full max-w-4xl px-6 py-16">
      {/* Hero - centered */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-light md:text-5xl">Get Placed Through the Campus</h1>
        <p className="mt-4 text-lg">abfkjdsbfksdjkbuwsdbkjhfskksdkh</p>
      </div>

      {/* Cards - stacked with spacing */}
      <div className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">About</CardTitle>
          </CardHeader>
          <CardContent>
            <div role="region" aria-label="About content" className="h-36 rounded-md bg-gray-100" />
          </CardContent>
        </Card>

        <Card >
          <CardHeader>
            <CardTitle className="text-2xl">Students Placed</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role="region"
              aria-label="Students placed content"
              className="h-40 rounded-md bg-gray-100"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role="region"
              aria-label="Companies content"
              className="h-36 rounded-md bg-gray-100"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default LandingPage


