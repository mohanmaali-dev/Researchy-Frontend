import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FiExternalLink, FiFileText, FiImage, FiMail, FiSave, FiTrash2, FiUploadCloud, FiUser, FiX } from 'react-icons/fi'
import { z } from 'zod'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import DraftStatus from '../../components/ui/DraftStatus.jsx'
import { FieldError, FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import { useFormDraft } from '../../hooks/useFormDraft.js'
import { getPortfolioProfile, resolvePortfolioImageUrl, savePortfolioProfile } from '../../services/portfolio.service.js'
import { PORTFOLIO_SITE_URL } from '../../utils/portfolio.js'

const optionalUrl = z.string().trim().max(1000, 'Web address is too long').refine((value) => !value || /^https?:\/\//i.test(value), 'Enter a full web address beginning with http:// or https://')
const optionalText = (limit, message) => z.string().trim().max(limit, message)
const optionalDigits = (label) => z.string().trim().refine((value) => !value || /^\d{7,15}$/.test(value), `${label} must contain 7 to 15 digits only`)

const profileSchema = z.object({
  fullName: optionalText(120, 'Name is too long'),
  professionalTitle: optionalText(180, 'Professional title is too long'),
  shortBio: optionalText(500, 'Short introduction is too long'),
  about: optionalText(10000, 'About content is too long'),
  email: z.string().trim().max(254).refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter a valid email address'),
  phone: optionalDigits('Mobile number'),
  location: optionalText(200, 'Location is too long'),
  availabilityText: optionalText(160, 'Availability message is too long'),
  whatsappNumber: optionalDigits('WhatsApp number'),
  whatsappMessage: optionalText(500, 'WhatsApp message is too long'),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  xUrl: optionalUrl,
  showGithub: z.boolean(),
  showLinkedin: z.boolean(),
  showInstagram: z.boolean(),
  showX: z.boolean(),
  profileImageUrl: optionalUrl,
  profileImageAction: z.enum(['keep', 'upload', 'url', 'remove']),
  resumeUrl: optionalUrl,
  resumeAction: z.enum(['keep', 'upload', 'url', 'remove']),
})

const EMPTY_PROFILE = {
  fullName: '', professionalTitle: '', shortBio: '', about: '', profileImageUrl: '',
  email: '', phone: '', location: '', availabilityText: '', whatsappNumber: '', whatsappMessage: '',
  githubUrl: '', linkedinUrl: '', instagramUrl: '', xUrl: '',
  showGithub: true, showLinkedin: true, showInstagram: true, showX: true,
  profileImageAction: 'keep', resumeUrl: '', resumeAction: 'keep',
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-lg bg-white p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#fff0ec] text-primary-dark"><Icon /></span>
        <div>
          <h2 className="font-semibold text-[#292929]">{title}</h2>
          {description && <p className="mt-1 text-xs leading-5 text-[#888]">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function ImageViewer({ open, src, onClose }) {
  const [rendered, setRendered] = useState(open)
  const [visible, setVisible] = useState(false)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    let frame
    let timer
    if (open) {
      setRendered(true)
      frame = requestAnimationFrame(() => setVisible(true))
      document.body.style.overflow = 'hidden'
      timer = window.setTimeout(() => closeButtonRef.current?.focus(), 100)
    } else {
      setVisible(false)
      timer = window.setTimeout(() => setRendered(false), 200)
      document.body.style.overflow = ''
    }
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const closeWithKeyboard = (event) => {
      if (open && event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeWithKeyboard)
    return () => document.removeEventListener('keydown', closeWithKeyboard)
  }, [onClose, open])

  if (!rendered || !src) return null

  return createPortal(
    <div className={`fixed inset-0 z-[600] grid place-items-center p-4 transition-opacity duration-200 sm:p-8 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <button type="button" onClick={onClose} className="absolute inset-0 bg-[#111827]/70 backdrop-blur-md" aria-label="Close image viewer" />
      <div role="dialog" aria-modal="true" aria-label="Profile image preview" className={`relative z-10 flex max-h-full max-w-full items-center justify-center transition duration-200 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'}`}>
        <img src={src} alt="Large profile preview" className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:max-h-[calc(100dvh-4rem)] sm:max-w-[calc(100vw-8rem)]" />
      </div>
      <button ref={closeButtonRef} type="button" onClick={onClose} className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-md bg-white text-lg text-[#374151] shadow-lg transition hover:bg-[#f3f4f6] hover:text-[#111827] sm:right-7 sm:top-7" aria-label="Close image viewer"><FiX /></button>
    </div>,
    document.body,
  )
}

function ProfileForm({ initialValues }) {
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const imageInputRef = useRef(null)
  const resumeInputRef = useRef(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({ resolver: zodResolver(profileSchema), defaultValues: initialValues })
  const draft = useFormDraft({ watch, reset, initialValues })
  const closeImageViewer = useCallback(() => setImageViewerOpen(false), [])

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const submit = draft.submitWithDraft(async (values) => {
    setSaving(true)
    setServerError('')
    try {
      const result = await savePortfolioProfile(values, imageFile, resumeFile)
      setImageFile(null)
      setImagePreview('')
      setImageError('')
      setResumeFile(null)
      setResumeError('')
      reset({ ...EMPTY_PROFILE, ...(result.data || {}), profileImageAction: 'keep', resumeAction: 'keep' })
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (resumeInputRef.current) resumeInputRef.current.value = ''
      return true
    } catch (requestError) {
      setServerError(requestError.message)
      return false
    } finally {
      setSaving(false)
    }
  })

  const field = (name, label, placeholder, type = 'text', digitsOnly = false) => {
    const registration = register(name)
    return (
      <label className="text-sm font-semibold text-[#555]">
        {label}
        <input
          type={type}
          {...registration}
          inputMode={digitsOnly ? 'numeric' : undefined}
          maxLength={digitsOnly ? 15 : undefined}
          onChange={digitsOnly ? (event) => {
            event.target.value = event.target.value.replace(/\D/g, '').slice(0, 15)
            registration.onChange(event)
          } : registration.onChange}
          className={FORM_INPUT_CLASS}
          placeholder={placeholder}
        />
        <FieldError message={errors[name]?.message} />
      </label>
    )
  }

  const linkField = (name, label, placeholder, Icon, visibilityName) => {
    const registration = register(name)
    return (
      <div>
        <label className="text-sm font-semibold text-[#555]">{label}<span className="relative mt-1.5 block"><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#888]" aria-hidden="true" /><input type="url" {...registration} className={`${FORM_INPUT_CLASS} mt-0 pl-10`} placeholder={placeholder} /></span></label>
        <FieldError message={errors[name]?.message} />
        <label className="mt-2 flex w-fit items-center gap-2 text-xs font-medium text-[#777]"><input type="checkbox" {...register(visibilityName)} className="size-4 accent-[#f36b4c]" /> Show publicly</label>
      </div>
    )
  }

  const profileImageUrl = watch('profileImageUrl')
  const profileImageAction = watch('profileImageAction')
  const resumeUrl = watch('resumeUrl')
  const resumeAction = watch('resumeAction')
  const previewUrl = imagePreview || (profileImageAction !== 'remove' ? resolvePortfolioImageUrl(profileImageUrl) : '')
  const imageUrlRegistration = register('profileImageUrl')
  const resumeUrlRegistration = register('resumeUrl')

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setImageError('Choose a JPG, PNG, WEBP, or GIF image')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image cannot exceed 5 MB')
      event.target.value = ''
      return
    }
    setImageError('')
    setImageViewerOpen(false)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setValue('profileImageUrl', '', { shouldDirty: true })
    setValue('profileImageAction', 'upload', { shouldDirty: true })
  }

  const useImageUrl = (event) => {
    imageUrlRegistration.onChange(event)
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setImageViewerOpen(false)
    setValue('profileImageAction', event.target.value ? 'url' : 'remove', { shouldDirty: true })
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setImageViewerOpen(false)
    setValue('profileImageUrl', '', { shouldDirty: true })
    setValue('profileImageAction', 'remove', { shouldDirty: true })
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const restoreImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setImageViewerOpen(false)
    setValue('profileImageUrl', initialValues.profileImageUrl || '', { shouldDirty: true })
    setValue('profileImageAction', 'keep', { shouldDirty: true })
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const chooseResume = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Choose a PDF file')
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeError('Resume PDF cannot exceed 10 MB')
      event.target.value = ''
      return
    }
    setResumeError('')
    setResumeFile(file)
    setValue('resumeUrl', '', { shouldDirty: true })
    setValue('resumeAction', 'upload', { shouldDirty: true })
  }

  const useResumeUrl = (event) => {
    resumeUrlRegistration.onChange(event)
    setResumeFile(null)
    setResumeError('')
    setValue('resumeAction', event.target.value ? 'url' : 'remove', { shouldDirty: true })
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  const removeResume = () => {
    setResumeFile(null)
    setResumeError('')
    setValue('resumeUrl', '', { shouldDirty: true })
    setValue('resumeAction', 'remove', { shouldDirty: true })
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  const restoreResume = () => {
    setResumeFile(null)
    setResumeError('')
    setValue('resumeUrl', initialValues.resumeUrl || '', { shouldDirty: true })
    setValue('resumeAction', 'keep', { shouldDirty: true })
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      <DraftStatus {...draft} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Section icon={FiUser} title="Introduction" description="This content introduces you at the top of your public portfolio.">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('fullName', 'Full name', 'Enter your full name')}
            {field('professionalTitle', 'Professional title', 'Enter your main role or specialisation')}
            {field('availabilityText', 'Availability message', 'Enter your current availability')}
            <label className="text-sm font-semibold text-[#555] sm:col-span-2">Short introduction<textarea rows="3" {...register('shortBio')} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Write a short introduction for the hero section" /><FieldError message={errors.shortBio?.message} /></label>
            <label className="text-sm font-semibold text-[#555] sm:col-span-2">About<textarea rows="8" {...register('about')} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Explain your background, strengths, and the work you enjoy" /><FieldError message={errors.about?.message} /></label>
          </div>
        </Section>

        <section className="self-start overflow-hidden rounded-lg bg-white p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-semibold text-[#333]">Profile image</h2>
            <p className="mt-1 text-xs leading-5 text-[#888]">JPG, PNG, WEBP, or GIF · Maximum 5 MB</p>
          </div>

          {previewUrl ? <div className="mt-3">
            <button type="button" onClick={() => setImageViewerOpen(true)} className="block w-full rounded-md outline-none ring-primary/20 focus-visible:ring-3" aria-label="Open large profile image preview" title="View image">
              <img key={previewUrl} src={previewUrl} alt="Profile preview" className="aspect-video w-full rounded-md bg-[#f4f3f1] object-cover" />
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3 py-2 text-xs font-semibold text-[#555] hover:bg-[#f7f7f7]"><FiUploadCloud aria-hidden="true" /> Replace<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only" /></label>
              <button type="button" onClick={removeImage} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"><FiTrash2 aria-hidden="true" /> Remove</button>
            </div>
          </div> : <label className="mt-3 flex aspect-video cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d5d1cc] bg-[#faf9f7] px-4 text-center transition hover:border-primary/50 hover:bg-primary-light/30">
            <span className="grid size-10 place-items-center rounded-md bg-white text-xl text-primary-dark shadow-sm"><FiImage aria-hidden="true" /></span>
            <span className="mt-3 text-sm font-semibold text-[#444]">Choose profile image</span>
            <span className="mt-1 text-xs text-[#888]">Tap to upload from this device</span>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only" />
          </label>}

          {profileImageAction === 'remove' && initialValues.profileImageUrl && <button type="button" onClick={restoreImage} className="mt-3 w-full text-center text-xs font-semibold text-primary-dark hover:underline">Keep current image</button>}
          <label className="mt-4 block text-xs font-semibold text-[#555]">Or use image URL<input type="url" {...imageUrlRegistration} onChange={useImageUrl} className={`${FORM_INPUT_CLASS} min-h-10`} placeholder="https://example.com/image.jpg" /></label>
          <FieldError message={errors.profileImageUrl?.message} />
          {imageError && <p role="alert" className="mt-2 text-xs font-normal text-red-500">{imageError}</p>}
          <p className="mt-3 text-[11px] leading-5 text-[#999]">The image is uploaded when you save the profile.</p>
        </section>
      </div>

      <Section icon={FiMail} title="Contact information" description="Public contact details and WhatsApp settings shown on your portfolio.">
        <div className="grid gap-4 sm:grid-cols-2">
          {field('email', 'Email', 'Enter public email address', 'email')}
          {field('phone', 'Mobile number', 'Enter digits only', 'tel', true)}
          <label className="text-sm font-semibold text-[#555]">Location<input {...register('location')} className={FORM_INPUT_CLASS} placeholder="City, state, country" /><span className="mt-1.5 block text-xs font-normal text-[#888]">Example: Udaipur, Rajasthan, India</span><FieldError message={errors.location?.message} /></label>
          <div>
            {field('whatsappNumber', 'WhatsApp number', 'Enter digits with country code', 'tel', true)}
            <p className="mt-1.5 text-xs leading-5 text-[#888]">Example: 919876543210</p>
          </div>
          <label className="text-sm font-semibold text-[#555] sm:col-span-2">Default WhatsApp message<textarea rows="3" {...register('whatsappMessage')} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Enter the message visitors can send" /><FieldError message={errors.whatsappMessage?.message} /></label>
        </div>
      </Section>

      <Section icon={FiFileText} title="Resume" description="Upload your public resume or use an existing PDF address.">
        <div>
          <div className="rounded-md bg-[#faf9f7] p-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-lg text-primary-dark"><FiFileText aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#333]">Resume PDF</p>
                  <p className="mt-0.5 truncate text-xs text-[#888]">{resumeFile?.name || ((resumeUrl && resumeAction !== 'remove') ? 'Resume is ready' : 'PDF only · Maximum 10 MB')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeUrl && resumeAction !== 'remove' && <a href={resumeUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-xs font-semibold text-[#555] hover:bg-[#f2f1ef]"><FiExternalLink aria-hidden="true" /> View</a>}
                <label className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#d8d4cf] bg-white px-3 text-xs font-semibold text-[#555] hover:bg-[#f2f1ef]"><FiUploadCloud aria-hidden="true" /> {resumeFile || resumeUrl ? 'Replace PDF' : 'Upload PDF'}<input ref={resumeInputRef} type="file" accept="application/pdf,.pdf" onChange={chooseResume} className="sr-only" /></label>
                {(resumeFile || (resumeUrl && resumeAction !== 'remove')) && <button type="button" onClick={removeResume} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100"><FiTrash2 aria-hidden="true" /> Remove</button>}
                {resumeAction === 'remove' && initialValues.resumeUrl && <button type="button" onClick={restoreResume} className="min-h-9 rounded-md px-3 text-xs font-semibold text-primary-dark hover:bg-primary-light">Keep current PDF</button>}
              </div>
            </div>
            <label className="mt-3 block text-xs font-semibold text-[#555]">Or use Resume URL<span className="relative mt-1.5 block"><FiFileText className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#888]" aria-hidden="true" /><input type="url" {...resumeUrlRegistration} onChange={useResumeUrl} className={`${FORM_INPUT_CLASS} mt-0 min-h-10 pl-10`} placeholder="Enter public resume address" /></span></label>
            <FieldError message={errors.resumeUrl?.message} />
            {resumeError && <p role="alert" className="mt-2 text-xs font-normal text-red-500">{resumeError}</p>}
          </div>
        </div>
      </Section>

      <Section icon={FiExternalLink} title="Social links" description="Add the public profiles visitors can open from your portfolio.">
        <div className="grid gap-4 sm:grid-cols-2">
          {linkField('githubUrl', 'GitHub URL', 'Enter GitHub profile address', FaGithub, 'showGithub')}
          {linkField('linkedinUrl', 'LinkedIn URL', 'Enter LinkedIn profile address', FaLinkedin, 'showLinkedin')}
          {linkField('instagramUrl', 'Instagram URL', 'Enter Instagram profile address', FaInstagram, 'showInstagram')}
          {linkField('xUrl', 'X / Twitter URL', 'Enter X profile address', FaXTwitter, 'showX')}
        </div>
      </Section>

      <ServerError message={serverError} />
      <div className="flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"><FiSave /> {saving ? 'Saving...' : 'Save profile'}</button></div>
      <ImageViewer open={imageViewerOpen} src={previewUrl} onClose={closeImageViewer} />
    </form>
  )
}

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const loadProfile = useCallback(async () => {
    setError('')
    setLoaded(false)
    try { setProfile((await getPortfolioProfile()).data) } catch (requestError) { setError(requestError.message) } finally { setLoaded(true) }
  }, [])
  useEffect(() => { loadProfile() }, [loadProfile])
  if (!loaded) return <LoadingState label="Loading portfolio profile" />
  if (error) return <ErrorState message={error} onRetry={loadProfile} backTo="/portfolio" backLabel="Portfolio overview" />
  return <div className="space-y-3"><PageHeader title="Profile" description="Manage your public introduction, contact details, resume, and social links.">{PORTFOLIO_SITE_URL && <a href={PORTFOLIO_SITE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3.5 py-2 text-sm font-medium text-[#555] hover:bg-[#f7f7f7]">View live profile <FiExternalLink /></a>}</PageHeader><ProfileForm initialValues={{ ...EMPTY_PROFILE, ...(profile || {}), profileImageAction: 'keep', resumeAction: 'keep' }} /></div>
}

export default Profile
