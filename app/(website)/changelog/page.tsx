import Accordion from './badge-accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React, { ReactNode } from 'react'
import { Metadata } from 'next';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
    title: 'Product Updates & Changelog | Shiksha.cloud',
    description: 'Stay updated with the latest features, improvements, and bug fixes in Shiksha Cloud School CRM. We are constantly evolving to serve you better.',
    keywords: ['shiksha cloud changelog', 'school software updates', 'new edtech features', 'product release notes'],
    alternates: {
        canonical: `${appUrl.origin}/changelog`,
    },
    openGraph: {
        title: 'What\'s New in Shiksha Cloud | Changelog',
        description: 'Track our latest updates and new feature releases.',
        url: `${appUrl.origin}/changelog`,
        images: [`${appUrl.origin}/og-image.png`],
    },
};

export default function ChangeLogPage() {
    return (
        <>
            <section>
                <div className='mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16'>
                    <div className='flex flex-col items-start'>
                        <h1 className="mb-10 font-medium text-4xl text-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                           Product Updates & Changelog
                        </h1>
                        <TimelineItem date='January 15, 2025' version='v 1.1.0'>
                            <div className='space-y-4'>
                                <div className='space-y-3'>
                                    <h3 className='text-xl font-semibold'>Design Tokens 2.0 Global Theme Rebuild</h3>
                                    <p className='text-muted-foreground text-sm'>
                                        We&apos;ve completely redesigned the theme system for Design Tokens 2.0. Tokens are now hierarchical,
                                        semantic, and fully type-safe — built for scaling design systems.
                                    </p>
                                </div>
                                <Image src='/images/blogBanner.jpg' width={1000} height={1000} alt='Design Tokens 2.0 Demo' className='rounded-lg' />
                                <p className='text-muted-foreground'>
                                    Design Tokens 2.0 introduces a complete overhaul of how themes are managed within shadcnstudio. With this
                                    update, design tokens are now hierarchical and semantic, offering greater flexibility and scalability for
                                    your design system.
                                </p>
                                <p className='text-muted-foreground'>
                                    The new system supports automatic dark/light theme pairing, making it easier than ever to maintain
                                    consistent visuals across all environments. Tokens for colors, spacing, typography, and more are now fully
                                    type-safe and easily customizable, ensuring that your design system can grow alongside your projects.{' '}
                                </p>
                                <Button asChild>
                                    <Link href='#'>Read More</Link>
                                </Button>
                                <Accordion data={accordionDataV1_1_0} />
                            </div>
                        </TimelineItem>
                        <TimelineItem date='March 22, 2025' version='v 1.2.0'>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-semibold'>Studio Dashboard Live Preview & Deployment</h3>
                                <p className='text-muted-foreground text-sm'>
                                    The new Studio Dashboard brings together everything you need to preview, test, and deploy your component
                                    library right from your browser.
                                </p>
                                <div className='space-y-3'>
                                    <ul className='text-muted-foreground list-inside list-disc space-y-3 text-sm'>
                                        <li>Preview components in any framework (Next.js, Remix, Vite)</li>
                                        <li>One-click deploy to Vercel</li>
                                        <li>Real-time preview links for teams</li>
                                    </ul>
                                    <div className='fle-wrap flex items-center gap-4'>
                                        {/* vite */}
                                        <div className='flex items-center gap-1.5 rounded-md bg-amber-600/10 px-3 py-1 dark:bg-amber-400/10'>
                                            <img src='/images/vite-logo.webp' alt='Vite' className='h-4.5' />
                                            <span className='text-xs font-medium'>Vite</span>
                                        </div>
                                        {/* React */}
                                        <div className='flex items-center gap-1.5 rounded-md bg-sky-600/10 px-3 py-1 dark:bg-sky-400/10'>
                                            <img src='/images/react-logo.webp' alt='React' className='h-4.5' />
                                            <span className='text-xs font-medium'>React</span>
                                        </div>
                                        {/* Angular */}
                                        <div className='bg-destructive/10 flex items-center gap-1.5 rounded-md px-3 py-1'>
                                            <img src='/images/angular-logo.webp' alt='Angular' className='h-4.5' />
                                            <span className='text-xs font-medium'>Angular</span>
                                        </div>
                                    </div>
                                </div>
                                <p className='text-muted-foreground text-sm'>
                                    The Studio Dashboard is a powerful tool within shadcnstudio that streamlines the process of designing,
                                    previewing, and deploying your component library. It allows you to instantly preview components in different
                                    frameworks (like Next.js, Remix, and Vite) directly from the dashboard.
                                </p>
                                <Accordion data={accordionDataV1_2_0} />
                            </div>
                        </TimelineItem>
                        <TimelineItem date='November 7, 2025' version='v 1.3.0'>
                            <div className='space-y-4'>
                                <div className='space-y-3'>
                                    <h3 className='text-xl font-semibold'>Component Sync Unified Library Management (Beta)</h3>
                                    <p className='text-muted-foreground text-sm'>
                                        We’re launching Component Sync, a new way to manage, version, and update all your shadcn components across
                                        projects with a single click.
                                    </p>
                                </div>
                                <div className='space-y-3'>
                                    <p className='font-medium'>Now you can:</p>
                                    <ul className='text-muted-foreground list-inside list-disc space-y-3 text-sm'>
                                        <li>Sync shared components instantly between multiple apps</li>
                                        <li>Track version diffs and apply updates selectively</li>
                                        <li>Automatically resolve dependency conflicts</li>
                                    </ul>
                                </div>
                                <img src='/images/image-1.webp' alt='Component Sync Demo' />
                                <Accordion data={accordionDataV1_3_0} />
                            </div>
                        </TimelineItem>
                    </div>
                </div>
            </section></>
    )
}


