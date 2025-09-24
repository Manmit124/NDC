'use client'

import { useParams } from 'next/navigation'
import { QALayout } from '@/components/QA/QALayout'
import { QuestionDetail } from '@/components/QA/QuestionDetail'

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.id as string

  return (
    <QALayout>
      <QuestionDetail questionId={questionId} />
    </QALayout>
  )
}
