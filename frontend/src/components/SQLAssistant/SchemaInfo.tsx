import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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

export default SchemaInfo;
