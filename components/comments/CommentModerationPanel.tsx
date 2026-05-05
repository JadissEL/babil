type ModerationItem = { id: string | number; content: string; author?: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }

export default function CommentModerationPanel({
  comments,
  onApprove,
  onReject,
}: {
  comments: ModerationItem[]
  onApprove: (id: string | number) => void
  onReject: (id: string | number) => void
}) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-white/10 bg-[#111827] p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{comment.author || 'User'}</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{comment.status}</span>
          </div>
          <p className="mb-3 text-sm text-slate-200">{comment.content}</p>
          <div className="flex gap-2">
            <button onClick={() => onApprove(comment.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
              Approve
            </button>
            <button onClick={() => onReject(comment.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

