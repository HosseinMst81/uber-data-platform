import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'sql-formatter';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface SQLMessageBlockProps {
  sql: string;
}

export const SQLMessageBlock: React.FC<SQLMessageBlockProps> = ({ sql }) => {
  const [copied, setCopied] = useState(false);

  const formattedSQL = format(sql, {
    language: 'postgresql',
    tabWidth: 2,
    keywordCase: 'upper',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <SyntaxHighlighter
        language="sql"
        style={oneLight} 
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          maxWidth: '100%',
          overflowX: 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
        }}
      >
        {formattedSQL}
      </SyntaxHighlighter>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 text-white"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};