
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"; 
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface SQLQueryDisplayProps {
  sql: string;
  maxHeight?: string;
  compact?: boolean;
}

export function SQLQueryDisplay({
  sql,
  maxHeight = "320px",
  compact = false,
}: SQLQueryDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`
      relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm 
      ${compact ? "text-sm" : "text-base"}
    `}
    >

      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-xs text-gray-500 font-medium">query.sql</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          {copied ? (
            <div className="flex items-center gap-1.5 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">Copied</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Copy className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Copy</span>
            </div>
          )}
        </Button>
      </div>


      <div
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50"
        style={{ maxHeight }}
      >
        <SyntaxHighlighter
          language="sql"
          style={oneLight}
          customStyle={{
            margin: 0,
            padding: compact ? "14px 18px" : "18px 22px",
            background: "transparent",
            fontSize: compact ? "0.875rem" : "0.95rem",
            lineHeight: "1.6",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            overflowX: "auto",
            whiteSpace: "pre",
            wordBreak: "break-all",
            wordWrap: "break-word",
          }}
          wrapLongLines={false}
        >
          {sql.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
