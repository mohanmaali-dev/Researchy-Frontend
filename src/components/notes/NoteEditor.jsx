import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiArchive, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { PiPushPin, PiPushPinFill } from 'react-icons/pi'
import { z } from 'zod'

import { useFormDraft } from '../../hooks/useFormDraft.js'
import { requestNavigation } from '../../utils/navigationGuard.js'
import DraftStatus from '../ui/DraftStatus.jsx'
import { FieldError, ServerError } from '../ui/FormElements.jsx'

const noteSchema = z.object({
  title: z.string().trim().min(1, 'Add a title so you can find this note later').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().max(50000, 'Note cannot exceed 50,000 characters'),
  tags: z.array(z.string().max(40)).max(20),
})

function NoteTagsInput({ value = [], onChange }) {
  const [input, setInput] = useState('')

  const addTags = () => {
    if (!input.trim()) return
    const unique = new Map(value.map((tag) => [tag.toLocaleLowerCase(), tag]))
    input.split(',').forEach((tag) => {
      const cleaned = tag.trim().replace(/\s+/g, ' ')
      if (cleaned && cleaned.length <= 40 && !unique.has(cleaned.toLocaleLowerCase())) {
        unique.set(cleaned.toLocaleLowerCase(), cleaned)
      }
    })
    onChange([...unique.values()].slice(0, 20))
    setInput('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTags()
    } else if (event.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md bg-[#f7f7f6] px-2.5 py-2 transition focus-within:bg-[#f2f2f1]">
      {value.map((tag) => (
        <span key={tag.toLocaleLowerCase()} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-[#666] shadow-sm">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((item) => item !== tag))} className="grid size-5 place-items-center rounded text-[#999] hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${tag} tag`}><FiX aria-hidden="true" /></button>
        </span>
      ))}
      <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} onBlur={addTags} disabled={value.length >= 20} className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm font-normal text-[#333] outline-none placeholder:text-[#999] disabled:cursor-not-allowed" placeholder={value.length ? 'Add another tag' : 'Add tags'} aria-label="Note tags" />
    </div>
  )
}

function NoteEditor({ note, creating, saving, actionLoading, serverError, onSave, onPin, onArchive, onDelete }) {
  const initialValues = useMemo(() => ({
    title: note?.title || '',
    content: note?.content || '',
    tags: note?.tags || [],
  }), [note?.content, note?.tags, note?.title])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(noteSchema), defaultValues: initialValues })

  useEffect(() => reset(initialValues), [initialValues, reset])
  const draft = useFormDraft({ watch, reset, initialValues })
  const content = watch('content') || ''

  return (
    <form onSubmit={handleSubmit(draft.submitWithDraft(onSave))} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#ece9e5] px-4 py-3 sm:px-6">
        <DraftStatus {...draft} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[#888]">{creating ? 'New note' : `Updated ${new Date(note.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`}</p>
          <div className="flex items-center gap-1.5">
            {!creating && (
              <>
                <button type="button" onClick={onPin} disabled={actionLoading} className={`grid size-10 place-items-center rounded-md transition disabled:opacity-50 ${note.isPinned ? 'bg-amber-50 text-amber-700' : 'text-[#777] hover:bg-[#f2f2f1]'}`} aria-label={note.isPinned ? 'Unpin note' : 'Pin note'} aria-pressed={note.isPinned}>{note.isPinned ? <PiPushPinFill aria-hidden="true" /> : <PiPushPin aria-hidden="true" />}</button>
                <button type="button" onClick={() => requestNavigation(onArchive)} disabled={actionLoading} className="grid size-10 place-items-center rounded-md text-[#777] transition hover:bg-[#edf3f9] hover:text-[#315f91] disabled:opacity-50" aria-label={note.isArchived ? 'Restore note' : 'Archive note'}><FiArchive aria-hidden="true" /></button>
                <button type="button" onClick={() => requestNavigation(onDelete)} disabled={actionLoading} className="grid size-10 place-items-center rounded-md text-[#999] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="Delete note"><FiTrash2 aria-hidden="true" /></button>
              </>
            )}
            <button type="submit" disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiSave aria-hidden="true" /> {saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <label htmlFor="note-editor-title" className="sr-only">Note title</label>
          <input id="note-editor-title" {...register('title')} autoFocus className="global-search-input w-full border-0 bg-transparent px-0 text-3xl font-semibold tracking-[-0.035em] text-[#242424] outline-none placeholder:text-[#bbb] sm:text-4xl" placeholder="Untitled note" />
          <FieldError message={errors.title?.message} />

          <div className="mt-5">
            <Controller name="tags" control={control} render={({ field }) => <NoteTagsInput value={field.value} onChange={field.onChange} />} />
            <FieldError message={errors.tags?.message} />
          </div>

          <label htmlFor="note-editor-content" className="sr-only">Note content</label>
          <textarea id="note-editor-content" {...register('content')} rows="18" className="global-search-input mt-6 min-h-[52dvh] w-full resize-none border-0 bg-transparent px-0 text-[15px] leading-7 text-[#3f3f3f] outline-none placeholder:text-[#aaa] sm:text-base sm:leading-8" placeholder="Start writing anything you want to remember..." />
          <FieldError message={errors.content?.message} />
          <div className="mt-5 flex items-center justify-between border-t border-[#efedeb] pt-3 text-[11px] text-[#aaa]">
            <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
            <span>{content.length.toLocaleString()} characters</span>
          </div>
          <div className="mt-4"><ServerError message={serverError} /></div>
        </div>
      </div>
    </form>
  )
}

export default NoteEditor
