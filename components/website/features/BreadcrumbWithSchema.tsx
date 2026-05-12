'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbWithSchemaProps {
  featureName?: string;
}

export function BreadcrumbWithSchema({ featureName }: BreadcrumbWithSchemaProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      href,
      label: index === segments.length - 1 && featureName ? featureName : label,
      isLast: index === segments.length - 1,
    };
  });

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.isLast ? undefined : item.href,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Breadcrumb className="my-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/features">Features</BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbItems.length > 1 && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {breadcrumbItems[breadcrumbItems.length - 1].isLast ? (
                  <BreadcrumbPage>{breadcrumbItems[breadcrumbItems.length - 1].label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={breadcrumbItems[breadcrumbItems.length - 1].href}>
                    {breadcrumbItems[breadcrumbItems.length - 1].label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
