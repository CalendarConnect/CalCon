"use client"
import PageWrapper from "@/components/wrapper/page-wrapper";
import { SignUp } from "@clerk/nextjs";

interface EventSignUpPageProps {
    params: {
        eventId: string;
    };
}

export default function EventSignUpPage({ params }: EventSignUpPageProps) {
    return (
        <PageWrapper>
            <div className="flex min-w-screen justify-center my-[5rem]">
                <SignUp 
                    afterSignUpUrl={`/api/create-participant-trial?eventId=${params.eventId}`}
                    redirectUrl={`/api/create-participant-trial?eventId=${params.eventId}`}
                />
            </div>
        </PageWrapper>
    );
}
