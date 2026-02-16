import { Check, Copy } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { ExampleQuestions } from "./ExampleQuestions";
import SchemaInfo from "./SchemaInfo";
import { SQLQueryDisplay } from "./SQLQueryDisplay";
import TipsCard from "./TipsCard";
import { Button } from "../ui/button";

const GeneratedSQL = ({
  currentSQL,
  copied,
  onExampleClick,
  onCopy,
}: {
  currentSQL: string | null;
  copied: boolean;
  onExampleClick: (exampleQuestion:string) => void;
  onCopy: () => void;
}) => {
  return (
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
              onClick={onCopy}
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
      {/* Example Questions */}
      <ExampleQuestions onExampleClick={onExampleClick} />

      {/* Tips Card */}
      <TipsCard />

      {/* Schema Info */}
      <SchemaInfo />
    </div>
  );
};

export default GeneratedSQL;
