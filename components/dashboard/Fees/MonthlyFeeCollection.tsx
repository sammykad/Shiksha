'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import { IndianRupee } from 'lucide-react';
import { cn, formatCurrencyIN } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import AiMonthlyReport from '@/components/dashboard/reports/AiMonthlyReport';
import { motion, AnimatePresence } from 'motion/react';
import { useAcademicYear } from '@/context/AcademicYearContext';

type MonthlyFeeData = {
  label: string;
  month: number;
  year: number;
  amount: number;
  count: number;
  academicYearId: string;
};

interface MonthlyFeeCollectionProps {
  data: MonthlyFeeData[];
  className?: string;
}

export function MonthlyFeeCollection({
  data,
  className,
}: MonthlyFeeCollectionProps) {
  const { viewingYear, } = useAcademicYear();
  const chartData = useMemo(() => {
    return data.filter((item) => item.academicYearId === viewingYear?.id);
  }, [data, viewingYear?.id]);

  const maxAmount = useMemo(() => {
    return Math.max(...chartData.map((item) => item.amount), 1);
  }, [chartData]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({ amount: acc.amount + item.amount, count: acc.count + item.count }),
      { amount: 0, count: 0 }
    );
  }, [chartData]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Monthly Fee Collection</CardTitle>
          <CardDescription>Fee collection trend for {viewingYear?.name}</CardDescription>
        </div>

        <AiMonthlyReport
          data={data.filter(d => d.academicYearId === viewingYear?.id)}
          academicYearName={viewingYear?.name}
        />
      </CardHeader>

      <CardContent className="p-0 min-h-[250px]">
        <div className="pt-6 overflow-x-auto scrollbar-hide">
          {/* //overflow-x-auto  */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewingYear?.id}
              className="flex items-end gap-1 md:gap-2 px-1 min-w-[600px] md:min-w-full h-[220px]"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
                exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
              }}
            >
              {chartData.map((item) => {
                const barHeight = item.amount > 0
                  ? Math.max((item.amount / maxAmount) * 180, 4)
                  : 36;

                return (
                  <div
                    key={`${item.year}-${item.month}`}
                    className="flex flex-col items-center group relative flex-1 min-w-[40px]"
                  >
                    <HoverCard openDelay={0} closeDelay={0}>
                      <HoverCardTrigger asChild>
                        <motion.div
                          className={cn(
                            'w-full max-w-[32px] rounded-t-md transition-colors duration-300',
                            item.amount > 0
                              ? 'bg-gradient-to-t from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 cursor-pointer shadow-sm hover:shadow-md'
                              : 'bg-muted/40 border border-dashed border-muted-foreground/20'
                          )}
                          variants={{
                            hidden: { height: 0, y: 0, opacity: 0 },
                            visible: {
                              height: barHeight,
                              y: [0, -10, 4, -4, 0],
                              opacity: 1,
                              transition: {
                                height: { type: 'spring', stiffness: 260, damping: 20 },
                                y: { duration: 0.5, ease: 'easeOut' },
                                opacity: { duration: 0.2 },
                              },
                            },
                            exit: {
                              height: 0,
                              opacity: 0,
                              transition: { duration: 0.2, ease: 'easeIn' },
                            },
                          }}
                        />
                      </HoverCardTrigger>

                      <HoverCardContent
                        side="top"
                        align="center"
                        className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm p-3 shadow-lg w-auto"
                      >
                        <div className="space-y-1 text-center">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {item.label}
                          </div>
                          {item.amount > 0 ? (
                            <>
                              <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                {item.amount.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium">
                                {item.count} payment{item.count !== 1 ? 's' : ''}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground font-medium italic">
                              No collection
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <span className="text-[10px] md:text-xs mt-4 text-muted-foreground font-medium rotate-[-45px] md:rotate-0 whitespace-nowrap">
                      {item.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Collection</p>
          <div className="text-2xl font-bold flex items-center text-primary">
            <IndianRupee className="h-5 w-5 mr-1" />
            {formatCurrencyIN(totals.amount)}
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-muted-foreground">Total Payments</p>
          <div className="text-2xl font-bold text-foreground">{totals.count}</div>
        </div>
      </CardFooter>
    </Card>
  );
}