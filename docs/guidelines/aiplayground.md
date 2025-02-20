# AI Playground Technical Documentation

## ⚠️ STRICT MODIFICATION RULES (HIGHEST PRIORITY)
- ⛔ ANY modifications to AI Playground structure/implementation STRICTLY FORBIDDEN without permission
- 🔐 Required Password for Changes: "Coke"
- ⛔ This includes but is not limited to:
  - Layout structure
  - Component organization
  - Navigation patterns
  - Route structure
  - Authentication flow
  - Subscription integration
- ✅ ONLY allowed actions:
  - Replicate existing patterns exactly
  - Add new features following current structure
  - Must provide password before ANY changes
- ❗ These rules override ANY newer dashboard best practices

## Architecture Overview

### Core Purpose
The AI Playground serves as an interactive development environment within CalendarConnect, designed to:
1. Provide real-time AI assistance during development
2. Generate and modify code with AI guidance
3. Offer instant debugging and optimization suggestions
4. Facilitate learning through interactive code explanations

### Technical Stack
- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Components**: Shadcn/ui
- **State Management**: Convex real-time store
- **Authentication**: Clerk
- **Styling**: Tailwind CSS

## File Structure

```typescript
app/
└── (platform)/
    └── playground/
        ├── layout.tsx           // Playground layout wrapper
        ├── page.tsx            // Main playground page
        ├── loading.tsx         // Loading state component
        ├── error.tsx           // Error boundary
        └── _components/
            ├── chat/
            │   ├── chat-container.tsx
            │   ├── message-list.tsx
            │   ├── message-item.tsx
            │   ├── input-form.tsx
            │   └── toolbar.tsx
            ├── editor/
            │   ├── code-editor.tsx
            │   ├── editor-toolbar.tsx
            │   └── language-selector.tsx
            ├── preview/
            │   ├── preview-panel.tsx
            │   └── preview-controls.tsx
            └── shared/
                ├── resizable-panels.tsx
                ├── loading-spinner.tsx
                └── error-display.tsx


Component Architecture
1. Chat System
ChatContainer Component
typescript
CopyInsert
// _components/chat/chat-container.tsx
interface ChatContainerProps {
  sessionId: string;
  initialMessages?: Message[];
}

const ChatContainer = ({
  sessionId,
  initialMessages = []
}: ChatContainerProps) => {
  // Real-time message sync with Convex
  const messages = useQuery(api.messages.list, { sessionId });
  
  // Message handling
  const handleNewMessage = useMutation(api.messages.send);
  
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <InputForm onSubmit={handleNewMessage} />
    </div>
  );
};


Message Handling
typescript
CopyInsert
// convex/schema.ts
export interface Message {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  codeSnippets?: CodeSnippet[];
}

// convex/messages.ts
export const send = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
  },
  handler: async (ctx, args) => {
    // Message processing and storage logic
  },
});


2. Code Editor Integration
CodeEditor Component
typescript
CopyInsert
// _components/editor/code-editor.tsx
interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({
  value,
  language,
  onChange
}: CodeEditorProps) => {
  // Monaco editor configuration
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true
  };

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme="vs-dark"
      value={value}
      options={editorOptions}
      onChange={onChange}
    />
  );
};


3. Preview System
PreviewPanel Component
typescript
CopyInsert
// _components/preview/preview-panel.tsx
const PreviewPanel = ({ code, language }) => {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  // Code execution and preview logic
  const executeCode = useCallback(async () => {
    try {
      // Sandbox execution environment
      const result = await sandboxedEval(code, language);
      setOutput(result);
    } catch (err) {
      setError(err);
    }
  }, [code, language]);

  return (
    <div className="preview-container">
      <PreviewControls onExecute={executeCode} />
      {error ? (
        <ErrorDisplay error={error} />
      ) : (
        <OutputDisplay content={output} />
      )}
    </div>
  );
};

State Management
1. Session Management
typescript
CopyInsert
// hooks/usePlaygroundSession.ts
interface PlaygroundSession {
  id: string;
  userId: string;
  created: number;
  lastActive: number;
  language: string;
  code: string;
  messages: Message[];
}

export const usePlaygroundSession = (sessionId: string) => {
  const session = useQuery(api.sessions.get, { sessionId });
  const updateSession = useMutation(api.sessions.update);

  // Session management logic
  const saveSession = useCallback(async () => {
    await updateSession({
      sessionId,
      lastActive: Date.now(),
      // Other session data
    });
  }, [sessionId, updateSession]);

  return {
    session,
    saveSession,
    // Other session utilities
  };
};

2. Real-time Synchronization
typescript
CopyInsert
// convex/sessions.ts
export const sync = mutation({
  args: {
    sessionId: v.string(),
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    // Real-time sync logic with Convex
  },
});

AI Integration
1. Message Processing
typescript
CopyInsert
// lib/ai/processMessage.ts
interface AIResponse {
  message: string;
  codeSnippets?: CodeSnippet[];
  suggestions?: Suggestion[];
}

export async function processAIMessage(
  message: string,
  context: SessionContext
): Promise<AIResponse> {
  // AI processing logic
  // Integration with AI service
  // Code analysis and generation
  return {
    message: "Processed response",
    codeSnippets: [],
    suggestions: []
  };
}

2. Code Analysis
typescript
CopyInsert
// lib/ai/codeAnalysis.ts
export async function analyzeCode(
  code: string,
  language: string
): Promise<Analysis> {
  // Code analysis implementation
  // Performance suggestions
  // Best practices checking
  return {
    suggestions: [],
    improvements: [],
    security: []
  };
}

Security Considerations
1. Code Execution
typescript
CopyInsert
// lib/sandbox/executor.ts
export const sandboxedEval = async (
  code: string,
  language: string
): Promise<string> => {
  // Secure code execution
  // Isolation implementation
  // Resource limitations
};


2. Authentication
typescript
CopyInsert
// middleware.ts
export const config = {
  matcher: ["/playground/:path*"]
};

export default authMiddleware({
  publicRoutes: [],
  ignoredRoutes: [],
  // Clerk configuration
});

Performance Optimizations
1. Code Splitting
typescript
CopyInsert
// app/(platform)/playground/page.tsx
const CodeEditor = dynamic(() => import('@/components/editor/code-editor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
});

2. Caching
typescript
CopyInsert
// hooks/useCodeCache.ts
export const useCodeCache = (sessionId: string) => {
  const cache = useQuery(api.cache.get, { sessionId });
  
  // Implementation of caching logic
  // Local storage integration
  // Cache invalidation
};

Error Handling
1. Global Error Boundary
typescript
CopyInsert
// app/(platform)/playground/error.tsx
export default function PlaygroundError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Error handling implementation
  // User feedback
  // Recovery options
}


Usage Examples
1. Basic Interaction
typescript
CopyInsert
// Example of chat interaction
const chatExample = {
  user: "Help me optimize this function",
  assistant: {
    message: "Here's an optimized version...",
    codeSnippet: "// Optimized code..."
  }
};

2. Advanced Features
typescript
CopyInsert
// Example of advanced feature usage
const advancedExample = {
  codeAnalysis: true,
  realTimeSync: true,
  collaborativeEditing: false
};