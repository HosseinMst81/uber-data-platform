import { useMutation } from '@tanstack/react-query'
import { sqlAssistantApi } from '@/lib/api'

export function useGenerateSQL() {
  return useMutation({
    mutationFn: (question: string) => sqlAssistantApi.generateSQL(question),
  })
}