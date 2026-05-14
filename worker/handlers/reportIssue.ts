export async function handleReportIssue(request: Request): Promise<Response> {
  const body = await request.json() as {
    questionLogId: string
    reason: string
    comment?: string
  }

  console.log('[safety-flag]', JSON.stringify({
    questionLogId: body.questionLogId,
    reason: body.reason,
    comment: body.comment,
    reportedAt: new Date().toISOString(),
  }))

  return new Response(null, { status: 204 })
}
