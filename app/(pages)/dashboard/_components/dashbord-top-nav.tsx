"use client"

import ModeToggle from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserProfile } from '@/components/user-profile'
import { api } from '@/convex/_generated/api'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { useAction, useQuery } from 'convex/react'
import { Banknote, Folder, HomeIcon, Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { CreateEventDialog } from '../events/_components/create-event-dialog'

export default function DashboardTopNav({ children }: { children: ReactNode }) {
  const subscription = useQuery(api.subscriptions.getUserSubscription);

  const getDashboardUrl = useAction(api.subscriptions.getUserDashboardUrl);

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

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[55px] items-center gap-4 border-b px-3">
        <Dialog>
          <SheetTrigger className="min-[1024px]:hidden p-2 transition">
            <HamburgerMenuIcon />
            <Link href="/dashboard">
              <span className="sr-only">Home</span>
            </Link>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <Link href="/">
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>CalCon</span>
                </SheetTitle>
              </Link>
            </SheetHeader>
            <div className="flex flex-col space-y-3 mt-[1rem]">
              <DialogClose asChild>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    <HomeIcon className="mr-2 h-4 w-4 text-blue-600" />
                    Home
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link href="/dashboard/finance">
                  <Button variant="outline" className="w-full">
                    <Banknote className="mr-2 h-4 w-4 text-blue-600" />
                    Finance
                  </Button>
                </Link>
              </DialogClose>
              <Separator className="my-3" />
              <DialogClose asChild>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4 text-blue-600" />
                    Settings
                  </Button>
                </Link>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>
        <div className="flex justify-center items-center gap-2 ml-auto">
          {subscription && (
            subscription?.metadata?.plan === "pro" ? (
              <Button variant={"outline"} onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            ) : (
              <Button variant={"outline"} onClick={handleManageSubscription}>
                Upgrade to Pro
              </Button>
            )
          )}
          <Button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CalendarPlus className="h-4 w-4" />
            Create Event
          </Button>
          {<UserProfile />}
          <ModeToggle />
        </div>
      </header>
      <CreateEventDialog
        open={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
      />
      {children}
    </div>
  )
}
