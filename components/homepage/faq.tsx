import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
    return (
        <Accordion type="single" collapsible className="w-full p-8">
            <AccordionItem value="item-1">
                <AccordionTrigger>What exactly can others see when I share my calendar?</AccordionTrigger>
                <AccordionContent>
                Your calendar information stays completely private. No event details, no participant information, no meeting titles, and no locations. Your calendar privacy stays completely protected.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>How does the Founding 1000 program work?</AccordionTrigger>
                <AccordionContent>
                Join as one of our first 1000 members at $9/month for life. You'll get unlimited contacts, all future features, and early access to updates. This special rate never increases - it's our way of thanking early supporters who help build our network.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Which calendar systems does CalCon support?</AccordionTrigger>
                <AccordionContent>
                We currently support Google Calendar and Outlook, with more platforms joining regularly. All integrations use official calendar APIs with our privacy-first approach, ensuring your data stays secure..
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
