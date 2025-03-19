"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserProfile } from '@/components/user-profile'
import { api } from '@/convex/_generated/api'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { useAction, useQuery } from 'convex/react'
import {
  Banknote,
  CalendarDays,
  HomeIcon,
  Settings,
  LucideIcon,
  Users,
  Sparkles,
  CalendarPlus,
  MessageSquare,
  HelpCircle,
  Settings as SettingsIcon,
  Gift
} from "lucide-react"
import Link from 'next/link'
import { ReactNode } from 'react'
import { useState } from 'react'
import { CreateEventDialog } from '../events/_components/create-event-dialog'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { SidePanelContainer } from "./side-panel"

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: HomeIcon
  },
  {
    label: "Contacts",
    href: "/dashboard/contacts",
    icon: Users
  },
  {
    label: "Meetings",
    href: "/dashboard/events",
    icon: CalendarDays
  }
]

export default function DashboardNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getUserDashboardUrl);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const handleManageSubscription = async () => {
    try {
      const result = await getDashboardUrl({
        customerId: subscription?.customerId!
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error getting dashboard URL:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* Base blue gradient background */}
      <div className="absolute inset-0 bg-[#18181b]" />

      {/* Right side background */}
      <div className="absolute top-0 right-0 bottom-0 min-[1024px]:block hidden w-[400px] bg-[#f7f7f8] md:rounded-bl-[24px] md:rounded-br-[24px]" />

      {/* Content layers */}
      <div className="flex w-full relative z-10">
        {/* Sidebar */}
        <div className="min-[1024px]:block hidden w-[264px] h-full bg-[#18181b] text-white">
          <div className="flex h-full flex-col">
            <div className="flex h-[72px] items-center px-6">
              <Link prefetch={true} className="flex items-center gap-2.5 font-semibold hover:cursor-pointer text-white text-[1.25rem]" href="/">
                <span>CALCON</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-2 p-5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  prefetch={true}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-4 py-2 text-[0.9375rem] font-medium transition-colors",
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={clsx(
                    "h-4 w-4",
                    pathname === item.href
                      ? "text-white"
                      : "text-white/60"
                  )} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Bottom Navigation */}
            <div className="p-5 space-y-2">
              <div className="text-[0.8125rem] font-medium text-white/40 px-4 pb-2">MORE</div>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-[0.9375rem] font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5"
              >
                <MessageSquare className="h-4 w-4 text-white/60" />
                Discord
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-[0.9375rem] font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5"
              >
                <HelpCircle className="h-4 w-4 text-white/60" />
                Help Centre
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-[0.9375rem] font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5"
              >
                <Gift className="h-4 w-4 text-white/60" />
                Feature Request
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area with Side Panel */}
        <div className="flex-1 relative">
          {/* Top Navigation */}
          <header className="flex h-[61px] shrink-0 items-center gap-2.5 px-5 md:px-7 lg:px-9 bg-[#18181b] text-white">
            <Dialog>
              <SheetTrigger className="min-[1024px]:hidden p-2.5 transition">
                <HamburgerMenuIcon className="text-white h-[18px] w-[18px]" />
                <Link href="/dashboard">
                  <span className="sr-only">Home</span>
                </Link>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#18181b] text-white">
                <SheetHeader>
                  <Link href="/">
                    <SheetTitle className="flex items-center gap-2 text-white">
                      <span>CALCON</span>
                    </SheetTitle>
                  </Link>
                </SheetHeader>
                <div className="flex flex-col space-y-3 mt-[1rem]">
                  <DialogClose asChild>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full bg-white/5 text-white hover:bg-white/10 border-0">
                        <HomeIcon className="mr-2 h-[18px] w-[18px]" />
                        Home
                      </Button>
                    </Link>
                  </DialogClose>
                </div>
              </SheetContent>
            </Dialog>
            <div className="flex justify-center items-center gap-2.5 ml-auto">
              <Button
                onClick={() => setIsCreateEventOpen(true)}
                className="h-8 px-3 text-[0.875rem] flex items-center gap-1.5 text-white bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772] hover:opacity-90 transition-opacity"
              >
                <CalendarPlus className="h-[14px] w-[14px]" />
                Create Meeting
              </Button>
              {<UserProfile />}
            </div>
          </header>

          {/* Main Content with Side Panel */}
          {pathname === "/dashboard/contacts" ? (
            <div className="h-[calc(100vh-3rem)] relative">
              <div className="absolute inset-0">
                <div className="h-full relative">
                  <div className="absolute inset-0 bg-white md:rounded-tl-[24px] md:rounded-tr-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.05)] transition-all ease-in-out duration-300">
                    <div className="h-full overflow-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {children}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SidePanelContainer>
              {children}
            </SidePanelContainer>
          )}

          {/* Event Dialog */}
          <CreateEventDialog
            open={isCreateEventOpen}
            onOpenChange={setIsCreateEventOpen}
          />
        </div>
      </div>
    </div>
  );
} 