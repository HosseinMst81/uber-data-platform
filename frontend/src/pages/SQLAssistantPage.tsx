/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Send,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Database,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useGenerateSQL } from "@/hooks/use-sql-assitance";
import { SQLQueryDisplay } from "@/components/SQLAssistant/SQLQueryDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExampleQuestions } from "@/components/SQLAssistant/ExampleQuestions";

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

  const generateMutation = useGenerateSQL();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      const response = await generateMutation.mutateAsync(question);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Here's the SQL query for your question:",
        sql: response.sql,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentSQL(response.sql);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
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
        {/* Header */}
        <SQLAssistantHeader />
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat with Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your trip data in plain English
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-[500px] pr-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center space-y-2">
                        <Database className="h-12 w-12 mx-auto opacity-20" />
                        <p>No messages yet. Start by asking a question!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              message.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.sql && (
                              <div className="mt-3">
                                <SQLQueryDisplay sql={message.sql} compact />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

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
                  <Alert variant="destructive">
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
          <div className="space-y-4">
            {/* Current SQL Query */}
            {currentSQL && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generated SQL</CardTitle>
                  <CardDescription>
                    Copy this query to use in your database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SQLQueryDisplay sql={currentSQL} maxHeight="250px" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySQL}
                    className="w-full gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy SQL Query
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
            {/* Tips Card */}
            <TipsCard />

            {/* Example Questions */}
            <ExampleQuestions onExampleClick={handleExampleClick} />

            {/* Schema Info */}
            <SchemaInfo />
          </div>
        </div>
      </div>
    </div>
  );
}

const SQLAssistantHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          SQL Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask questions in natural language and get SQL queries instantly
        </p>
      </div>
      <Badge variant="secondary" className="gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        Powered by Groq AI
      </Badge>
    </div>
  );
};
const SchemaInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4" />
          Available Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs space-y-2">
          <p className="font-mono font-semibold text-sm">gold.gold_dataset</p>
          <div className="space-y-1 text-muted-foreground">
            <p>• Trip timestamps & dates</p>
            <p>• Customer & booking IDs</p>
            <p>• Vehicle types</p>
            <p>• Booking values & distances</p>
            <p>• Driver & customer ratings</p>
            <p>• Payment methods</p>
            <p>• Cancellation reasons</p>
            <p>• Revenue metrics</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
const TipsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs space-y-2">
          <p>✓  Be specific in your questions</p>
          <p>✓  Mention exact column names when possible</p>
          <p>✓  Use "top N" for limiting results</p>
          <p>✓  Ask about averages, totals, or counts</p>
        </div>
      </CardContent>
    </Card>
  );
};
