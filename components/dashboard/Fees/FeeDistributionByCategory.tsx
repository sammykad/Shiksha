import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrencyINWithSymbol } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { ActivityIcon, Pin, User } from 'lucide-react';

interface FeeCategory {
  name: string;
  paidAmount: number;
  pendingAmount: number;
}

interface FeeDistributionByCategoryProps {
  data: FeeCategory[];
  className?: string;
}

const FeeDistributionByCategory: React.FC<
  FeeDistributionByCategoryProps
> = async ({ data, className }: FeeDistributionByCategoryProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fee Collection by Category</CardTitle>
        <CardDescription>
          Shows paid vs pending fees within each category
        </CardDescription>
      </CardHeader>
      <CardContent>


        {data.length === 0 ? (
          <div className="flex items-center justify-center">
            <EmptyState
              title="No fee categories found"
              description="Create your first fee category to get started."
              icons={[User, ActivityIcon, Pin]}
              // image="/EmptyStatePageNotFound.png"
              action={{
                href: "/dashboard/fees/admin/fee-categories",
                label: "Create Fee Categories"
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {category.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrencyINWithSymbol(category.paidAmount + category.pendingAmount)} - Total
                  </span>                </div>
                <Progress
                  value={
                    category.paidAmount + category.pendingAmount > 0
                      ? Math.min(100, (category.paidAmount / (category.paidAmount + category.pendingAmount)) * 100)
                      : 0
                  }
                  className="h-2"
                />
                <span className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {formatCurrencyINWithSymbol(category.paidAmount)} - Collected
                </span>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default FeeDistributionByCategory;
