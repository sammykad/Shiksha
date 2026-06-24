import Accordion from "./badge-accordion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import Container from "@/components/ui/container"
import { cn } from "@/lib/utils"
import { changelogEntries } from "@/lib/data/changelog/changelog-entries"

const appUrl = new URL("https://shiksha.cloud")

function jsonLd() {
  const entries = changelogEntries.map((e, i) => ({
    "@type": "TechArticle" as const,
    headline: e.title,
    description: e.description,
    datePublished: e.date,
    version: e.version,
    position: i + 1,
    url: `${appUrl.origin}/changelog#${e.version}`,
  }))

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${appUrl.origin}/changelog`,
        url: `${appUrl.origin}/changelog`,
        name: "Product Updates & Changelog | Shiksha.cloud",
        description:
          "Stay updated with the latest features, improvements, and bug fixes in Shiksha Cloud School Management System.",
        breadcrumb: {
          "@id": `${appUrl.origin}/changelog#breadcrumb`,
        },
        dateModified: changelogEntries[0]?.date ?? "",
        isPartOf: {
          "@id": `${appUrl.origin}/#website`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${appUrl.origin}/changelog#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${appUrl.origin}/` },
          { "@type": "ListItem", position: 2, name: "Changelog", item: `${appUrl.origin}/changelog` },
        ],
      },
      ...entries,
    ],
  }
}

function TimelineLine({ version }: { version: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="size-3 rounded-full ring-4 ring-background bg-blue-600 dark:bg-blue-500" />
      <div className="w-px flex-1 bg-border" />
    </div>
  )
}

function EntryCard({
  entry,
  isLatest,
}: {
  entry: (typeof changelogEntries)[number]
  isLatest: boolean
}) {
  const Icon = entry.icon

  return (
    <Container>
      <div id={entry.version} className="relative flex scroll-mt-24 justify-end gap-3 md:gap-5">
        <div className="sticky top-24 flex w-32 flex-col items-end gap-1.5 self-start pt-0.5 max-md:hidden">
          <span className="text-muted-foreground text-xs font-medium tabular-nums">{entry.date}</span>
        </div>

        <div className="flex flex-col items-center">
          <TimelineLine version={entry.version} />
        </div>

        <div className="flex flex-1 flex-col gap-4 pb-14 pl-1 md:pl-2">
          <div className="flex items-center gap-1.5 md:hidden">
            <span className="inline-flex size-2 rounded-full bg-blue-600 dark:bg-blue-500" />
            <span className="text-muted-foreground text-xs font-medium">{entry.date}</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {entry.version}
                </span>
                {isLatest && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    Latest
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold leading-snug md:text-xl">{entry.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{entry.description}</p>
            </div>

            {entry.image && (
              <div className="overflow-hidden rounded-lg border">
                <Image
                  src={entry.image}
                  width={1000}
                  height={500}
                  alt={entry.imageAlt ?? ""}
                  className="w-full object-cover"
                />
              </div>
            )}

            <Accordion data={entry.categories} />
          </div>
        </div>
      </div>
    </Container>
  )
}

export const metadata = {
  title: "Product Updates & Changelog | Shiksha.cloud",
  description:
    "Stay updated with the latest features, improvements, and bug fixes in Shiksha Cloud School Management System. We are constantly evolving to serve Indian schools better.",
  keywords: [
    "shiksha cloud changelog",
    "school software updates",
    "edtech features",
    "product release notes",
    "Indian school management system updates",
  ],
  alternates: {
    canonical: `${appUrl.origin}/changelog`,
  },
  openGraph: {
    title: "What's New in Shiksha.cloud | Changelog",
    description: "Track our latest updates and new feature releases for Indian schools.",
    url: `${appUrl.origin}/changelog`,
    images: [`${appUrl.origin}/og-image.png`],
  },
}

export default function ChangeLogPage() {
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <Container delay={0}>
          <div className="mb-14 flex flex-col gap-1">
            <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Changelog
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-balance text-sm leading-relaxed sm:text-base">
              New features, improvements, and fixes — every update that makes Shiksha.cloud
              better for Indian schools.
            </p>
          </div>
        </Container>

        <div className="flex flex-col">
          {changelogEntries.map((entry, index) => (
            <EntryCard key={entry.version} entry={entry} isLatest={index === 0} />
          ))}
        </div>

        <Container delay={0.1}>
          <div className="mt-12 rounded-lg border p-6 text-center sm:p-8">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-1">
              <MessageSquare className="text-muted-foreground size-5" />
              <h2 className="text-lg font-semibold">Have feedback?</h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                We build Shiksha.cloud for schools like yours. Tell us what you&apos;d
                like to see next.
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/contact">Suggest a Feature</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
