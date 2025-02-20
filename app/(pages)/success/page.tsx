import { Button } from '@/components/ui/button';
import NavBar from '@/components/wrapper/navbar';
import { api } from '@/convex/_generated/api';
import { getAuthToken } from '@/lib/auth';
import { fetchQuery } from 'convex/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SuccessPage() {
  const token = await getAuthToken();

  const { hasActiveSubscription } = await fetchQuery(api.subscriptions.getUserSubscriptionStatus, {
  }, {
    token: token!,
  });

  // If user has an active subscription, redirect them to the dashboard
  if (hasActiveSubscription) {
    redirect('/dashboard');
  }

  // Only show this page if something went wrong with the subscription
  return (
    <main className="flex min-w-screen flex-col items-center justify-between">
      <NavBar />
      <h1 className="mt-[35vh] mb-3 scroll-m-20 text-5xl font-semibold tracking-tight transition-colors first:mt-0">
        Something went wrong 😕
      </h1>
      <Link href="/pricing" className='mt-4'>
        <Button>Try Again</Button>
      </Link>
    </main>
  )
}
