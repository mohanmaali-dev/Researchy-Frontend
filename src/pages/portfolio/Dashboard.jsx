import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'
import { FiArrowRight, FiBookOpen, FiBriefcase, FiCheckCircle, FiEdit2, FiExternalLink, FiEye, FiFileText, FiFolder, FiLayers, FiMail, FiMapPin, FiMessageSquare, FiMonitor, FiPhone, FiPlus, FiStar, FiTrendingUp, FiUser, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import StatCard from '../../components/portfolio/StatCard.jsx'
import CopyButton from '../../components/ui/CopyButton.jsx'
import { getPortfolioDashboard, getPortfolioProfile, resolvePortfolioImageUrl } from '../../services/portfolio.service.js'
import { PORTFOLIO_SITE_URL } from '../../utils/portfolio.js'

const statusStyle = { Published: 'bg-emerald-50 text-emerald-700', Draft: 'bg-amber-50 text-amber-700' }

const displayValue = (value) => value || 'Not added'
const compactUrl = (value) => {
  try {
    const parsed = new URL(value)
    const readable = `${parsed.host}${parsed.pathname === '/' ? '' : parsed.pathname}`.replace(/\/$/, '')
    return readable.length > 58 ? `${readable.slice(0, 55)}...` : readable
  } catch { return value }
}

function Detail({ icon: Icon, label, value, wide = false, accent = false, url = false }) {
  return <div className={`flex min-w-0 items-start gap-3 overflow-hidden rounded-md bg-[#faf9f7] p-3 ${wide ? 'sm:col-span-2' : ''}`}><span className={`grid size-9 shrink-0 place-items-center rounded-md text-base ${accent && value ? 'bg-[#fff0ec] text-primary-dark' : 'bg-white text-[#777]'}`}><Icon aria-hidden="true" /></span><div className="min-w-0 flex-1 overflow-hidden"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{label}</p><p title={url && value ? value : undefined} className={`mt-0.5 whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere] ${url ? 'break-all' : 'break-words'} ${value ? 'text-[#3f3f3f]' : 'text-[#aaa]'}`}>{displayValue(url && value ? compactUrl(value) : value)}</p>{url && value && <div className="mt-2 flex flex-wrap items-center gap-1.5"><a href={value} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-primary-dark transition hover:bg-[#fff0ec]"><FiExternalLink aria-hidden="true" /> Open</a><CopyButton value={value} label="Copy URL" showLabel className="min-h-8 bg-white px-2.5 hover:bg-[#f0efed]" /></div>}</div></div>
}

function ProfileDetailsModal({ open, profile, loading, error, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const closeWithEscape = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', closeWithEscape)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', closeWithEscape); document.body.style.overflow = '' }
  }, [onClose, open])

  if (!open) return null
  const imageUrl = resolvePortfolioImageUrl(profile?.profileImageUrl)
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-2 sm:grid sm:place-items-center sm:p-5">
      <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={onClose} aria-label="Close profile details" />
      <section role="dialog" aria-modal="true" aria-labelledby="profile-details-title" className="relative z-10 max-h-[calc(100dvh-1rem)] w-full max-w-6xl overflow-x-hidden overflow-y-auto rounded-lg bg-[#f5f4f2] shadow-[0_24px_80px_rgba(0,0,0,.2)] sm:max-h-[calc(100dvh-3rem)]">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiEye /></span><div><h2 id="profile-details-title" className="text-lg font-semibold text-[#292929]">Profile details</h2><p className="mt-0.5 text-xs text-[#888]">All saved public profile information.</p></div></div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-md bg-[#f4f3f1] text-[#666] hover:text-[#222]" aria-label="Close"><FiX /></button>
        </header>

        {loading ? <div className="animate-pulse space-y-3 p-3 sm:p-5"><div className="h-32 rounded-lg bg-white" /><div className="grid gap-3 sm:grid-cols-2"><div className="h-48 rounded-lg bg-white" /><div className="h-48 rounded-lg bg-white" /></div></div> : error ? <div className="m-3 rounded-lg bg-white px-5 py-14 text-center sm:m-5"><p className="text-sm text-red-600">{error}</p></div> : <div className="space-y-3 p-3 sm:p-5">
          <section className="rounded-lg bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {imageUrl ? <img src={imageUrl} alt="Profile" className="size-20 shrink-0 rounded-md bg-[#f2f1ef] object-cover sm:size-24" /> : <span className="grid size-20 shrink-0 place-items-center rounded-md bg-[#f2f1ef] text-2xl text-[#aaa] sm:size-24"><FiUser /></span>}
              <div className="min-w-0 flex-1"><h3 className="text-xl font-semibold text-[#292929]">{displayValue(profile?.fullName)}</h3><p className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary-dark"><FiBriefcase /> {displayValue(profile?.professionalTitle)}</p>{profile?.availabilityText && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><FiCheckCircle /> {profile.availabilityText}</p>}<p className={`mt-3 whitespace-pre-wrap text-sm leading-6 ${profile?.shortBio ? 'text-[#555]' : 'text-[#aaa]'}`}>{displayValue(profile?.shortBio)}</p></div>
            </div>
            <div className="mt-5"><Detail icon={FiUser} label="About" value={profile?.about} wide /></div>
          </section>

          <div className="grid min-w-0 gap-3 xl:grid-cols-2">
            <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiMail /></span><h3 className="font-semibold text-[#292929]">Contact information</h3></div><div className="mt-4 grid gap-2.5 sm:grid-cols-2"><Detail icon={FiMail} label="Email" value={profile?.email} accent /><Detail icon={FiPhone} label="Mobile number" value={profile?.phone} accent /><Detail icon={FiMapPin} label="Location" value={profile?.location} wide /><Detail icon={FaWhatsapp} label="WhatsApp number" value={profile?.whatsappNumber} accent /><Detail icon={FaWhatsapp} label="WhatsApp message" value={profile?.whatsappMessage} wide /></div></section>
            <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiFileText /></span><h3 className="font-semibold text-[#292929]">Resume and social links</h3></div><div className="mt-4 grid gap-2.5 sm:grid-cols-2"><Detail icon={FiFileText} label="Resume" value={profile?.resumeUrl} wide accent url /><Detail icon={FaGithub} label="GitHub" value={profile?.githubUrl} url /><Detail icon={FaLinkedin} label="LinkedIn" value={profile?.linkedinUrl} accent url /><Detail icon={FaInstagram} label="Instagram" value={profile?.instagramUrl} url /><Detail icon={FaXTwitter} label="X / Twitter" value={profile?.xUrl} url /></div></section>
          </div>
        </div>}
      </section>
    </div>,
    document.body,
  )
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileDetails, setProfileDetails] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setSummary((await getPortfolioDashboard()).data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadDashboard() }, [loadDashboard])

  const openProfileDetails = async () => {
    setProfileOpen(true)
    if (profileDetails) return
    setProfileLoading(true)
    setProfileError('')
    try { setProfileDetails((await getPortfolioProfile()).data) } catch (requestError) { setProfileError(requestError.message) } finally { setProfileLoading(false) }
  }

  if (loading) return <LoadingState label="Loading portfolio overview" />
  if (error) return <ErrorState message={error} onRetry={loadDashboard} backTo="/home" backLabel="Go home" />

  const counts = summary?.counts || {}
  const progress = summary?.profileProgress || { percentage: 0, missing: [] }
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  const publicEndpoint = summary?.profile?._id ? `${apiBase}/portfolio/public/${summary.profile._id}` : ''
  const contactEndpoint = `${apiBase}/portfolio/contact-submissions`
  return (
    <div className="space-y-3">
      <PageHeader title="Portfolio overview" description="Manage the content shown on your developer portfolio.">
        <button type="button" onClick={openProfileDetails} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3.5 py-2 text-sm font-medium text-[#555] hover:bg-[#f7f7f7]"><FiEye aria-hidden="true" /> Profile details</button>
        <Link to="/portfolio/preview" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3.5 py-2 text-sm font-medium text-[#555] hover:bg-[#f7f7f7]"><FiMonitor aria-hidden="true" /> Preview</Link>
        {PORTFOLIO_SITE_URL && <a href={PORTFOLIO_SITE_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3.5 py-2 text-sm font-medium text-[#555] hover:bg-[#f7f7f7]">View live site <FiArrowRight aria-hidden="true" /></a>}
        <Link to="/portfolio/projects/new" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus aria-hidden="true" /> Add project</Link>
      </PageHeader>

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 2xl:grid-cols-6 sm:gap-3" aria-label="Portfolio summary">
        <StatCard title="Projects" value={counts.projects || 0} icon={FiFolder} description={`${counts.published || 0} published`} />
        <StatCard title="Drafts" value={counts.drafts || 0} icon={FiEdit2} description="Not public yet" tone="blue" />
        <StatCard title="Skills" value={counts.skills || 0} icon={FiStar} description="Technologies listed" tone="blue" />
        <StatCard title="Experience" value={counts.experiences || 0} icon={FiBriefcase} description="Work records" tone="green" />
        <StatCard title="Featured" value={counts.featured || 0} icon={FiTrendingUp} description="Highlighted projects" tone="purple" />
        <StatCard title="Messages" value={counts.newMessages || 0} icon={FiMail} description="New enquiries" />
      </section>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.7fr)]">
        <section className="rounded-lg bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-[#292929]">Recent projects</h2><p className="mt-1 text-xs text-[#888]">Your latest portfolio updates.</p></div><Link to="/portfolio/projects" className="text-xs font-semibold text-primary-dark hover:underline">View all</Link></div>
          {summary?.recentProjects?.length ? (
            <div className="mt-4 divide-y divide-[#eceae7]">
              {summary.recentProjects.map((project) => (
                <Link key={project._id} to={`/portfolio/projects/${project._id}/edit`} className="group flex items-center gap-3 py-3.5 first:pt-1 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#f5f4f2] text-[#666]"><FiFolder aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#333] group-hover:text-primary-dark">{project.title}</span><span className="mt-0.5 block truncate text-xs text-[#888]">{project.shortDescription}</span></span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[project.status]}`}>{project.status}</span>
                  <FiArrowRight className="text-[#aaa] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : <div className="py-12 text-center"><FiFolder className="mx-auto text-2xl text-[#aaa]" /><p className="mt-3 text-sm font-semibold">No projects yet</p><p className="mt-1 text-xs text-[#888]">Add your first project to begin.</p></div>}
        </section>

        <section className="rounded-lg bg-white p-4 sm:p-6">
          <h2 className="font-semibold text-[#292929]">Content setup</h2><p className="mt-1 text-xs text-[#888]">Keep each public section current.</p>
          <div className="mt-4 rounded-md bg-[#faf9f7] p-3.5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#333]">Profile completeness</p><p className="mt-0.5 text-xs text-[#888]">{progress.percentage === 100 ? 'Your profile information is complete.' : `${progress.missing.length} items still need attention.`}</p></div><span className="text-lg font-semibold text-primary-dark">{progress.percentage}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8e5e1]"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.percentage}%` }} /></div>{progress.missing.length > 0 && <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#888]">Missing: {progress.missing.join(', ')}</p>}</div>
          <div className="mt-4 space-y-2">
            {[
              ['/portfolio/profile', FiUser, 'Profile', summary?.profile?.fullName || 'Add your introduction'],
              ['/portfolio/contact', FiMail, 'Contact messages', 'View visitor enquiries'],
              ['/portfolio/skills', FiStar, 'Skills', 'Manage technologies'],
              ['/portfolio/services', FiLayers, 'Services', `${counts.services || 0} services`],
              ['/portfolio/testimonials', FiMessageSquare, 'Testimonials', `${counts.testimonials || 0} testimonials`],
              ['/portfolio/experience', FiBriefcase, 'Experience', 'Manage your work history'],
              ['/portfolio/education', FiBookOpen, 'Education & certifications', `${counts.educations || 0} education · ${counts.certifications || 0} certifications`],
            ].map(([to, Icon, label, detail]) => <Link key={to} to={to} className="group flex items-center gap-3 rounded-md bg-[#f7f7f7] p-3 transition hover:bg-[#f0efed]"><Icon className="text-primary-dark" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#333]">{label}</span><span className="block truncate text-xs text-[#888]">{detail}</span></span><FiArrowRight className="text-[#aaa] transition group-hover:translate-x-0.5" /></Link>)}
          </div>
          {publicEndpoint && <div className="mt-4 rounded-md bg-[#f7f7f7] p-3"><p className="text-xs font-semibold text-[#444]">Future website integration</p><p className="mt-1 text-[11px] leading-5 text-[#888]">These endpoints are ready when you connect the public website later.</p><div className="mt-3 space-y-2.5"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">Portfolio data</p><div className="mt-1 flex min-w-0 items-center gap-1"><p className="min-w-0 flex-1 truncate text-[11px] text-[#666]" title={publicEndpoint}>{compactUrl(publicEndpoint)}</p><CopyButton value={publicEndpoint} label="Copy endpoint" className="size-8 bg-white" /></div></div><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">Contact form</p><div className="mt-1 flex min-w-0 items-center gap-1"><p className="min-w-0 flex-1 truncate text-[11px] text-[#666]" title={contactEndpoint}>{compactUrl(contactEndpoint)}</p><CopyButton value={contactEndpoint} label="Copy endpoint" className="size-8 bg-white" /></div></div><p className="text-[10px] text-[#999]">Profile ID: <span className="font-medium text-[#666]">{summary.profile._id}</span></p></div></div>}
        </section>
      </div>
      <ProfileDetailsModal open={profileOpen} profile={profileDetails} loading={profileLoading} error={profileError} onClose={() => setProfileOpen(false)} />
    </div>
  )
}

export default Dashboard
