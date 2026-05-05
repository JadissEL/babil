type CommentItem = {
  id: string | number
  author?: string
  content: string
  createdAt?: string
}

export default function CommentList({ comments }: { comments: CommentItem[] }) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article key={comment.id} className="rounded-xl border border-white/10 bg-[#111827] p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{comment.author || 'User'}</p>
            {comment.createdAt && <p className="text-[10px] font-bold text-slate-500">{comment.createdAt}</p>}
          </div>
          <p className="text-sm font-medium text-slate-200">{comment.content}</p>
        </article>
      ))}
    </div>
  )
}