export const accordionDataV1_3_0 = [
    {
        type: 'new',
        items: [
            'Sync All button for project-wide updates',
            'Component different viewer with inline changelog',
            'Scoped sync choose which namespaces or folders to update'
        ]
    },
    {
        type: 'updates',
        items: [
            'Faster load times in component explorer (-30%)',
            'Auto-preview for dark/light theme variants',
            'TypeScript types now update automatically when syncing'
        ]
    },
    {
        type: 'bugfixes',
        items: [
            'Fixed sync conflicts with large component libraries',
            'Resolved memory leak in diff viewer',
            'Fixed incorrect version detection for nested components'
        ],
        badges: ['/v1/components/sync', '/v1/components/pull', '--interactive']
    }
]
export const accordionDataV1_2_0 = [
    {
        type: 'new',
        items: [
            'Live Preview mode instantly test UI changes inside the dashboard',
            'One-click Deployment push updates to production without leaving Studio',
            'Multi-environment support manage dev, staging, and production easily',
            'Multi-environment support manage dev, staging, and production easily'
        ]
    },
    {
        type: 'updates',
        items: [
            'Improved preview performance for heavy UI blocks (+40% faster)',
            'Smarter auto-refresh reloads only the updated section, not the full screen'
        ]
    },
    {
        type: 'bugfixes',
        items: [
            'Fixed deployment logs not showing real-time events',
            'Corrected spacing token mismatch in forms, modals, and bento blocks',
            'Fixed incorrect color export in some frameworks (React / Vue)',
            'Resolved UI flicker when switching between preview modes',
            'Corrected environment variables not syncing in some workspaces'
        ]
    }
]
export const accordionDataV1_1_0 = [
    {
        type: 'new',
        items: [
            'Complete token overhaul unified color, spacing & typography system',
            'Preset Themes instantly apply predefined light/dark palettes',
            'Global token inspector view & edit all tokens in one place',
            'Preview share links generate temporary links to share progress with your team'
        ]
    },
    {
        type: 'updates',
        items: [
            'Smarter token fallback logic for consistent theming across components',
            'Improved OKLCH color handling for better contrast & accessibility',
            'Faster token rendering in the design preview (25% boost)',
            'Better error handling during build failures with clearer actions',
            'Updated environment variable manager for easier key/value edits'
        ]
    },
    {
        type: 'bugfixes',
        items: [
            'Fixed broken references causing inconsistent button colors',
            'Corrected spacing token mismatch in forms and modals',
            'Resolved theme switching lag in large projects'
        ]
    }
]



type TimelineItemProps = {
    date: string
    version: string
    children: ReactNode
}

const TimelineItem = ({ date, version, children }: TimelineItemProps) => {
    return (
        <div id={version} className='relative flex scroll-mt-18 justify-end gap-2'>
            <div className='sticky top-19 flex w-36 flex-col items-end gap-2 self-start pb-4 max-md:hidden'>
                <Badge className='flex size-6 w-auto justify-end rounded-sm text-sm font-medium'>{version}</Badge>
                <div className='text-muted-foreground text-right text-sm font-medium'>{date}</div>
            </div>
            <div className='flex flex-col items-center gap-2'>
                <div className='sticky top-19 flex size-6 items-center justify-center'>
                    <span className='bg-primary/20 flex size-4.5 shrink-0 items-center justify-center rounded-full'>
                        <span className='bg-primary size-3 rounded-full' />
                    </span>
                </div>
                <span className='w-px flex-1 border' />
            </div>
            <div className='flex flex-1 flex-col gap-4 pb-11 pl-3 md:pl-6 lg:pl-9'>
                <div className='flex flex-col gap-2 md:hidden'>
                    <Badge className='flex rounded-sm font-medium'>{version}</Badge>
                    <div className='font-medium'>{date}</div>
                </div>
                {children}
            </div>
        </div>
    )
}








