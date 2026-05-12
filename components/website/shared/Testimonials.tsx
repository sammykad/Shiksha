import { cn } from '@/lib/utils';
import Image from 'next/image';
import Marquee from '@/components/ui/marquee';

const reviews = [
  {
    name: 'Ravi Kumar',
    username: '@ravik',
    role: 'Principal, Delhi Public School',
    body: "Shiksha Cloud has truly transformed how we track student progress. It's efficient, easy to use, and our admin team loves it.",
    img: 'https://avatar.vercel.sh/ravi',
  },
  {
    name: 'Priya Sharma',
    username: '@priyasharma',
    role: 'Admin Head, Sunrise Academy',
    body: 'Attendance and fee management used to take hours. Now it takes minutes. Such a relief for our entire office team!',
    img: 'https://avatar.vercel.sh/priya',
  },
  {
    name: 'Ajay Patel',
    username: '@ajayp',
    role: 'Director, Patel Coaching Institute',
    body: 'Everything from student records to fee structures is connected. We save hours every week and errors have dropped to near zero.',
    img: 'https://avatar.vercel.sh/ajay',
  },
  {
    name: 'Sunita Reddy',
    username: '@sunitar',
    role: 'Co-founder, Reddy Learning Centre',
    body: 'Parent-teacher communication used to be a mess. Now notices go out in seconds and parents actually read them.',
    img: 'https://avatar.vercel.sh/sunita',
  },
  {
    name: 'Vikram Singh',
    username: '@vikramsingh',
    role: 'Manager, Singh International School',
    body: 'From tracking grades to collecting fees — everything is paperless and automated. Wish we had switched sooner.',
    img: 'https://avatar.vercel.sh/vikram',
  },
  {
    name: 'Meera Jain',
    username: '@meeraj',
    role: 'Principal, Jain Model School',
    body: 'The support team is incredibly responsive and the product keeps getting better. Highly recommend to every school.',
    img: 'https://avatar.vercel.sh/meera',
  },
  {
    name: 'Arjun Nair',
    username: '@arjunnair',
    role: 'Founder, Nair Tutorials',
    body: 'Admission season used to be chaos. Now leads come in from WhatsApp and Google Forms straight into our dashboard.',
    img: 'https://avatar.vercel.sh/arjun',
  },
  {
    name: 'Deepa Menon',
    username: '@deepamenon',
    role: 'Admin, St. Mary\'s Convent School',
    body: 'Digital ID cards, document verification, exam hall tickets — all in one place. Our staff productivity has doubled.',
    img: 'https://avatar.vercel.sh/deepa',
  },
];

const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

export default function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            Customer stories
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4 leading-snug">
            Trusted by schools across India
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Principals, admins, and founders share how Shiksha Cloud changed
            their day-to-day.
          </p>
        </div>
      </div>

      {/* Marquee — full bleed */}
      <div className="relative flex flex-col gap-4">
        <Marquee pauseOnHover className="[--duration:28s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:28s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-neutral-950" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-neutral-950" />
      </div>
    </section>
  );
}

function ReviewCard({
  img,
  name,
  username,
  role,
  body,
}: {
  img: string;
  name: string;
  username: string;
  role: string;
  body: string;
}) {
  return (
    <figure
      className={cn(
        'relative w-80 shrink-0 cursor-pointer overflow-hidden rounded-2xl p-5',
        'border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm',
        'dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-900',
        'transition-all duration-200'
      )}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
        {body}
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Image
          className="rounded-full object-cover"
          width={36}
          height={36}
          alt={`${name} avatar`}
          src={img}
          loading="lazy"
        />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{role}</p>
        </div>
      </div>
    </figure>
  );
}