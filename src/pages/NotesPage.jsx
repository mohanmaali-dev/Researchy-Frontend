import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiFileText, FiPlus, FiSearch } from 'react-icons/fi'
import { PiPushPinFill } from 'react-icons/pi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import NoteEditor from '../components/notes/NoteEditor.jsx'
import AccountMenu from '../components/ui/AccountMenu.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import GlobalSearchButton from '../components/ui/GlobalSearchButton.jsx'
import * as noteService from '../services/note.service.js'
import { requestNavigation } from '../utils/navigationGuard.js'

const EMPTY_PAGINATION = { page: 1, totalPages: 1, totalItems: 0, hasPreviousPage: false, hasNextPage: false }

const shortDate = (value) => {
  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric' })
}

const excerpt = (content) => content?.replace(/\s+/g, ' ').trim() || 'No content added yet.'

function NoteListSkeleton() {
  return (
    <div role="status" aria-label="Loading notes" className="divide-y divide-[#efedeb]">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="animate-pulse px-4 py-4 motion-reduce:animate-none sm:px-5">
          <div className="h-4 rounded bg-[#e6e4e1]" style={{ width: `${48 + item * 7}%` }} />
          <div className="mt-2 h-3 w-full rounded bg-[#efeeec]" />
          <div className="mt-2 h-3 w-2/3 rounded bg-[#efeeec]" />
        </div>
      ))}
    </div>
  )
}

function NotesPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const creating = location.pathname === '/notes/new'
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Active')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(EMPTY_PAGINATION)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingNote, setLoadingNote] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [editorError, setEditorError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadNotes = useCallback(async () => {
    setLoadingList(true)
    setListError('')
    try {
      const result = await noteService.getNotes({ search, status, page, limit: 30 })
      setNotes(result.data)
      setPagination(result.pagination || EMPTY_PAGINATION)
    } catch (requestError) {
      setListError(requestError.message)
    } finally {
      setLoadingList(false)
    }
  }, [page, search, status])

  useEffect(() => { loadNotes() }, [loadNotes])

  useEffect(() => {
    let active = true
    setEditorError('')
    if (!id || creating) {
      setSelectedNote(null)
      setLoadingNote(false)
      return () => { active = false }
    }

    setLoadingNote(true)
    noteService.getNoteById(id)
      .then((result) => { if (active) setSelectedNote(result.data) })
      .catch((requestError) => { if (active) setEditorError(requestError.message) })
      .finally(() => { if (active) setLoadingNote(false) })
    return () => { active = false }
  }, [creating, id])

  const changeStatus = (nextStatus) => {
    requestNavigation(() => {
      setStatus(nextStatus)
      setPage(1)
      navigate('/notes')
    })
  }

  const saveNote = async (values) => {
    setSaving(true)
    setEditorError('')
    try {
      const result = creating
        ? await noteService.createNote(values)
        : await noteService.updateNote(id, values)
      setSelectedNote(result.data)
      await loadNotes()
      if (creating) navigate(`/notes/${result.data._id}`, { replace: true })
      return true
    } catch (requestError) {
      setEditorError(requestError.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const togglePin = async () => {
    if (!selectedNote) return
    setActionLoading(true)
    setEditorError('')
    try {
      const result = await noteService.updateNote(selectedNote._id, { isPinned: !selectedNote.isPinned })
      setSelectedNote((current) => ({
        ...result.data,
        title: current.title,
        content: current.content,
        tags: current.tags,
      }))
      await loadNotes()
    } catch (requestError) {
      setEditorError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleArchive = async () => {
    if (!selectedNote) return
    setActionLoading(true)
    setEditorError('')
    try {
      await noteService.updateNote(selectedNote._id, { isArchived: !selectedNote.isArchived })
      navigate('/notes', { replace: true })
      setSelectedNote(null)
      await loadNotes()
    } catch (requestError) {
      setEditorError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const deleteNote = async () => {
    if (!selectedNote) return
    setActionLoading(true)
    setEditorError('')
    try {
      await noteService.deleteNote(selectedNote._id)
      setConfirmDelete(false)
      setSelectedNote(null)
      navigate('/notes', { replace: true })
      await loadNotes()
    } catch (requestError) {
      setEditorError(requestError.message)
      setConfirmDelete(false)
    } finally {
      setActionLoading(false)
    }
  }

  const showEditor = creating || Boolean(id)

  return (
    <div className="min-h-screen bg-[#f2f2f1] p-2.5 text-[#242424] sm:p-4">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="relative z-30 flex h-18 items-center rounded-[10px] bg-white px-4 sm:px-5">
        <Link to="/home" className="flex shrink-0 items-center gap-2.5 lg:w-64" aria-label="3V home">
          <img src="/favicon.svg" alt="" className="size-10 shrink-0 rounded-md" aria-hidden="true" />
          <span><span className="block text-sm font-semibold leading-4 tracking-tight text-[#292929]">3V Workspace</span><span className="block text-[9px] uppercase tracking-[0.12em] text-[#999]">Veni · Vidi · Vici</span></span>
        </Link>
        <div className="ml-auto flex items-center gap-2"><GlobalSearchButton /><AccountMenu /></div>
      </header>

      <main id="main-content" tabIndex="-1" className="mt-3 grid min-h-[calc(100dvh-6.75rem)] gap-3 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className={`${showEditor ? 'hidden' : 'flex'} min-h-[calc(100dvh-6.75rem)] flex-col overflow-hidden rounded-[10px] bg-white lg:flex lg:max-h-[calc(100dvh-6.75rem)]`} aria-label="Notes list">
          <div className="border-b border-[#ece9e5] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-medium uppercase tracking-wider text-[#888]">Personal workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Notes</h1></div>
              <Link to="/notes/new" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus aria-hidden="true" /> New</Link>
            </div>
            <label className="relative mt-4 block">
              <span className="sr-only">Search notes</span>
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" aria-hidden="true" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="global-search-input h-10 w-full rounded-md border border-[#e1dfdc] bg-[#f7f7f7] pl-9 pr-3 text-sm outline-none transition placeholder:text-[#999] focus:border-[#cbc7c2] focus:bg-white" placeholder="Search notes" />
            </label>
            <div className="mt-3 grid grid-cols-2 rounded-md bg-[#f2f2f1] p-1" role="group" aria-label="Note status">
              {['Active', 'Archived'].map((item) => <button key={item} type="button" onClick={() => changeStatus(item)} aria-pressed={status === item} className={`min-h-9 rounded px-3 py-1.5 text-xs font-medium transition ${status === item ? 'bg-white text-[#333] shadow-sm' : 'text-[#777] hover:text-[#333]'}`}>{item}</button>)}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList ? <NoteListSkeleton /> : listError ? (
              <div role="alert" className="m-4 rounded-md bg-red-50 p-4 text-sm text-red-600"><p>{listError}</p><button type="button" onClick={loadNotes} className="mt-3 font-semibold underline underline-offset-4">Try again</button></div>
            ) : notes.length ? (
              <div className="divide-y divide-[#efedeb]">
                {notes.map((note) => (
                  <Link key={note._id} to={`/notes/${note._id}`} className={`group block px-4 py-4 transition hover:bg-[#faf9f7] sm:px-5 ${id === note._id ? 'bg-[#fff5f2]' : ''}`}>
                    <div className="flex items-start gap-2"><h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-[#2b2b2b]">{note.title}</h2>{note.isPinned && <PiPushPinFill className="mt-0.5 shrink-0 text-amber-600" aria-label="Pinned" />}</div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#777]">{excerpt(note.content)}</p>
                    <div className="mt-3 flex items-center justify-between gap-3"><div className="flex min-w-0 gap-1 overflow-hidden">{note.tags?.slice(0, 2).map((tag) => <span key={tag} className="truncate rounded bg-[#f2f2f1] px-1.5 py-0.5 text-[10px] text-[#777]">{tag}</span>)}</div><span className="shrink-0 text-[10px] text-[#aaa]">{shortDate(note.updatedAt)}</span></div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center"><FiFileText className="mx-auto text-2xl text-[#aaa]" aria-hidden="true" /><h2 className="mt-3 text-sm font-semibold">{search ? 'No matching notes' : status === 'Archived' ? 'No archived notes' : 'No notes yet'}</h2><p className="mt-1 text-xs leading-5 text-[#888]">{search ? 'Try another search.' : status === 'Archived' ? 'Archived notes will appear here.' : 'Create a note for anything worth remembering.'}</p>{!search && status === 'Active' && <Link to="/notes/new" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2.5 text-xs font-semibold text-white"><FiPlus aria-hidden="true" /> Create first note</Link>}</div>
            )}
          </div>

          {pagination.totalPages > 1 && <nav className="flex items-center justify-between border-t border-[#ece9e5] px-4 py-3" aria-label="Notes pages"><button type="button" onClick={() => setPage((value) => value - 1)} disabled={!pagination.hasPreviousPage} className="grid size-9 place-items-center rounded-md text-[#666] hover:bg-[#f2f2f1] disabled:opacity-30" aria-label="Previous notes page"><FiChevronLeft aria-hidden="true" /></button><span className="text-[11px] text-[#888]">{pagination.page} / {pagination.totalPages}</span><button type="button" onClick={() => setPage((value) => value + 1)} disabled={!pagination.hasNextPage} className="grid size-9 place-items-center rounded-md text-[#666] hover:bg-[#f2f2f1] disabled:opacity-30" aria-label="Next notes page"><FiChevronRight aria-hidden="true" /></button></nav>}
        </aside>

        <section className={`${showEditor ? 'flex' : 'hidden'} min-h-[calc(100dvh-6.75rem)] min-w-0 flex-col overflow-hidden rounded-[10px] bg-white lg:flex lg:max-h-[calc(100dvh-6.75rem)]`} aria-label="Note editor">
          {showEditor && <div className="border-b border-[#ece9e5] px-3 py-2 lg:hidden"><Link to="/notes" className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-[#666] hover:bg-[#f2f2f1]"><FiChevronLeft aria-hidden="true" /> All notes</Link></div>}
          {loadingNote ? (
            <div role="status" className="animate-pulse p-6 motion-reduce:animate-none sm:p-10"><div className="h-8 w-2/3 rounded bg-[#e8e6e3]" /><div className="mt-5 h-10 w-1/2 rounded bg-[#efeeec]" /><div className="mt-8 space-y-3">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-3 rounded bg-[#efeeec]" style={{ width: `${92 - item * 5}%` }} />)}</div></div>
          ) : editorError && !selectedNote && !creating ? (
            <div role="alert" className="m-auto max-w-md p-8 text-center"><FiFileText className="mx-auto text-2xl text-[#aaa]" /><h2 className="mt-3 text-lg font-semibold">Unable to open this note</h2><p className="mt-2 text-sm text-red-600">{editorError}</p><Link to="/notes" className="mt-5 inline-flex rounded-md bg-[#f2f2f1] px-4 py-2.5 text-sm font-semibold">Back to notes</Link></div>
          ) : creating || selectedNote ? (
            <NoteEditor key={creating ? 'new' : selectedNote._id} note={selectedNote} creating={creating} saving={saving} actionLoading={actionLoading} serverError={editorError} onSave={saveNote} onPin={togglePin} onArchive={toggleArchive} onDelete={() => setConfirmDelete(true)} />
          ) : (
            <div className="m-auto max-w-md px-6 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#fff0ec] text-xl text-primary-dark"><FiFileText aria-hidden="true" /></span><h2 className="mt-4 text-xl font-semibold">Keep anything worth remembering</h2><p className="mt-2 text-sm leading-6 text-[#777]">Choose a note from the left, or create a clean page for an idea, list, decision, meeting, or reference.</p><Link to="/notes/new" className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus aria-hidden="true" /> New note</Link></div>
          )}
        </section>
      </main>

      <ConfirmModal open={confirmDelete} title="Delete note permanently?" message={selectedNote ? `“${selectedNote.title}” will be permanently deleted. This cannot be undone.` : ''} confirmLabel="Delete note" loading={actionLoading} onConfirm={deleteNote} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}

export default NotesPage
