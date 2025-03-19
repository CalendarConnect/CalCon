"use client"
import { HelpCircle } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "motion/react"

const faqs = [
    {
        question: "When exactly is CalCon launching?",
        answer: "CalCon is launching on April 2nd, 2024. Waitlist members will get priority access and can start using the platform immediately on launch day."
    },
    {
        question: "What are the benefits of joining the waitlist?",
        answer: "Waitlist members get exclusive access to our Founding 1000 program, which includes lifetime preferred pricing at $9/month, early access to new features, and the opportunity to shape the future of professional scheduling."
    },
    {
        question: "How does the Founding 1000 program work?",
        answer: "The Founding 1000 program is limited to our first 1000 members. You'll get unlimited contacts, all future features, and early access to updates at a lifetime rate of $9/month - this special pricing never increases."
    },
    {
        question: "What makes CalCon different from other scheduling tools?",
        answer: "CalCon is the first calendar network built for the AI era. Unlike traditional tools, we enable true two-way scheduling while maintaining complete privacy. Our infrastructure is ready for AI assistants like OpenAI's Operator, preparing your network for the future of scheduling."
    },
    {
        question: "How do you protect calendar privacy?",
        answer: "We take a privacy-first approach. We only see free/busy status - never event details, participant information, meeting titles, or locations. Your calendar privacy stays completely protected while enabling efficient scheduling."
    }
]

export function AccordionComponent() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    {/* Pill badge */}
                    <div className="mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
                            <HelpCircle className="h-4 w-4" />
                            <span>FAQ</span>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772] dark:from-[#f35f43] dark:via-[#f35f43] dark:to-[#f7b772] pb-2">
                        Common Questions About Our Launch
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                        Everything you need to know about joining CalCon's waitlist and our upcoming launch. Have more questions? Join our Discord community.
                    </p>
                </div>

                {/* Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index + 1}`}
                                className="border border-gray-200 dark:border-gray-800 rounded-lg mb-4 px-2"
                            >
                                <AccordionTrigger className="hover:no-underline py-4 px-2">
                                    <span className="font-medium text-left text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {faq.question}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-2 pb-4">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {faq.answer}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
