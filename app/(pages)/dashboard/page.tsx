import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Code, Star, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-4">
        <h1 className="text-xl font-medium tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to your dashboard overview.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Total Projects</CardTitle>
            <Code className="h-3.5 w-3.5 text-[#235ce0]" />
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-lg font-semibold">12</div>
            <p className="text-[0.75rem] text-muted-foreground mt-0.5">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Active Users</CardTitle>
            <Users className="h-3.5 w-3.5 text-[#235ce0]" />
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-lg font-semibold">1,234</div>
            <p className="text-[0.75rem] text-muted-foreground mt-0.5">
              +15% increase
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Performance</CardTitle>
            <Zap className="h-3.5 w-3.5 text-[#235ce0]" />
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-lg font-semibold">98.2%</div>
            <p className="text-[0.75rem] text-muted-foreground mt-0.5">
              +2.1% from average
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Engagement</CardTitle>
            <Activity className="h-3.5 w-3.5 text-[#235ce0]" />
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-lg font-semibold">89%</div>
            <p className="text-[0.75rem] text-muted-foreground mt-0.5">
              +5% this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-4">
        <Card className="lg:col-span-4 rounded-lg border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Project Growth</CardTitle>
            <CardDescription className="text-[0.75rem]">
              Your project creation and completion rate
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-[200px] flex items-end gap-2">
              {[40, 25, 45, 30, 60, 75, 65, 45, 50, 65, 70, 80].map((height, i) => (
                <div
                  key={i}
                  className="bg-[#235ce0]/10 hover:bg-[#235ce0]/20 rounded-md w-full transition-colors"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[0.75rem] text-muted-foreground">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-lg border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Recent Achievements</CardTitle>
            <CardDescription className="text-[0.75rem]">
              Latest milestones reached
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#235ce0]/10 p-1.5 rounded-full">
                  <Star className="h-3 w-3 text-[#235ce0]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[0.75rem] font-medium">First 1000 Users</p>
                  <Progress value={100} className="h-1.5 bg-[#235ce0]/10" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#235ce0]/10 p-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-[#235ce0]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[0.75rem] font-medium">50 Projects Created</p>
                  <Progress value={75} className="h-1.5 bg-[#235ce0]/10" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#235ce0]/10 p-1.5 rounded-full">
                  <Zap className="h-3 w-3 text-[#235ce0]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[0.75rem] font-medium">Premium Features</p>
                  <Progress value={45} className="h-1.5 bg-[#235ce0]/10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Updates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Quick Actions</CardTitle>
            <CardDescription className="text-[0.75rem]">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            <Button asChild variant="outline" className="w-full justify-start gap-2 h-8 text-[0.75rem]">
              <Link href="/dashboard/projects">
                <Code className="h-3 w-3" />
                New Project
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-lg border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[0.8125rem] font-medium">Latest Updates</CardTitle>
            <CardDescription className="text-[0.75rem]">Recent changes and notifications</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {[
                {
                  title: "New Feature Released",
                  description: "Enhanced project analytics and reporting tools are now available.",
                  time: "2 hours ago"
                },
                {
                  title: "System Update",
                  description: "Performance improvements and bug fixes deployed.",
                  time: "5 hours ago"
                },
                {
                  title: "Community Milestone",
                  description: "Over 1,000 projects created using Nextjs Starter Kit!",
                  time: "1 day ago"
                }
              ].map((update, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <div>
                    <p className="text-[0.75rem] font-medium">{update.title}</p>
                    <p className="text-[0.75rem] text-muted-foreground">{update.description}</p>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground whitespace-nowrap">{update.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="px-4 pb-4 pt-0">
            <Button variant="ghost" className="w-full h-8 text-[0.75rem]">View All Updates</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
