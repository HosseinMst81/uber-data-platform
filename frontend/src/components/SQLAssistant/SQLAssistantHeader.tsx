import { Brain, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";

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
      <Badge
        variant="outline"
        className="gap-2 px-4 py-2 text-sm border-primary/20 bg-primary/5"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">Powered by OpenRouter AI</span>
      </Badge>
    </div>
  );
};

export default SQLAssistantHeader;
