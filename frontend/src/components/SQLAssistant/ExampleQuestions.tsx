import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb } from 'lucide-react'

type Props = {
  onExampleClick: (question: string) => void
}

const EXAMPLE_QUESTIONS = [
  'Show me the top 10 highest revenue trips',
  'What is the average rating by vehicle type?',
  'How many trips were cancelled by each reason?',
  'Show completed trips with revenue above $50',
  'What are the peak hours for rides?',
  'Compare total trips by payment method',
  'Show average distance by vehicle type',
  'List trips on weekends with high ratings',
]

export function ExampleQuestions({ onExampleClick }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Example Questions
        </CardTitle>
        <CardDescription>pick up one of this questions:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {EXAMPLE_QUESTIONS.map((question, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-accent"
              onClick={() => onExampleClick(question)}
            >
              <span className="text-xs">{question}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}