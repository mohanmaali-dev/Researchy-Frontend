import { useMemo, useRef, useState } from 'react'
import { FiCheckCircle, FiDatabase, FiDownload, FiFileText, FiRefreshCw, FiUploadCloud, FiX } from 'react-icons/fi'

import BackButton from '../components/ui/BackButton.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import * as backupService from '../services/backup.service.js'

const BACKUP_FORMAT = '3v-workspace-backup'
const MAXIMUM_FILE_SIZE = 5 * 1024 * 1024
const BACKUP_SECTIONS = [
  ['businesses', 'Businesses'],
  ['contacts', 'Contacts'],
  ['conversations', 'Conversations'],
  ['problems', 'Problems'],
  ['opportunities', 'Opportunities'],
  ['followUps', 'Follow-ups'],
  ['learningTopics', 'Learning topics'],
  ['learningEntries', 'Learning entries'],
  ['learningResources', 'Learning resources'],
  ['learningPractices', 'Practice items'],
  ['learningQuestions', 'Learning questions'],
  ['notes', 'Notes'],
]

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'No backup created on this device yet'

const countRecords = (backup) =>
  Object.values(backup?.data || {}).reduce(
    (total, records) => total + (Array.isArray(records) ? records.length : 0),
    0,
  )

function DataSettingsPage() {
  const { user } = useAuth()
  const inputRef = useRef(null)
  const userId = user?._id || user?.id || 'workspace'
  const lastBackupKey = `enter_manage_last_backup_${userId}`
  const [lastBackupAt, setLastBackupAt] = useState(() => {
    try { return window.localStorage.getItem(lastBackupKey) || '' } catch { return '' }
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const recordCount = useMemo(() => countRecords(selectedBackup), [selectedBackup])
  const previewSections = useMemo(
    () => BACKUP_SECTIONS.map(([key, label]) => ({
      key,
      label,
      count: Array.isArray(selectedBackup?.data?.[key]) ? selectedBackup.data[key].length : 0,
    })),
    [selectedBackup],
  )

  const clearSelection = () => {
    setSelectedBackup(null)
    setSelectedFile(null)
    setConfirmRestore(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const download = async () => {
    setDownloading(true)
    setError('')
    setNotice('')
    try {
      const result = await backupService.createBackup()
      const backup = result.data
      const timestamp = backup.createdAt || new Date().toISOString()
      const date = timestamp.slice(0, 10)
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `3v-workspace-backup-${date}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      window.localStorage.setItem(lastBackupKey, timestamp)
      setLastBackupAt(timestamp)
      setNotice('Backup downloaded successfully. Keep the file in a safe place.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not create the backup')
    } finally {
      setDownloading(false)
    }
  }

  const chooseFile = async (event) => {
    const file = event.target.files?.[0]
    setSelectedFile(null)
    setSelectedBackup(null)
    setError('')
    setNotice('')
    if (!file) return
    if (file.size > MAXIMUM_FILE_SIZE) {
      setError('The backup file is larger than 5 MB.')
      event.target.value = ''
      return
    }

    try {
      const backup = JSON.parse(await file.text())
      if (backup?.format !== BACKUP_FORMAT || backup?.version !== 1 || !backup?.data) {
        throw new Error('Choose a valid 3V Workspace backup file.')
      }
      setSelectedFile(file)
      setSelectedBackup(backup)
    } catch (fileError) {
      setError(fileError.message || 'The selected file is not valid JSON.')
      event.target.value = ''
    }
  }

  const restore = async () => {
    setRestoring(true)
    setError('')
    setNotice('')
    try {
      const result = await backupService.restoreBackup(selectedBackup)
      const restoredCount = Object.values(result.data.counts || {}).reduce((sum, count) => sum + count, 0)
      setNotice(`${restoredCount} records restored. Existing records were kept and matching records were updated.`)
      clearSelection()
      setConfirmRestore(false)
    } catch (requestError) {
      setError(requestError.message)
      setConfirmRestore(false)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f2f2f1] p-2.5 pb-24 text-[#242424] sm:p-4">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg bg-white p-5 sm:p-7">
          <BackButton fallback="/home" />
          <div className="mt-5 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#edf3f9] text-[#315f91]"><FiDatabase aria-hidden="true" /></span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#315f91]">Workspace data</p>
              <h1 className="mt-1 text-3xl tracking-[-0.035em] sm:text-4xl">Backup &amp; restore</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777]">Download a copy of your workspace or safely merge a previous backup.</p>
            </div>
          </div>
          {notice && <p className="mt-5 flex items-start gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"><FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" /> {notice}</p>}
          {error && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">{error}</p>}
        </section>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <section className="flex min-h-64 flex-col rounded-lg bg-white p-5 sm:p-6">
            <span className="grid size-10 place-items-center rounded-md bg-[#edf5f0] text-[#2f684f]"><FiDownload aria-hidden="true" /></span>
            <h2 className="mt-5 text-xl font-semibold">Download backup</h2>
            <p className="mt-2 text-sm leading-6 text-[#777]">Includes Business, Contacts, Learning, Follow-ups, Opportunities, Problems, Conversations, and your Notes. Account passwords and login sessions are never included.</p>
            <p className="mt-4 text-xs text-[#999]">Last backup: {formatDate(lastBackupAt)}</p>
            <button type="button" onClick={download} disabled={downloading} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#2f684f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285b45] disabled:opacity-60"><FiDownload aria-hidden="true" /> {downloading ? 'Preparing backup...' : 'Download JSON backup'}</button>
          </section>

          <section className="flex min-h-64 flex-col rounded-lg bg-white p-5 sm:p-6">
            <span className="grid size-10 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiUploadCloud aria-hidden="true" /></span>
            <h2 className="mt-5 text-xl font-semibold">Restore a backup</h2>
            <p className="mt-2 text-sm leading-6 text-[#777]">Choose a backup made by this app. Restore merges records: it does not delete data already in your workspace.</p>
            <label className="mt-5 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d8d5d1] bg-[#faf9f7] px-4 py-2.5 text-sm font-semibold text-[#555] transition hover:border-primary/40 hover:bg-primary-light/40">
              <FiFileText aria-hidden="true" /> Choose backup file
              <input ref={inputRef} type="file" accept=".json,application/json" onChange={chooseFile} className="sr-only" />
            </label>
            {selectedFile && <div className="mt-3 flex items-start gap-3 rounded-md bg-[#f5f5f3] px-3.5 py-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#333]">{selectedFile.name}</p><p className="mt-1 text-xs text-[#777]">{recordCount} records · Created {formatDate(selectedBackup.createdAt)}</p></div><button type="button" onClick={clearSelection} className="grid size-9 shrink-0 place-items-center rounded-md text-[#777] hover:bg-white hover:text-[#333]" aria-label="Remove selected backup"><FiX aria-hidden="true" /></button></div>}
            <button type="button" onClick={() => setConfirmRestore(true)} disabled={!selectedBackup || !recordCount || restoring} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-45"><FiRefreshCw aria-hidden="true" /> Review and restore</button>
          </section>
        </div>

        {selectedBackup && (
          <section className="mt-3 rounded-lg bg-white p-5 sm:p-6" aria-labelledby="backup-preview-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#315f91]">Before you restore</p>
                <h2 id="backup-preview-title" className="mt-1 text-xl font-semibold">Backup preview</h2>
                <p className="mt-1 text-sm leading-6 text-[#777]">Review exactly what is inside this file. Restore will add missing records and update matching records; it will not remove your current data.</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[#333]">{recordCount} total records</p>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-[#e8e5e1] sm:grid-cols-3 lg:grid-cols-4">
              {previewSections.map((section) => (
                <div key={section.key} className="bg-[#faf9f7] px-3.5 py-3">
                  <dt className="truncate text-xs text-[#777]">{section.label}</dt>
                  <dd className={`mt-1 text-lg font-semibold ${section.count ? 'text-[#242424]' : 'text-[#aaa]'}`}>{section.count}</dd>
                </div>
              ))}
            </dl>
            {recordCount === 0 && <p role="alert" className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">This backup contains no records. Choose a different file.</p>}
          </section>
        )}
      </div>

      <ConfirmModal open={confirmRestore} title="Restore this backup?" message={`You reviewed ${recordCount} records. Matching records will be updated and missing records will be added. Your other workspace data will stay unchanged.`} confirmLabel="Restore backup" tone="warning" loading={restoring} loadingLabel="Restoring..." onConfirm={restore} onCancel={() => setConfirmRestore(false)} />
    </main>
  )
}

export default DataSettingsPage
