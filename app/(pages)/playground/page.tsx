"use client";

import ModeToggle from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "ai/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Share,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useUser } from '@clerk/nextjs';

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  timestamp: Date;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface Participant {
  name: string;
  email: string;
  company?: string;
  role?: string;
}

interface ParticipantSelectorProps {
  onSelect: (participants: Participant[]) => void;
  onNext: () => void;
}

const ParticipantSelector = ({ onSelect, onNext }: ParticipantSelectorProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState<Participant>({
    name: "",
    email: "",
    company: "",
    role: "",
  });
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);

  const addParticipant = () => {
    if (newParticipant.name && newParticipant.email) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant({ name: "", email: "", company: "", role: "" });
      onSelect([...participants, newParticipant]);
    }
  };

  const removeParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
    onSelect(updatedParticipants);
  };

  const addFromContacts = (contact: Participant) => {
    setParticipants([...participants, contact]);
    onSelect([...participants, contact]);
    setIsContactsDialogOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Name"
          value={newParticipant.name}
          onChange={(e) =>
            setNewParticipant({ ...newParticipant, name: e.target.value })
          }
          className="w-[calc(50%-0.25rem)]"
        />
        <Input
          placeholder="Email"
          type="email"
          value={newParticipant.email}
          onChange={(e) =>
            setNewParticipant({ ...newParticipant, email: e.target.value })
          }
          className="w-[calc(50%-0.25rem)]"
        />
        <Input
          placeholder="Company (optional)"
          value={newParticipant.company}
          onChange={(e) =>
            setNewParticipant({ ...newParticipant, company: e.target.value })
          }
          className="w-[calc(50%-0.25rem)]"
        />
        <Input
          placeholder="Role (optional)"
          value={newParticipant.role}
          onChange={(e) =>
            setNewParticipant({ ...newParticipant, role: e.target.value })
          }
          className="w-[calc(50%-0.25rem)]"
        />
        <div className="flex gap-2 w-full">
          <Button onClick={addParticipant} className="flex-1" variant="secondary" size="sm">
            Add Participant
          </Button>
          <Dialog open={isContactsDialogOpen} onOpenChange={setIsContactsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1" size="sm">
                Select from Contacts
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select from Contacts</DialogTitle>
              </DialogHeader>
              {/* We'll integrate with the contacts system here */}
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Contact selection will be integrated here
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {participants.length > 0 && (
        <div className="flex flex-col gap-2">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-secondary/20 rounded-md p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{participant.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {participant.email}
                  {(participant.company || participant.role) && " • "}
                  {participant.company}
                  {participant.company && participant.role && " • "}
                  {participant.role}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeParticipant(index)}
                className="shrink-0"
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={onNext} variant="secondary" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const DurationSelector = ({ onSelect }: { onSelect: (duration: string) => void }) => {
  const durations = [
    "15 minutes",
    "30 minutes",
    "45 minutes",
    "1 hour",
    "2 hours",
    "3 hours"
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {durations.map((duration) => (
        <Button
          key={duration}
          onClick={() => onSelect(duration)}
          variant="outline"
          className="bg-[#007AFF] text-white hover:bg-[#0056b3] border-none"
        >
          {duration}
        </Button>
      ))}
    </div>
  );
};

const LocationSelector = ({ onSelect }: { onSelect: (location: string) => void }) => {
  const locations = [
    "Google Meets",
    "Zoom",
    "Skype",
    "Physical Location"
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {locations.map((location) => (
        <Button
          key={location}
          onClick={() => onSelect(location)}
          variant="outline"
          className="bg-[#007AFF] text-white hover:bg-[#0056b3] border-none"
        >
          {location}
        </Button>
      ))}
    </div>
  );
};

export default function PlaygroundPage() {
  const [model, setModel] = useState("openai:gpt-4o");
  const [expandedReasoning, setExpandedReasoning] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Model parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [topP, setTopP] = useState(0.9);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);

  const { user } = useUser();
  const firstName = user?.firstName || (user?.fullName ? user.fullName.split(" ")[0] : "there");

  const toggleReasoning = (index: number) => {
    setExpandedReasoning((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const { messages, isLoading, input, handleInputChange, handleSubmit, setMessages, append } =
    useChat({
      initialMessages: [
        {
          id: '1',
          content: `Hello, ${user?.firstName}, Welcome to the AI Playground, Let's create your event! What is the event title?`,
          role: 'assistant',
        },
      ],
      body: {
        model,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
      },
    });

  const [lastParticipantMessage, setLastParticipantMessage] = useState<number>(-1);
  const [lastDurationMessage, setLastDurationMessage] = useState<number>(-1);
  const [lastLocationMessage, setLastLocationMessage] = useState<number>(-1);

  const handleDurationSelect = (duration: string) => {
    if (selectedDuration) {
      append({
        content: `I would like to change the duration from ${selectedDuration} to ${duration}`,
        role: 'user',
      });
    } else {
      append({
        content: duration,
        role: 'user',
      });
    }
    setSelectedDuration(duration);
  };

  const handleLocationSelect = (location: string) => {
    if (selectedLocation) {
      append({
        content: `I would like to change the location from ${selectedLocation} to ${location}`,
        role: 'user',
      });
    } else {
      append({
        content: location,
        role: 'user',
      });
    }
    setSelectedLocation(location);
  };

  const handleParticipantSelect = (participants: Participant[]) => {
    setParticipants(participants);
  };

  const handleParticipantNext = () => {
    if (participants.length > 0) {
      // Calculate the index of the summary message that will be added
      const summaryMessageIndex = messages.length + 1; // +1 because we're adding two messages

      // First append the participants list
      append({
        content: `Here are all the participants: ${participants
          .map(p => `${p.name} (${p.email})${p.company ? ` from ${p.company}` : ''}${p.role ? ` as ${p.role}` : ''}`)
          .join(', ')}`,
        role: 'user',
      });

      // Then append the summary and update the lastParticipantMessage
      append({
        content: `Here's a summary of your event:

• Title: ${messages.find(m => m.role === 'user' && !m.content.includes('duration') && !m.content.includes('location') && !m.content.includes('participant'))?.content || 'Not specified'}
• Description: ${messages.find(m => m.content.toLowerCase().includes('korte kennismaking'))?.content || 'Not specified'}
• Duration: ${selectedDuration || 'Not specified'}
• Location: ${selectedLocation || 'Not specified'}
• Participants:${participants.map(p => `\n  - ${p.name} (${p.email})${p.company ? ` from ${p.company}` : ''}${p.role ? ` as ${p.role}` : ''}`).join('')}

Would you like to make any changes to these details?`,
        role: 'assistant',
      }).then(() => {
        // Update lastParticipantMessage after the messages are added
        setLastParticipantMessage(summaryMessageIndex);
      });
    }
  };

  const shouldShowDurationSelector = (message: Message, index: number) => {
    const content = message.content.toLowerCase();
    const isAskingDuration = 
      content.includes('how long will') || 
      content.includes('what is the duration') || 
      content.includes('event duration') ||
      content.includes('event last');
    const isConfirmation = 
      content.includes('now set to') || 
      content.includes('duration is now') || 
      content.includes('the duration is');
    
    // If this is a confirmation message, schedule the state update
    if (message.role === 'assistant' && isConfirmation && index > lastDurationMessage) {
      // Use setTimeout to avoid state updates during render
      setTimeout(() => setLastDurationMessage(index), 0);
    }
    
    return message.role === 'assistant' && 
           isAskingDuration && 
           !isConfirmation && 
           index > lastDurationMessage;
  };

  const shouldShowLocationSelector = (message: Message, index: number) => {
    const content = message.content.toLowerCase();
    const isAskingLocation = 
      content.includes('where will') || 
      content.includes('what is the location') ||
      content.includes('what is the event location') ||
      content.includes('event location') ||
      content.includes('choose among google meets');
    const isConfirmation = 
      content.includes('now set to') || 
      content.includes('location is now') || 
      content.includes('the location is') ||
      content.includes('perfect choice');
    
    // If this is a confirmation message, schedule the state update
    if (message.role === 'assistant' && isConfirmation && index > lastLocationMessage) {
      // Use setTimeout to avoid state updates during render
      setTimeout(() => setLastLocationMessage(index), 0);
    }
    
    return message.role === 'assistant' && 
           isAskingLocation && 
           !isConfirmation && 
           index > lastLocationMessage;
  };

  const shouldShowParticipantSelector = (message: Message, index: number) => {
    const content = message.content.toLowerCase();
    const isAskingParticipants = 
      content.includes('who will') || 
      content.includes('who are the participants') ||
      content.includes('add participants') ||
      content.includes('provide the name and email') ||
      content.includes('participant');
    const isConfirmation = 
      content.includes('participants are:') || 
      content.includes('participants added') || 
      content.includes('participants are now') ||
      content.includes('thank you for adding') ||
      content.includes('event details') ||
      content.includes('event summary') ||
      content.includes('here\'s a summary of your event');
    
    // Don't show if we're at or past the last participant message
    if (index <= lastParticipantMessage) {
      return false;
    }
    
    return message.role === 'assistant' && isAskingParticipants && !isConfirmation;
  };

  const components = {
    code({ node, inline, className, children, ...props }: CodeProps) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      const code = String(children).replace(/\n$/, '');

      return !inline ? (
        <div className="relative rounded-lg overflow-hidden my-2">
          <div className="flex items-center justify-between px-4 py-2 bg-[#282C34] text-gray-200">
            <span className="text-xs font-medium">{language}</span>
            <button
              onClick={() => handleCopyCode(code)}
              className="hover:text-white transition-colors"
            >
              {copiedCode === code ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="!bg-[#1E1E1E] !m-0 !p-4 !rounded-b-lg"
          >
            {code}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5" {...props}>
          {children}
        </code>
      );
    }
  };

  const [participants, setParticipants] = useState<Participant[]>([]);

  return (
    <div className="flex flex-col lg:flex-row h-screen dark:bg-black bg-white dark:text-white text-black">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[65vh] lg:h-screen">
        <header className="flex items-center justify-between py-3 px-4 border-b dark:border-zinc-800 border-zinc-200">
          <div className="flex items-center gap-3">
            <Link prefetch={true} href="/">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h1 className="text-sm font-medium">Event Creation</h1>
              </div>
            </Link>
            <Badge
              variant="outline"
              className="text-xs dark:border-zinc-800 border-zinc-200"
            >
              {model?.split(":")[1] === "deepseek-reasoner" ? "deepseek-r" : model?.split(":")[1]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs dark:border-zinc-800 border-zinc-200 dark:hover:bg-zinc-900 hover:bg-zinc-100 hidden sm:inline-flex"
            >
              <Share className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs dark:border-zinc-800 border-zinc-200 dark:hover:bg-zinc-900 hover:bg-zinc-100 hidden sm:inline-flex"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6"> 
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 flex-row"
              >
                <div className="flex flex-col gap-2 max-w-[480px]">
                  <div className="bg-[#E9E9EB] dark:bg-[#1C1C1E] text-black dark:text-white rounded-[20px] rounded-bl-[8px] p-3">
                    Hello, {firstName}! Welcome to the AI Playground.
                  </div>
                </div>
              </motion.div>
            )}
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 ${
                    message.role === "assistant"
                      ? "flex-row"
                      : "flex-row-reverse"
                  }`}
                >
                  <div className="flex flex-col gap-2 max-w-[480px]">
                    {message.reasoning && (
                      <div
                        className={`${
                          message.role === "user"
                            ? "bg-[#007AFF] text-white"
                            : "bg-[#E9E9EB] dark:bg-[#1C1C1E] text-black dark:text-white"
                        } rounded-[20px] ${
                          message.role === "user"
                            ? "rounded-br-[8px]"
                            : "rounded-bl-[8px]"
                        }`}
                      >
                        <button
                          onClick={() => toggleReasoning(index)}
                          className="w-full flex items-center justify-between px-3 py-2"
                        >
                          <span className="text-xs font-medium opacity-70">
                            Reasoning
                          </span>
                          {expandedReasoning.includes(index) ? (
                            <ChevronUp className="w-3 h-3 opacity-70" />
                          ) : (
                            <ChevronDown className="w-3 h-3 opacity-70" />
                          )}
                        </button>
                        {expandedReasoning.includes(index) && (
                          <div className="px-3 pb-3 text-[12px] opacity-70">
                            <ReactMarkdown components={components}>
                              {message.reasoning}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                    {message.content && (
                      <div
                        className={`${
                          message.role === "user"
                            ? "bg-[#007AFF] text-white"
                            : "bg-[#E9E9EB] dark:bg-[#1C1C1E] text-black dark:text-white"
                        } rounded-[20px] ${
                          message.role === "user"
                            ? "rounded-br-[8px]"
                            : "rounded-bl-[8px]"
                        } px-3 py-2`}
                      >
                        <div className="text-[14px]">
                          <ReactMarkdown components={components}>
                            {message.content}
                          </ReactMarkdown>
                          {message.role === 'assistant' && (
                            <>
                              {shouldShowDurationSelector(message, index) && (
                                <DurationSelector
                                  onSelect={handleDurationSelect}
                                />
                              )}
                              {shouldShowLocationSelector(message, index) && (
                                <LocationSelector
                                  onSelect={handleLocationSelect}
                                />
                              )}
                              {shouldShowParticipantSelector(message, index) && (
                                <ParticipantSelector
                                  onSelect={handleParticipantSelect}
                                  onNext={handleParticipantNext}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Only show loading when isLoading is true AND there's no message being streamed */}
            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 dark:bg-zinc-900/50 bg-white rounded-lg p-4"
                >
                  <div className="w-6 h-6 rounded-full border dark:border-zinc-800 border-zinc-200 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1 mt-[0.5rem]">
                      <span
                        className="w-2 h-2 rounded-full dark:bg-zinc-700 bg-zinc-200 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full dark:bg-zinc-700 bg-zinc-200 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full dark:bg-zinc-700 bg-zinc-200 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t dark:border-zinc-800 border-zinc-200">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Send a message..."
                className="min-h-[60px] lg:min-h-[100px] bg-transparent dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
              />
              <div className="absolute bottom-3 right-3">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className="h-8 bg-white hover:bg-zinc-200 text-black"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className="h-full">
        <div className="h-full">
          <Tabs defaultValue="model" className="h-full flex flex-col">
            <TabsList className="w-full dark:bg-zinc-900/50 bg-zinc-100 border dark:border-zinc-800 border-zinc-200">
              <TabsTrigger value="model" className="flex-1 text-xs sm:text-sm">
                Model
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex-1 text-xs sm:text-sm">
                Parameters
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="model" className="mt-0 space-y-4 h-full">
                <div>
                  <label className="text-xs dark:text-zinc-400 text-zinc-600 mb-2 block">
                    Model
                  </label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai:gpt-4o">gpt-4o</SelectItem>
                      <SelectItem value="openai:gpt-4">gpt-4</SelectItem>
                      <SelectItem value="openai:gpt-3.5-turbo">
                        gpt-3.5 turbo
                      </SelectItem>
                      <SelectItem value="openai:gpt-4-turbo">
                        gpt-4 turbo
                      </SelectItem>
                      <SelectItem value="deepseek:deepseek-chat">
                        deepseek chat
                      </SelectItem>
                      <SelectItem value="deepseek:deepseek-coder">
                        deepseek coder
                      </SelectItem>
                      <SelectItem value="deepseek:deepseek-reasoner">
                        deepseek-r
                      </SelectItem>
                      <SelectItem value="groq:deepseek-r1-distill-llama-70b">
                        deepseek-r1-distill-llama-70b
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="parameters" className="mt-0 space-y-4 h-full">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs dark:text-zinc-400 text-zinc-600 mb-2 block">
                      Temperature ({temperature})
                    </label>
                    <Slider
                      value={[temperature]}
                      onValueChange={([value]) => setTemperature(value)}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <label className="text-xs dark:text-zinc-400 text-zinc-600 mb-2 block">
                      Max Tokens ({maxTokens})
                    </label>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={([value]) => setMaxTokens(value)}
                      max={4000}
                      step={100}
                    />
                  </div>

                  <div>
                    <label className="text-xs dark:text-zinc-400 text-zinc-600 mb-2 block">
                      Top P ({topP})
                    </label>
                    <Slider
                      value={[topP]}
                      onValueChange={([value]) => setTopP(value)}
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <label className="text-xs dark:text-zinc-400 text-zinc-600 mb-2 block">
                      Frequency Penalty ({frequencyPenalty})
                    </label>
                    <Slider
                      value={[frequencyPenalty]}
                      onValueChange={([value]) => setFrequencyPenalty(value)}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <label className="text-xs dark:text-zinc-400 text-zinc-600 mb-2 block">
                      Presence Penalty ({presencePenalty})
                    </label>
                    <Slider
                      value={[presencePenalty]}
                      onValueChange={([value]) => setPresencePenalty(value)}
                      max={2}
                      step={0.1}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
