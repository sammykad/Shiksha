import Link from 'next/link';

const APP_URL = 'https://shiksha.cloud';

const links = [
  { title: 'Features', href: '/features' },
  { title: 'Fee Management', href: '/features/fee-management' },
  { title: 'Attendance', href: '/features/attendance' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Blogs', href: '/blogs' },
  { title: 'Changelog', href: '/changelog' },
  { title: 'Guide', href: '/guide' },
  { title: 'Why Shiksha', href: '/why-shiksha' },
  { title: 'Contact', href: '/contact' },
  { title: 'Support', href: '/support' },
  { title: 'Founder', href: '/founder' },
  { title: 'Privacy Policy', href: '/privacy-policy' },
  { title: 'Terms', href: '/terms-and-conditions' },
];

export default function Footer() {
  return (
    <footer className="border-b bg-white py-12 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap justify-between gap-6">
          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-primary block duration-150"
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        </div>

      </div><span className="text-muted-foreground order-last block text-center text-sm md:order-first mt-4">
        © {new Date().getFullYear()}{' '}
        <Link href={APP_URL} className="hover:text-primary underline">
          Shiksha.cloud
        </Link>{' '}
        All rights reserved
      </span>
    </footer>
  );
}
