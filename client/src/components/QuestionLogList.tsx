import { useState } from 'react'
import { Flag, ChevronDown, ChevronUp } from 'lucide-react'
import { reportIssue } from '../lib/api'
import type { QuestionLogEntry } from '../store'

interface Props {
  questions: QuestionLogEntry[]
}

export function QuestionLogList({ questions }: Props) {
  const sorted = [...questions].sort(
    (a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <p className="py-12 text-center font-serif text-base text-ink/50 italic">
        Your child hasn't asked Dadi anything yet — but they will.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((q) => (
        <QuestionItem key={q.id} entry={q} />
      ))}
    </div>
  )
}

function QuestionItem({ entry }: { entry: QuestionLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [flagged, setFlagged] = useState(false)

  const handleFlag = async () => {
    await reportIssue(entry.id, 'inappropriate-content')
    setFlagged(true)
  }

  const date = new Date(entry.askedAt)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  return (
    <div className="rounded-lg border border-ink/10 bg-cream p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="flex-1">
          <p className="font-sans text-sm font-medium text-ink">{entry.questionText}</p>
          <p className="mt-0.5 font-sans text-xs text-ink/40">{dateStr}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-ink/40" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink/40" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 border-t border-ink/5 pt-3">
          <p className="font-serif text-sm leading-relaxed text-ink/80">
            <span className="font-semibold text-monsoon">Dadi:</span> {entry.dadiResponseText}
          </p>
          <div className="mt-2 flex justify-end">
            {flagged ? (
              <span className="font-sans text-xs text-terracotta">Reported — thank you</span>
            ) : (
              <button
                onClick={handleFlag}
                className="flex items-center gap-1 font-sans text-xs text-ink/40 hover:text-terracotta"
              >
                <Flag className="h-3 w-3" />
                Report this response
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
