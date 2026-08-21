import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FiAward, FiBookOpen, FiBriefcase, FiCheck, FiClock, FiExternalLink, FiFolder, FiLayers, FiMail, FiMapPin, FiMessageSquare, FiStar, FiUser, FiZap } from 'react-icons/fi'

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
  const educations = data?.educations || []
  const certifications = data?.certifications || []
  const services = data?.services || []
  const testimonials = data?.testimonials || []
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

    <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiMessageSquare /></span><h2 className="font-semibold text-[#292929]">Published testimonials</h2></div><span className="text-xs text-[#999]">{testimonials.length}</span></div>{testimonials.length ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{testimonials.map((item) => <article key={item._id} className="rounded-md bg-[#f7f7f7] p-4"><div className="flex items-start gap-3">{item.imageUrl ? <img src={resolvePortfolioImageUrl(item.imageUrl)} alt="" className="size-11 shrink-0 rounded-md object-cover" /> : <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiMessageSquare /></span>}<div className="min-w-0"><div className="flex items-center gap-1.5"><h3 className="truncate text-sm font-semibold text-[#333]">{item.personName}</h3>{item.featured && <FiStar className="shrink-0 text-amber-600" />}</div><p className="mt-0.5 truncate text-xs text-[#888]">{[item.personRole, item.company].filter(Boolean).join(' · ') || 'Portfolio testimonial'}</p></div></div><p className="mt-4 text-sm leading-6 text-[#666]">“{item.message}”</p></article>)}</div> : <p className="py-10 text-center text-sm text-[#888]">No published testimonials yet.</p>}</section>

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
      <div className="space-y-3">
        <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiUser /></span><h2 className="font-semibold text-[#292929]">About</h2></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#5d5d5d]">{profile.about || 'No about information added yet.'}</p></section>
        <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiLayers /></span><h2 className="font-semibold text-[#292929]">Published services</h2></div><span className="text-xs text-[#999]">{services.length}</span></div>{services.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{services.map((service) => <article key={service._id} className="rounded-md bg-[#f7f7f7] p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark">{service.serviceType}</p><h3 className="mt-1 font-semibold text-[#333]">{service.title}</h3></div>{service.featured && <FiZap className="shrink-0 text-amber-600" title="Featured service" />}</div><p className="mt-2 text-xs leading-5 text-[#777]">{service.shortDescription}</p>{service.features?.length > 0 && <div className="mt-3 space-y-1.5">{service.features.slice(0, 4).map((feature) => <p key={feature} className="flex items-start gap-1.5 text-xs text-[#666]"><FiCheck className="mt-0.5 shrink-0 text-emerald-600" /> {feature}</p>)}</div>}{(service.priceLabel || service.deliveryTime) && <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-[#555]">{service.priceLabel && <span className="rounded bg-white px-2 py-1">{service.priceLabel}</span>}{service.deliveryTime && <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1"><FiClock /> {service.deliveryTime}</span>}</div>}</article>)}</div> : <p className="py-10 text-center text-sm text-[#888]">No published services yet.</p>}</section>
        <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#edf3f9] text-[#315f91]"><FiFolder /></span><h2 className="font-semibold text-[#292929]">Published projects</h2></div><span className="text-xs text-[#999]">{data.projects.length}</span></div>{data.projects.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{data.projects.map((project) => <article key={project._id} className="overflow-hidden rounded-md bg-[#f7f7f7]">{project.imageUrl && <img src={resolvePortfolioImageUrl(project.imageUrl)} alt="" className="aspect-video w-full object-cover" />}<div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-[#333]">{project.title}</h3>{project.featured && <FiStar className="shrink-0 text-amber-600" />}</div><p className="mt-2 line-clamp-3 text-xs leading-5 text-[#777]">{project.shortDescription}</p><div className="mt-3 flex flex-wrap gap-1.5">{project.technologies?.slice(0, 5).map((technology) => <span key={technology} className="rounded bg-white px-2 py-1 text-[10px] text-[#666]">{technology}</span>)}</div>{(project.liveUrl || project.githubUrl) && <div className="mt-3 flex gap-3 text-xs font-semibold text-primary-dark">{project.liveUrl && <span className="inline-flex items-center gap-1"><FiExternalLink /> Live</span>}{project.githubUrl && <span className="inline-flex items-center gap-1"><FaGithub /> Code</span>}</div>}</div></article>)}</div> : <p className="py-10 text-center text-sm text-[#888]">No published projects yet.</p>}</section>
      </div>

      <div className="space-y-3">
        <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#edf5f0] text-[#2f684f]"><FiStar /></span><h2 className="font-semibold text-[#292929]">Visible skills</h2></div>{skillGroups.length ? <div className="mt-4 space-y-4">{skillGroups.map(([category, skills]) => <div key={category}><p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{category}</p><div className="mt-2 flex flex-wrap gap-1.5">{skills.map((skill) => <span key={skill._id} className="rounded-md bg-[#f5f4f2] px-2.5 py-1.5 text-xs font-medium text-[#555]">{skill.name}</span>)}</div></div>)}</div> : <p className="py-8 text-center text-sm text-[#888]">No visible skills yet.</p>}</section>
        <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><FiBriefcase /></span><h2 className="font-semibold text-[#292929]">Published experience</h2></div>{data.experiences.length ? <div className="mt-4 divide-y divide-[#eceae7]">{data.experiences.map((item) => <article key={item._id} className="py-4 first:pt-0 last:pb-0"><h3 className="text-sm font-semibold text-[#333]">{item.position}</h3><p className="mt-1 text-xs font-medium text-primary-dark">{item.company}</p><p className="mt-1 text-[11px] text-[#888]">{formatMonth(item.startDate)} — {item.currentlyWorking ? 'Present' : formatMonth(item.endDate) || 'Not set'}</p>{item.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#777]">{item.description}</p>}<AchievementList items={item.achievements} /></article>)}</div> : <p className="py-8 text-center text-sm text-[#888]">No published experience yet.</p>}</section>
        <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-[#edf3f9] text-[#315f91]"><FiBookOpen /></span><h2 className="font-semibold text-[#292929]">Education</h2></div>{educations.length ? <div className="mt-4 divide-y divide-[#eceae7]">{educations.map((item) => <article key={item._id} className="py-4 first:pt-0 last:pb-0"><h3 className="text-sm font-semibold text-[#333]">{item.degree}</h3><p className="mt-1 text-xs font-medium text-[#315f91]">{item.institution}</p>{item.fieldOfStudy && <p className="mt-1 text-xs text-[#666]">{item.fieldOfStudy}</p>}<p className="mt-1 text-[11px] text-[#888]">{formatMonth(item.startDate)} — {item.currentlyStudying ? 'Present' : formatMonth(item.endDate) || 'Not set'}</p><AchievementList items={item.achievements} /></article>)}</div> : <p className="py-8 text-center text-sm text-[#888]">No published education yet.</p>}</section>
        <section className="rounded-lg bg-white p-4 sm:p-5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-amber-50 text-amber-700"><FiAward /></span><h2 className="font-semibold text-[#292929]">Certifications</h2></div>{certifications.length ? <div className="mt-4 divide-y divide-[#eceae7]">{certifications.map((item) => <article key={item._id} className="py-4 first:pt-0 last:pb-0"><h3 className="text-sm font-semibold text-[#333]">{item.name}</h3><p className="mt-1 text-xs font-medium text-amber-700">{item.issuingOrganization}</p><p className="mt-1 text-[11px] text-[#888]">Issued {formatMonth(item.issueDate)} · {item.doesNotExpire ? 'No expiry' : formatMonth(item.expirationDate) || 'No expiration added'}</p>{item.credentialUrl && <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-dark"><FiExternalLink /> Credential available</span>}</article>)}</div> : <p className="py-8 text-center text-sm text-[#888]">No published certifications yet.</p>}</section>
      </div>
    </div>
  </div>
}

function AchievementList({ items = [] }) {
  if (!items.length) return null
  return <div className="mt-3 rounded-md bg-[#faf9f7] p-2.5"><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700"><FiAward /> Achievements</p><div className="mt-2 space-y-1.5">{items.map((item) => <p key={item} className="flex items-start gap-1.5 text-xs leading-5 text-[#666]"><FiCheck className="mt-1 shrink-0 text-emerald-600" /> <span>{item}</span></p>)}</div></div>
}

export default Preview
