export default function CommentBox({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-[#111827] p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your experience..."
        className="min-h-24 w-full rounded-xl border border-white/10 bg-[#0B0F19] p-3 text-sm text-slate-200 outline-none focus:border-blue-500/40"
      />
      <div className="flex justify-end">
        <button
          disabled={disabled}
          onClick={onSubmit}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

