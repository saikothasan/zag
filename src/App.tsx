import { useChat } from "@ai-sdk/react";
import { BotIcon, SendIcon, SquarePen, UserIcon } from "lucide-react";
import { useState } from "react";

// AI Elements Imports
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputTextarea,
  PromptInputAttachment
} from "@/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions
} from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput
} from "@/components/ai-elements/tool";

// UI Imports
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function App() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, append, setMessages } = useChat({
    api: "/api/chat",
  });

  const [files, setFiles] = useState<FileList | null>(null);

  const suggestedActions = [
    "What is Cloudflare Workers?",
    "Write a poem about coding",
    "Check the weather in Tokyo",
    "Explain Quantum Computing"
  ];

  const handleSuggestionClick = (text: string) => {
    append({ role: "user", content: text });
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BotIcon className="h-5 w-5 text-primary" />
          </div>
          <span>Zag Agent</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMessages([])} title="New Chat">
          <SquarePen className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Conversation Area */}
      <div className="flex-1 overflow-hidden relative">
        <Conversation className="flex w-full flex-col h-full">
          <ConversationContent className="flex-1 space-y-6 p-4 md:p-10 max-w-3xl mx-auto w-full">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full space-y-8 mt-10">
                 <ConversationEmptyState 
                  title="Hello, I'm Zag." 
                  description="I am an advanced AI agent built with Cloudflare. How can I assist you today?"
                  icon={<div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center"><BotIcon className="h-10 w-10 text-muted-foreground" /></div>}
                />
                <Suggestions className="justify-center">
                  {suggestedActions.map((action) => (
                    <Suggestion 
                      key={action} 
                      suggestion={action} 
                      onClick={handleSuggestionClick} 
                      className="bg-muted/50 hover:bg-muted"
                    />
                  ))}
                </Suggestions>
              </div>
            )}

            {/* Message List */}
            {messages.map((message) => (
              <Message
                key={message.id}
                from={message.role === "user" ? "user" : "assistant"}
                className={message.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}
              >
                <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}>
                  
                  {/* Text Content */}
                  {message.content && (
                    <MessageResponse>
                        {message.content}
                    </MessageResponse>
                  )}

                  {/* Attachments (Images/Files) */}
                  {message.experimental_attachments && (
                    <MessageAttachments>
                      {message.experimental_attachments.map((attachment, index) => (
                        <MessageAttachment key={index} data={attachment} />
                      ))}
                    </MessageAttachments>
                  )}

                  {/* Tool Invocations (The "Thinking" State) */}
                  {message.toolInvocations?.map((toolInvocation) => (
                    <Tool key={toolInvocation.toolCallId} state={toolInvocation.state}>
                      <ToolHeader 
                        type="tool"
                        title={toolInvocation.toolName}
                        state={toolInvocation.state}
                      />
                      <ToolContent>
                        <ToolInput input={toolInvocation.args} />
                        {'result' in toolInvocation && (
                           <ToolOutput 
                             output={toolInvocation.result} 
                             errorText={'error' in toolInvocation ? "Error executing tool" : undefined}
                           />
                        )}
                      </ToolContent>
                    </Tool>
                  ))}

                </MessageContent>
                
                {/* Message Actions (Copy/Retry) */}
                {message.role !== 'user' && (
                    <MessageActions>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MessageAction onClick={() => navigator.clipboard.writeText(message.content)}>
                                        Copy
                                    </MessageAction>
                                </TooltipTrigger>
                                <TooltipContent>Copy to clipboard</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </MessageActions>
                )}
              </Message>
            ))}
          </ConversationContent>
          
          <ConversationScrollButton className="bottom-24 right-8" />
        </Conversation>
      </div>

      {/* Input Area */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-3xl w-full">
          <PromptInput
            onSubmit={async ({ text, files }) => {
                // Manually construct the message payload for the SDK
                const messagePayload = { 
                    role: 'user' as const, 
                    content: text,
                    experimental_attachments: files 
                };
                // We mock an event here because handleSubmit expects one, 
                // but we can also use append() directly for more control.
                append(messagePayload);
            }}
            isLoading={isLoading}
            className="rounded-xl border shadow-md bg-muted/20 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-all"
          >
            <PromptInputTextarea
              value={input}
              onChange={handleInputChange}
              placeholder="Message Zag AI..."
              className="min-h-[60px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent py-4"
            />
            
            <div className="flex items-center justify-between p-2 pl-4">
              <PromptInputAttachments>
                  {(file) => <PromptInputAttachment key={file.id} data={file} />}
              </PromptInputAttachments>
              
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <PromptInputButton onClick={stop} className="bg-destructive/10 text-destructive hover:bg-destructive/20">
                    Stop
                  </PromptInputButton>
                ) : (
                  <PromptInputButton type="submit" disabled={!input.trim()} className="rounded-full h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90">
                    <SendIcon className="size-4" />
                  </PromptInputButton>
                )}
              </div>
            </div>
          </PromptInput>
          <p className="text-[10px] text-center text-muted-foreground mt-3">
            Zag AI Agent can check weather, write code, and analyze files.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
