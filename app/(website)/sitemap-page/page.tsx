import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Sitemap | Shiksha Cloud',
  description: 'Complete sitemap for Shiksha Cloud — find all features, industries, blog posts, and pages.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${appUrl.origin}/sitemap-page`,
  },
};

const sitemapSections = [
  {
    title: 'Main Pages',
    links: [
      { href: '/', label: 'Homepage' },
      { href: '/about', label: 'About Us' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/contact', label: 'Contact' },
      { href: '/founder', label: 'Founder Story' },
      { href: '/why-shiksha', label: 'Why Shiksha Cloud' },
      { href: '/why-us', label: 'Why Choose Us' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/guide', label: 'User Guide' },
      { href: '/support', label: 'Support' },
    ],
  },
  {
    title: 'Features',
    links: [
      { href: '/features', label: 'All Features' },
      { href: '/features/fee-management', label: 'Fee Management' },
      { href: '/features/attendance', label: 'Attendance Tracking' },
      { href: '/features/exam-management', label: 'Exam Management' },
      { href: '/features/notification-engine', label: 'Smart Notifications' },
      { href: '/features/lead-management', label: 'Admission CRM' },
      { href: '/features/ai-reports', label: 'AI Reports' },
      { href: '/features/student-management', label: 'Student Management' },
      { href: '/features/anonymous-complaints', label: 'Anonymous Complaints' },
      { href: '/features/document-verification', label: 'Document Verification' },
      { href: '/features/holidays', label: 'Holiday Management' },
      { href: '/features/integration', label: 'Integrations' },
      { href: '/features/by-role', label: 'Features by Role' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { href: '/industries', label: 'All Industries' },
      { href: '/industries/k-12-schools', label: 'K-12 Schools' },
      { href: '/industries/coaching-centers', label: 'Coaching Centers' },
      { href: '/industries/coaching-classes', label: 'Coaching Classes' },
      { href: '/industries/colleges-higher-education', label: 'Colleges & Higher Education' },
      { href: '/industries/degree-colleges', label: 'Degree Colleges' },
      { href: '/industries/junior-colleges', label: 'Junior Colleges' },
      { href: '/industries/pre-schools', label: 'Pre-Schools' },
      { href: '/industries/professional-institutes', label: 'Professional Institutes' },
      { href: '/industries/skill-academies', label: 'Skill Academies' },
      { href: '/industries/small-tutors-academies', label: 'Small Tutors & Academies' },
    ],
  },
  {
    title: 'Blog',
    links: [
      { href: '/blogs', label: 'All Blog Posts' },
      { href: '/blogs/why-indian-schools-choosing-shiksha-cloud', label: 'Why Indian Schools Choosing Shiksha Cloud' },
      { href: '/blogs/technology-behind-shiksha-cloud', label: 'Technology Behind Shiksha Cloud' },
      { href: '/blogs/transparency-bridging-schools-parents', label: 'Transparency: Bridging Schools & Parents' },
      { href: '/blogs/how-to-improve-fee-collection-indian-schools', label: 'How to Improve Fee Collection in Indian Schools' },
      { href: '/blogs/attendance-tracking-reduces-dropout-rates', label: 'Attendance Tracking Reduces Dropout Rates' },
      { href: '/blogs/switching-from-excel-to-school-management-software', label: 'Switching From Excel to School Management Software' },
    ],
  },
  {
    title: 'Locations',
    links: [
      { href: '/locations', label: 'All Locations' },
      { href: '/pune/school-management-software', label: 'Pune' },
      { href: '/mumbai/school-management-software', label: 'Mumbai' },
      { href: '/delhi/school-management-software', label: 'Delhi' },
      { href: '/bangalore/school-management-software', label: 'Bangalore' },
      { href: '/hyderabad/school-management-software', label: 'Hyderabad' },
      { href: '/chennai/school-management-software', label: 'Chennai' },
      { href: '/kolkata/school-management-software', label: 'Kolkata' },
      { href: '/ahmedabad/school-management-software', label: 'Ahmedabad' },
      { href: '/jaipur/school-management-software', label: 'Jaipur' },
      { href: '/lucknow/school-management-software', label: 'Lucknow' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms-and-conditions', label: 'Terms & Conditions' },
      { href: '/refund-policy', label: 'Refund Policy' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Sitemap
          </h1>
          <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
            Find every page on Shiksha Cloud.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sitemapSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-[#7fb800]" />
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-neutral-600 hover:text-[#7fb800] transition-colors text-sm flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
