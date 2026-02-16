import { ScrollArea } from "../ui/scroll-area"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Props = {
  sql: string
  maxHeight?: string
  compact?: boolean
}

export function SQLQueryDisplay({ sql, maxHeight = '300px', compact = false }: Props) {
  return (
    <ScrollArea className="rounded-md border" style={{ maxHeight }}>
      <SyntaxHighlighter
        language="sql"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: compact ? '0.75rem' : '1rem',
          fontSize: compact ? '0.75rem' : '0.875rem',
          background: 'hsl(var(--muted))',
        }}
        showLineNumbers={!compact}
      >
        {sql}
      </SyntaxHighlighter>
    </ScrollArea>
  )
}