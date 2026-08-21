import { useCallback, useEffect, useState } from 'react'
import { FiArrowDown, FiArrowUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiEdit2, FiExternalLink, FiFolder, FiGithub, FiPlus, FiSearch, FiStar, FiTrash2 } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { ErrorState, TableLoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import BulkActions, { SelectionCheckbox } from '../../components/portfolio/BulkActions.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import CopyButton from '../../components/ui/CopyButton.jsx'
import TruncatedText from '../../components/ui/TruncatedText.jsx'
import { useBulkSelection } from '../../hooks/useBulkSelection.js'
import { deletePortfolioProject, getPortfolioProjects, movePortfolioProject, resolvePortfolioImageUrl } from '../../services/portfolio.service.js'

const statusStyle = { Published: 'bg-emerald-50 text-emerald-700', Draft: 'bg-amber-50 text-amber-700' }
const desktopColumns = '2rem 5rem minmax(9rem,1fr) minmax(12rem,1.45fr) minmax(9rem,1fr) 5.75rem 5.75rem 6.5rem 7rem 7.5rem 9.5rem'

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [movingId, setMovingId] = useState('')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'All'
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const bulk = useBulkSelection(projects)

  const loadProjects = useCallback(async () => {
    setLoading(true); setError('')
    try { const result = await getPortfolioProjects({ page, limit: 10, search, status }); setProjects(result.data); setPagination(result.pagination) }
    catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [page, search, status])
  useEffect(() => { const timer = window.setTimeout(loadProjects, search ? 250 : 0); return () => window.clearTimeout(timer) }, [loadProjects, search])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All' || (key === 'page' && Number(value) === 1)) next.delete(key); else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const confirmDelete = async () => {
    setDeleting(true)
    try { await deletePortfolioProject(deleteTarget._id); setDeleteTarget(null); await loadProjects() }
    catch (requestError) { setError(requestError.message); setDeleteTarget(null) } finally { setDeleting(false) }
  }
  const moveProject = async (projectId, direction) => {
    setMovingId(projectId); setError('')
    try { await movePortfolioProject(projectId, direction); await loadProjects() } catch (requestError) { setError(requestError.message) } finally { setMovingId('') }
  }

  return (
    <div className="space-y-3">
      <PageHeader title="Projects" description="Create and publish the work shown on your portfolio.">
        <Link to="/portfolio/projects/new" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus aria-hidden="true" /> Add project</Link>
      </PageHeader>

      <section className="rounded-lg bg-white p-4 sm:p-6">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-[#d9d6d2] bg-white px-3 text-[#777] transition-colors focus-within:border-primary/60 focus-within:text-primary-dark"><FiSearch aria-hidden="true" /><input value={search} onChange={(event) => updateParam('search', event.target.value)} className="global-search-input min-w-0 flex-1 border-0 bg-transparent text-sm text-[#222] outline-none placeholder:text-[#999]" placeholder="Search projects" /></label>
          <label className="relative"><span className="sr-only">Project status</span><select value={status} onChange={(event) => updateParam('status', event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-9 text-sm text-[#333] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"><option>All</option><option>Published</option><option>Draft</option></select><FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]" /></label>
        </div>

        <div className="mt-3"><BulkActions entity="projects" label="projects" items={projects} selected={bulk.selected} selectedIds={bulk.selectedIds} allSelected={bulk.allSelected} visibleCount={bulk.visibleCount} onToggle={bulk.toggle} onToggleAll={bulk.toggleAll} onClear={bulk.clear} onDeleted={loadProjects} /></div>
        <div className="mt-4">
          {loading ? <TableLoadingState label="Loading projects" headers={['', 'Image', 'Project name', 'Description', 'Technologies', 'Live site', 'GitHub', 'Status', 'Featured', 'Updated', '']} template={desktopColumns} minWidth="1390px" /> : error && !projects.length ? <ErrorState message={error} onRetry={loadProjects} backTo="/portfolio" backLabel="Portfolio overview" /> : !projects.length ? (
            <div className="py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#fff0ec] text-xl text-primary-dark"><FiFolder /></span><h2 className="mt-4 text-base font-semibold">{search || status !== 'All' ? 'No matching projects' : 'No projects yet'}</h2><p className="mt-1 text-sm text-[#888]">{search || status !== 'All' ? 'Try changing the search or status.' : 'Add a project when you are ready to show your work.'}</p></div>
          ) : <>
            {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[1390px]">
                <div className="grid items-center gap-4 bg-[#faf9f7] px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]" style={{ gridTemplateColumns: desktopColumns }}>
                  <span /><span>Image</span>
                  <span>Project name</span>
                  <span>Description</span>
                  <span>Technologies</span>
                  <span>Live site</span>
                  <span>GitHub</span>
                  <span>Status</span>
                  <span>Featured</span>
                  <span>Updated</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-[#eceae7]">
                  {projects.map((project) => {
                    const technologies = project.technologies?.join(', ') || ''
                    return (
                      <div key={project._id} className="grid min-h-20 items-center gap-4 px-4 py-3" style={{ gridTemplateColumns: desktopColumns }}>
                        <SelectionCheckbox checked={bulk.selected.has(String(project._id))} onChange={() => bulk.toggle(project._id)} label={`Select ${project.title}`} />
                        {project.imageUrl ? (
                          <img src={resolvePortfolioImageUrl(project.imageUrl)} alt="" className="h-12 w-16 rounded-md border border-[#e4e1dd] bg-[#f3f2f0] object-cover" />
                        ) : (
                          <span className="grid h-12 w-16 place-items-center rounded-md border border-[#e4e1dd] bg-[#f3f2f0] text-[#aaa]"><FiFolder /></span>
                        )}
                        <Link to={`/portfolio/projects/${project._id}/edit`} className="group min-w-0 outline-none">
                          <TruncatedText value={project.title} className="text-sm font-semibold text-[#292929] transition group-hover:text-primary-dark group-focus-visible:text-primary-dark" />
                          <span className="mt-1 block truncate text-[10px] font-medium text-[#888]">{project.projectType ? (project.projectType === 'Other' ? project.customProjectType || 'Other' : project.projectType) : 'Other'} · {project.projectSource || 'Personal Project'}</span>
                        </Link>
                        <TruncatedText value={project.shortDescription} className="text-sm text-[#666]" emptyLabel="No description" />
                        <TruncatedText value={technologies} className="text-xs text-[#666]" emptyLabel="No technologies" />
                        {project.liveUrl ? <span className="flex min-w-0 items-center gap-1"><a href={project.liveUrl} target="_blank" rel="noreferrer" title={project.liveUrl} className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#edf3f9] px-2.5 py-1.5 text-xs font-semibold text-[#315f91] transition hover:bg-[#e2ecf9]"><FiExternalLink /> Open</a><CopyButton value={project.liveUrl} label="Copy live site URL" className="size-7" /></span> : <span className="text-xs text-[#aaa]">Not added</span>}
                        {project.githubUrl ? <span className="flex min-w-0 items-center gap-1"><a href={project.githubUrl} target="_blank" rel="noreferrer" title={project.githubUrl} className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#f2f1ef] px-2.5 py-1.5 text-xs font-semibold text-[#555] transition hover:bg-[#e9e7e4] hover:text-[#222]"><FiGithub /> Code</a><CopyButton value={project.githubUrl} label="Copy GitHub URL" className="size-7" /></span> : <span className="text-xs text-[#aaa]">Not added</span>}
                        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[project.status]}`}>{project.status}</span>
                        {project.featured ? <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><FiStar /> Featured</span> : <span className="w-fit rounded-full bg-[#f2f1ef] px-2.5 py-1 text-xs font-medium text-[#777]">Standard</span>}
                        <span className="text-xs text-[#777]">{new Date(project.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <div className="flex justify-end gap-1">
                          <button type="button" disabled={movingId === project._id} onClick={() => moveProject(project._id, 'up')} className="grid size-9 place-items-center rounded-md text-[#777] hover:bg-[#f2f1ef] hover:text-[#222] disabled:opacity-40" aria-label={`Move ${project.title} up`} title="Move up"><FiArrowUp /></button>
                          <button type="button" disabled={movingId === project._id} onClick={() => moveProject(project._id, 'down')} className="grid size-9 place-items-center rounded-md text-[#777] hover:bg-[#f2f1ef] hover:text-[#222] disabled:opacity-40" aria-label={`Move ${project.title} down`} title="Move down"><FiArrowDown /></button>
                          <Link to={`/portfolio/projects/${project._id}/edit`} className="grid size-9 place-items-center rounded-md text-[#777] hover:bg-[#f2f1ef] hover:text-[#222]" aria-label={`Edit ${project.title}`}><FiEdit2 /></Link>
                          <button type="button" onClick={() => setDeleteTarget(project)} className="grid size-9 place-items-center rounded-md text-[#999] hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${project.title}`}><FiTrash2 /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-2 md:hidden">{projects.map((project) => <article key={project._id} className="rounded-md bg-[#f7f7f7] p-3.5"><div className="flex items-start gap-3">{project.imageUrl ? <img src={resolvePortfolioImageUrl(project.imageUrl)} alt="" className="size-14 shrink-0 rounded-md border border-[#e4e1dd] bg-white object-cover" /> : <span className="grid size-14 shrink-0 place-items-center rounded-md border border-[#e4e1dd] bg-white text-[#aaa]"><FiFolder /></span>}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><Link to={`/portfolio/projects/${project._id}/edit`} className="block truncate text-sm font-semibold">{project.title}</Link><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[project.status]}`}>{project.status}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#777]">{project.shortDescription}</p></div></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded bg-white px-2 py-1 text-[10px] font-medium text-[#666]">{project.projectType === 'Other' ? project.customProjectType || 'Other' : project.projectType}</span><span className="rounded bg-white px-2 py-1 text-[10px] font-medium text-[#666]">{project.projectSource || 'Personal Project'}</span>{project.featured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700"><FiStar /> Featured</span> : <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#777]">Standard</span>}{project.liveUrl && <span className="inline-flex items-center"><a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-[#edf3f9] px-2 py-1 text-[10px] font-semibold text-[#315f91]"><FiExternalLink /> Live</a><CopyButton value={project.liveUrl} label="Copy live site URL" className="size-8" /></span>}{project.githubUrl && <span className="inline-flex items-center"><a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[#555]"><FiGithub /> GitHub</a><CopyButton value={project.githubUrl} label="Copy GitHub URL" className="size-8" /></span>}</div><div className="mt-3 flex items-center justify-between gap-2"><div className="flex min-w-0 gap-1 overflow-hidden">{project.technologies?.slice(0, 2).map((tech) => <span key={tech} className="truncate rounded bg-white px-2 py-1 text-[10px] text-[#666]">{tech}</span>)}</div><div className="flex shrink-0"><button type="button" disabled={movingId === project._id} onClick={() => moveProject(project._id, 'up')} className="grid size-9 place-items-center text-[#666] disabled:opacity-40" aria-label={`Move ${project.title} up`}><FiArrowUp /></button><button type="button" disabled={movingId === project._id} onClick={() => moveProject(project._id, 'down')} className="grid size-9 place-items-center text-[#666] disabled:opacity-40" aria-label={`Move ${project.title} down`}><FiArrowDown /></button><Link to={`/portfolio/projects/${project._id}/edit`} className="grid size-9 place-items-center text-[#666]" aria-label={`Edit ${project.title}`}><FiEdit2 /></Link><button type="button" onClick={() => setDeleteTarget(project)} className="grid size-9 place-items-center text-red-500" aria-label={`Delete ${project.title}`}><FiTrash2 /></button></div></div></article>)}</div>
            {pagination.totalPages > 1 && <div className="mt-5 flex items-center justify-between border-t border-[#eceae7] pt-4"><p className="text-xs text-[#888]">Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} projects</p><div className="flex gap-2"><button type="button" disabled={!pagination.hasPreviousPage} onClick={() => updateParam('page', page - 1)} className="grid size-9 place-items-center rounded-md border border-[#ddd9d5] disabled:opacity-40" aria-label="Previous page"><FiChevronLeft /></button><button type="button" disabled={!pagination.hasNextPage} onClick={() => updateParam('page', page + 1)} className="grid size-9 place-items-center rounded-md border border-[#ddd9d5] disabled:opacity-40" aria-label="Next page"><FiChevronRight /></button></div></div>}
          </>}
        </div>
      </section>
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete this project?" message={`“${deleteTarget?.title || 'This project'}” will be permanently removed from your portfolio data.`} confirmLabel="Delete project" loading={deleting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}

export default Projects
