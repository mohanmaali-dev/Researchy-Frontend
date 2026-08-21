import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FiBriefcase, FiExternalLink, FiFolder, FiMail, FiMapPin, FiStar, FiUser } from 'react-icons/fi'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import { getPortfolioProfile, getPublicPortfolio, resolvePortfolioImageUrl } from '../../services/portfolio.service.js'

const socialLinks = [
  ['githubUrl', 'GitHub', FaGithub],
  ['linkedinUrl', 'LinkedIn', FaLinkedin],
  ['instagramUrl', 'Instagram', FaInstagram],
  ['xUrl', 'X', FaXTwitter],
]

const formatMonth = (value) => value ? new Date(`${value}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''

function Preview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPreview = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const profile = (await getPortfolioProfile()).data
      if (!profile?._id) { setData({ profile: {}, projects: [], skills: [], experiences: [] }); return }
      setData((await getPublicPortfolio(profile._id)).data)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadPreview() }, [loadPreview])

  const skillGroups = useMemo(() => Object.entries((data?.skills || []).reduce((groups, skill) => ({ ...groups, [skill.category]: [...(groups[skill.category] || []), skill] }), {})), [data?.skills])

  if (loading) return <LoadingState label="Loading portfolio preview" />
  if (error) return <ErrorState message={error} onRetry={loadPreview} backTo="/portfolio" backLabel="Portfolio overview" />

  const profile = data?.profile || {}
  const imageUrl = resolvePortfolioImageUrl(profile.profileImageUrl)
  return <div className="space-y-3">
    <PageHeader title="Portfolio preview" description="Review the published content that your future public website will receive." />
    <div className="rounded-lg bg-[#fff8e8] px-4 py-3 text-xs leading-5 text-[#8a6421]">Admin preview only. Draft projects, draft experience, hidden skills, and hidden social links are not shown here.</div>

    <section className="overflow-hidden rounded-lg bg-[#242321] text-white">
      <div className="grid gap-7 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f3a28f]">Portfolio preview</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{profile.fullName || 'Your name'}</h1><p className="mt-2 text-base text-[#f3a28f] sm:text-lg">{profile.professionalTitle || 'Professional title'}</p><p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-white/70">{profile.shortBio || 'Add a short introduction from the Profile page.'}</p><div className="mt-5 flex flex-wrap gap-2">{profile.email && <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs"><FiMail /> {profile.email}</span>}{profile.location && <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs"><FiMapPin /> {profile.location}</span>}{socialLinks.filter(([field]) => profile[field]).map(([field, label, Icon]) => <span key={field} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-xs"><Icon /> {label}</span>)}</div></div>
        <div className="order-first lg:order-none">{imageUrl ? <img src={imageUrl} alt="" className="aspect-square w-28 rounded-lg object-cover sm:w-36 lg:w-full" /> : <span className="grid aspect-square w-28 place-items-center rounded-lg bg-white/10 text-4xl text-white/50 sm:w-36 lg:w-full"><FiUser /></span>}</div>
      </div>
    </section>

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
      <div className="space-y-3">
        <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiUser /></span><h2 className="font-semibold text-[#292929]">About</h2></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#5d5d5d]">{profile.about || 'No about information added yet.'}</p></section>
        <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#edf3f9] text-[#315f91]"><FiFolder /></span><h2 className="font-semibold text-[#292929]">Published projects</h2></div><span className="text-xs text-[#999]">{data.projects.length}</span></div>{data.projects.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{data.projects.map((project) => <article key={project._id} className="overflow-hidden rounded-md bg-[#f7f7f7]">{project.imageUrl && <img src={resolvePortfolioImageUrl(project.imageUrl)} alt="" className="aspect-video w-full object-cover" />}<div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-[#333]">{project.title}</h3>{project.featured && <FiStar className="shrink-0 text-amber-600" />}</div><p className="mt-2 line-clamp-3 text-xs leading-5 text-[#777]">{project.shortDescription}</p><div className="mt-3 flex flex-wrap gap-1.5">{project.technologies?.slice(0, 5).map((technology) => <span key={technology} className="rounded bg-white px-2 py-1 text-[10px] text-[#666]">{technology}</span>)}</div>{(project.liveUrl || project.githubUrl) && <div className="mt-3 flex gap-3 text-xs font-semibold text-primary-dark">{project.liveUrl && <span className="inline-flex items-center gap-1"><FiExternalLink /> Live</span>}{project.githubUrl && <span className="inline-flex items-center gap-1"><FaGithub /> Code</span>}</div>}</div></article>)}</div> : <p className="py-10 text-center text-sm text-[#888]">No published projects yet.</p>}</section>
      </div>

      <div className="space-y-3">
        <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#edf5f0] text-[#2f684f]"><FiStar /></span><h2 className="font-semibold text-[#292929]">Visible skills</h2></div>{skillGroups.length ? <div className="mt-4 space-y-4">{skillGroups.map(([category, skills]) => <div key={category}><p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{category}</p><div className="mt-2 flex flex-wrap gap-1.5">{skills.map((skill) => <span key={skill._id} className="rounded-md bg-[#f5f4f2] px-2.5 py-1.5 text-xs font-medium text-[#555]">{skill.name}</span>)}</div></div>)}</div> : <p className="py-8 text-center text-sm text-[#888]">No visible skills yet.</p>}</section>
        <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiBriefcase /></span><h2 className="font-semibold text-[#292929]">Published experience</h2></div>{data.experiences.length ? <div className="mt-4 divide-y divide-[#eceae7]">{data.experiences.map((item) => <article key={item._id} className="py-4 first:pt-0 last:pb-0"><h3 className="text-sm font-semibold text-[#333]">{item.position}</h3><p className="mt-1 text-xs font-medium text-primary-dark">{item.company}</p><p className="mt-1 text-[11px] text-[#888]">{formatMonth(item.startDate)} — {item.currentlyWorking ? 'Present' : formatMonth(item.endDate) || 'Not set'}</p>{item.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#777]">{item.description}</p>}</article>)}</div> : <p className="py-8 text-center text-sm text-[#888]">No published experience yet.</p>}</section>
      </div>
    </div>
  </div>
}

export default Preview
