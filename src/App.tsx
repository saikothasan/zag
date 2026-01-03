import { useChat } from "ai/react";
import { useState } from "react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { PromptInput, PromptInputAttachments, PromptInputTextarea, PromptInputButton } from "@/components/ai-elements/prompt-input";
import { Message } from "@/components/ai-elements/message";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { BotIcon, SendIcon, SquarePen, History } from "lucide-react";
import { Button } from "@/components/ui/button";

function App() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, setMessages } = useChat({
    api: "/api/chat",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <ResizablePanelGroup direction="horizontal">
        
        {/* Sidebar Panel */}
        <ResizablePanel 
          defaultSize={20} 
          minSize={15} 
          maxSize={30} 
          collapsible={true}
          className="bg-muted/30 border-r hidden md:flex flex-col"
        >
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
            <Button variant="ghost" className="w-full justify-start gap-2 px-2" onClick={() => setMessages([])}>
              <SquarePen className="h-4 w-4" />
              <span>New Chat</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">History</h3>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
               <History className="h-4 w-4 opacity-70"/> 
               <span className="truncate">Current Session</span>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Chat Panel */}
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full relative">
            
            {/* Header */}
            <header className="flex h-14 items-center border-b px-4 lg:h-[60px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
              <div className="flex items-center gap-2 font-semibold">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BotIcon className="h-5 w-5 text-primary" />
                </div>
                <span>Zag Agent</span>
              </div>
            </header>

            {/* Conversation Area */}
            <div className="flex-1 overflow-hidden relative">
              <Conversation className="flex w-full flex-col h-full">
                <ConversationContent className="flex-1 space-y-6 p-4 md:p-10 max-w-4xl mx-auto w-full">
                  {messages.length === 0 ? (
                    <ConversationEmptyState 
                      title="How can I help you today?" 
                      description="I can help you analyze code, write content, or plan your next project."
                      icon={<BotIcon className="h-10 w-10 text-muted-foreground/50" />}
                    />
                  ) : (
                    messages.map((message) => (
                      <Message
                        key={message.id}
                        role={message.role as "user" | "assistant"}
                        content={message.content}
                        className={message.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}
                      />
                    ))
                  )}
                </ConversationContent>
                <ConversationScrollButton className="bottom-20 right-8" />
              </Conversation>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
              <div className="mx-auto max-w-3xl w-full">
                <PromptInput
                  onSubmit={async ({ text }) => {
                    const e = { preventDefault: () => {} } as any;
                    handleSubmit(e, { body: { messages: [...messages, { role: 'user', content: text }] } });
                  }}
                  isLoading={isLoading}
                  className="rounded-2xl border shadow-sm bg-muted/30 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-all"
                >
                  <PromptInputTextarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Message Zag AI..."
                    className="min-h-[50px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent py-4"
                  />
                  <div className="flex items-center justify-between p-2 pl-4">
                    <PromptInputAttachments />
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <PromptInputButton onClick={stop} className="bg-muted hover:bg-muted/80 text-foreground">
                          Stop
                        </PromptInputButton>
                      ) : (
                        <PromptInputButton type="submit" disabled={!input.trim()} className="rounded-full h-8 w-8 p-0">
                          <SendIcon className="size-4" />
                        </PromptInputButton>
                      )}
                    </div>
                  </div>
                </PromptInput>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  AI can make mistakes. Please check important information.
                </p>
              </div>
            </div>

          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
