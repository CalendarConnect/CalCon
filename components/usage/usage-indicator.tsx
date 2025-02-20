import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UsageIndicatorProps {
  current: number;
  limit: number;
  type: "events" | "contacts";
  showUpgradeButton?: boolean;
}

export function UsageIndicator({ current, limit, type, showUpgradeButton = true }: UsageIndicatorProps) {
  const router = useRouter();
  const percentage = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {type.charAt(0).toUpperCase() + type.slice(1)} Usage
        </CardTitle>
        <CardDescription>
          {current} of {limit} {type} used
          {isAtLimit && " (Free tier limit reached)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          {showUpgradeButton && isAtLimit && (
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => router.push("/settings/billing")}
            >
              Upgrade to Pro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
