import ModernSchoolManagementGuide from '@/lib/website/guide';
import React from 'react';
import { Metadata } from 'next';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Modern School Management Guide',
  description: 'Master school operations with our comprehensive guide. Learn how to automate attendance, streamline fees, and improve parent communication using modern EdTech.',
  keywords: ['school management guide', 'how to run a school digital', 'school automation tips', 'parent communication strategy'],
  alternates: {
    canonical: `${appUrl.origin}/guide`,
  },
  openGraph: {
    title: 'Modern School Management Guide',
    description: 'Expert tips and strategies for digitizing your educational institution.',
    url: `${appUrl.origin}/guide`,
    images: [`${appUrl.origin}/og-image.png`],
  },
};

const page = () => {
  return <ModernSchoolManagementGuide />;
};

export default page;
