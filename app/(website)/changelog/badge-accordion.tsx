import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Bug } from 'lucide-react'

type ChangelogItem = {
  type: string
  items: string[]
  badges?: string[]
}

type BadgeAccordionProps = {
  data: ChangelogItem[]
}

const categoryConfig = {
  new: {
    className:
      'border-none h-7 rounded-full bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 px-3',
    label: 'New',
    icon: Sparkles,
  },
  improvements: {
    className:
      'border-none h-7 rounded-full bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400 px-3',
    label: 'Improvements',
    icon: RefreshCw,
  },
  bugfixes: {
    className:
      'border-none h-7 rounded-full bg-amber-600/10 text-amber-600 dark:bg-orange-400/10 dark:text-orange-400 px-3',
    label: 'Bug Fixes',
    icon: Bug,
  },
} as const

const BadgeAccordion = ({ data }: BadgeAccordionProps) => {
  return (
    <Accordion type='multiple' className='w-full' defaultValue={['item-0']}>
      {data.map((item, index) => {
        const config = categoryConfig[item.type as keyof typeof categoryConfig] ?? categoryConfig.new
        const Icon = config.icon

        return (
          <AccordionItem key={index} value={`item-${index}`} className='border-b-0'>
            <AccordionTrigger className='hover:no-underline rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 [&>svg]:size-5'>
              <Badge className={config.className}>
                <Icon className='mr-1.5 size-3.5 shrink-0' />
                <span>{config.label}</span>
                <span className='ml-1.5 text-xs opacity-60'>({item.items.length})</span>
              </Badge>
            </AccordionTrigger>
            <AccordionContent className='text-muted-foreground pb-1'>
              <ul className='ml-2 space-y-2 border-l-2 pl-5 text-sm'>
                {item.items.map((listItem, listIndex) => (
                  <li key={listIndex} className='leading-relaxed'>
                    {listItem}
                  </li>
                ))}
              </ul>
              {item.badges && item.badges.length > 0 && (
                <div className='mt-4 ml-2 flex flex-wrap items-center gap-2'>
                  {item.badges.map((badge, badgeIndex) => (
                    <div
                      key={badgeIndex}
                      className='bg-muted text-muted-foreground rounded-md px-3 py-1 text-xs font-mono'
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default BadgeAccordion
