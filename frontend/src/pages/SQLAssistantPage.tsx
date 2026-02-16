/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import GeneratedSQL from "@/components/SQLAssistant/GeneratedSQL";
import SQLAssistantHeader from "@/components/SQLAssistant/SQLAssistantHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateSQL } from "@/hooks/use-sql-assitance";
import {
  AlertCircle,
  Database,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { SQLMessageBlock } from "@/components/SQLAssistant/SQLMessageBlock"; // مسیر را مطابق پروژه خود تنظیم کنید
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  type: "user" | "assistant";
  content: string;
  sql?: string;
  timestamp: Date;
};

export function SQLAssistantPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSQL, setCurrentSQL] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateMutation = useGenerateSQL();

  // اسکرول خودکار به پایین
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      const response = await generateMutation.mutateAsync(question);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: "Here's the SQL query for your question:",
        sql: response.sql,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentSQL(response.sql);
    } catch (error: any) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content:
          error.response?.data?.message ||
          "Failed to generate SQL query. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
  };

  const handleCopySQL = () => {
    if (currentSQL) {
      navigator.clipboard.writeText(currentSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="space-y-6">
        <SQLAssistantHeader />
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat with Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your trip data in plain English
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages container - custom scroll */}
                <div
                  ref={containerRef}
                  className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4 min-h-0"
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center space-y-2">
                        <Database className="h-12 w-12 mx-auto opacity-20" />
                        <p>No messages yet. Start by asking a question!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.type === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            `rounded-2xl p-4 shadow-md ${message.type === "assistant" && "w-full"}`,
                            message.type === "user"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none "
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                          {message.sql && (
                            <div className="mt-3">
                              <SQLMessageBlock sql={message.sql} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Textarea
                    placeholder="e.g., Show me the top 10 customers by total spending..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {question.length}/500 characters
                    </span>
                    <Button
                      type="submit"
                      disabled={!question.trim() || generateMutation.isPending}
                      className="gap-2"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Ask Question
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Error Display */}
                {generateMutation.isError && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(generateMutation.error as any)?.response?.data
                        ?.message ||
                        "Failed to generate SQL. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <GeneratedSQL
            copied={copied}
            currentSQL={currentSQL}
            onCopy={handleCopySQL}
            onExampleClick={handleExampleClick}
          />
        </div>
      </div>
    </div>
  );
}