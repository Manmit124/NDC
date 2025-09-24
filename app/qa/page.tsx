"use client";

import { QALayout } from '@/components/QA/QALayout'
import { QuestionsList } from '@/components/QA/QuestionsList'

export default function QAPage() {
  return (
    <QALayout>
      <QuestionsList />
    </QALayout>
  );
}
