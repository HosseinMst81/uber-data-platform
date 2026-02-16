import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

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
          <p>✓ Be specific in your questions</p>
          <p>✓ Mention exact column names when possible</p>
          <p>✓ Use "top N" for limiting results</p>
          <p>✓ Ask about averages, totals, or counts</p>
        </div>
      </CardContent>
    </Card>
  );
};
export default TipsCard;
