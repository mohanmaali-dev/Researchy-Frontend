import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiArrowLeft, FiImage, FiSave, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import DraftStatus from '../../components/ui/DraftStatus.jsx'
import { FieldError, FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import FormSelect from '../../components/ui/FormSelect.jsx'
import { useFormDraft } from '../../hooks/useFormDraft.js'
import { createPortfolioProject, getPortfolioProject, resolvePortfolioImageUrl, updatePortfolioProject } from '../../services/portfolio.service.js'

const optionalUrl = z.string().trim().max(1000, 'Web address is too long').refine((value) => !value || /^https?:\/\//i.test(value), 'Enter a full web address beginning with http:// or https://')
const projectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required').max(180, 'Project title is too long'),
  shortDescription: z.string().trim().min(1, 'Short description is required').max(400, 'Short description is too long'),
  description: z.string().trim().max(15000, 'Description is too long'),
  technologies: z.string().trim(),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  imageUrl: z.string(),
  imageAction: z.enum(['keep', 'replace', 'remove']),
  status: z.enum(['Draft', 'Published']),
  featured: z.boolean(),
  displayOrder: z.coerce.number().int('Display order must be a whole number').min(0).max(9999),
})

const EMPTY_PROJECT = { title: '', shortDescription: '', description: '', technologies: '', githubUrl: '', liveUrl: '', imageUrl: '', imageAction: 'keep', status: 'Draft', featured: false, displayOrder: 0 }

function ProjectForm({ projectId, initialValues }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const imageInputRef = useRef(null)
  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema), defaultValues: initialValues })
  const draft = useFormDraft({ watch, reset, initialValues })

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const submit = draft.submitWithDraft(async (values) => {
    setSaving(true); setServerError('')
    try {
      const data = { ...values, technologies: values.technologies.split(',').map((item) => item.trim()).filter(Boolean) }
      await (projectId ? updatePortfolioProject(projectId, data, imageFile) : createPortfolioProject(data, imageFile))
      navigate('/portfolio/projects')
      return true
    } catch (requestError) { setServerError(requestError.message); return false } finally { setSaving(false) }
  })

  const imageUrl = watch('imageUrl')
  const imageAction = watch('imageAction')
  const previewUrl = imagePreview || (imageAction === 'keep' ? resolvePortfolioImageUrl(imageUrl) : '')
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
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setValue('imageAction', 'replace', { shouldDirty: true })
  }
  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setValue('imageAction', imageUrl ? 'remove' : 'keep', { shouldDirty: Boolean(imageUrl) })
    if (imageInputRef.current) imageInputRef.current.value = ''
  }
  const restoreImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setValue('imageAction', 'keep', { shouldDirty: true })
    if (imageInputRef.current) imageInputRef.current.value = ''
  }
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      <DraftStatus {...draft} />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-3">
          <section className="rounded-lg bg-white p-4 sm:p-6">
            <div><h2 className="text-base font-semibold text-[#292929]">Project information</h2><p className="mt-1 text-xs leading-5 text-[#777]">Use a clear title and explain the value of the work.</p></div>
            <div className="mt-5 grid gap-4">
              <label className="text-sm font-semibold text-[#555]">Project title <span className="text-red-500">*</span><input {...register('title')} className={FORM_INPUT_CLASS} placeholder="Enter project title" /><FieldError message={errors.title?.message} /></label>
              <label className="text-sm font-semibold text-[#555]">Short description <span className="text-red-500">*</span><input {...register('shortDescription')} className={FORM_INPUT_CLASS} placeholder="Summarise the project in one sentence" /><FieldError message={errors.shortDescription?.message} /></label>
              <label className="text-sm font-semibold text-[#555]">Full description<textarea {...register('description')} rows="7" className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Explain the problem, your solution, and important results" /><FieldError message={errors.description?.message} /></label>
            </div>
          </section>
          <section className="rounded-lg bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[#292929]">Technology and links</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-[#555] sm:col-span-2">Technologies<input {...register('technologies')} className={FORM_INPUT_CLASS} placeholder="Separate technologies with commas" /><span className="mt-1.5 block text-xs font-normal text-[#888]">Example: React, Node.js, MongoDB</span></label>
              <label className="text-sm font-semibold text-[#555]">GitHub URL<input {...register('githubUrl')} className={FORM_INPUT_CLASS} placeholder="Enter repository web address" /><FieldError message={errors.githubUrl?.message} /></label>
              <label className="text-sm font-semibold text-[#555]">Live website URL<input {...register('liveUrl')} className={FORM_INPUT_CLASS} placeholder="Enter live website address" /><FieldError message={errors.liveUrl?.message} /></label>
              <input type="hidden" {...register('imageUrl')} />
              <input type="hidden" {...register('imageAction')} />
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <section className="rounded-lg bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-[#333]">Publishing</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-semibold text-[#555]">Status<FormSelect name="status" control={control} options={['Draft', 'Published']} className="mt-1.5" /><FieldError message={errors.status?.message} /></label>
              <label className="block text-sm font-semibold text-[#555]">Display order<input type="number" min="0" max="9999" {...register('displayOrder')} className={FORM_INPUT_CLASS} /><FieldError message={errors.displayOrder?.message} /></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-md bg-[#faf9f7] p-3"><input type="checkbox" {...register('featured')} className="mt-0.5 size-4 accent-[#f36b4c]" /><span><span className="block text-sm font-semibold text-[#444]">Featured project</span><span className="mt-0.5 block text-xs leading-5 text-[#888]">Highlight this project on the public site.</span></span></label>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg bg-white p-4 sm:p-5">
            <div><h2 className="text-sm font-semibold text-[#333]">Project image</h2><p className="mt-1 text-xs leading-5 text-[#888]">JPG, PNG, WEBP, or GIF · Maximum 5 MB</p></div>
            {previewUrl ? (
              <div className="mt-3">
                <img key={previewUrl} src={previewUrl} alt="Project preview" className="aspect-video w-full rounded-md bg-[#f4f3f1] object-cover" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3 py-2 text-xs font-semibold text-[#555] hover:bg-[#f7f7f7]"><FiUploadCloud /> Replace<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only" /></label>
                  <button type="button" onClick={removeImage} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"><FiTrash2 /> Remove</button>
                </div>
              </div>
            ) : (
              <label className="mt-3 flex aspect-video cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d5d1cc] bg-[#faf9f7] px-4 text-center transition hover:border-primary/50 hover:bg-primary-light/30">
                <span className="grid size-10 place-items-center rounded-md bg-white text-xl text-primary-dark shadow-sm"><FiImage /></span>
                <span className="mt-3 text-sm font-semibold text-[#444]">Choose project image</span>
                <span className="mt-1 text-xs text-[#888]">Tap to upload from this device</span>
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only" />
              </label>
            )}
            {imageAction === 'remove' && imageUrl && <button type="button" onClick={restoreImage} className="mt-3 w-full text-center text-xs font-semibold text-primary-dark hover:underline">Keep current image</button>}
            {imageError && <p role="alert" className="mt-2 text-xs font-normal text-red-500">{imageError}</p>}
            <p className="mt-3 text-[11px] leading-5 text-[#999]">The image is uploaded when you save the project.</p>
          </section>
        </aside>
      </div>
      <ServerError message={serverError} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link to="/portfolio/projects" className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#555] hover:bg-[#f5f5f5]">Cancel</Link><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"><FiSave /> {saving ? 'Saving...' : projectId ? 'Save changes' : 'Create project'}</button></div>
    </form>
  )
}

function AddProject() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState('')
  const loadProject = useCallback(async () => {
    if (!id) return
    setLoading(true); setError('')
    try { setProject((await getPortfolioProject(id)).data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [id])
  useEffect(() => { loadProject() }, [loadProject])
  if (loading) return <LoadingState label="Loading project" />
  if (error) return <ErrorState message={error} onRetry={loadProject} backTo="/portfolio/projects" backLabel="Back to projects" />
  const values = project ? { ...EMPTY_PROJECT, ...project, technologies: project.technologies?.join(', ') || '' } : EMPTY_PROJECT
  return <div className="space-y-3"><PageHeader eyebrow={id ? 'Update portfolio' : 'New portfolio content'} title={id ? 'Edit project' : 'Add project'} description={id ? 'Update the content and publishing settings for this project.' : 'Add work that you want to present on your public portfolio.'}><Link to="/portfolio/projects" className="inline-flex items-center gap-2 rounded-md border border-[#ddd9d5] bg-white px-3.5 py-2 text-sm font-medium text-[#555] hover:bg-[#f7f7f7]"><FiArrowLeft /> Back to projects</Link></PageHeader><ProjectForm key={id || 'new'} projectId={id} initialValues={values} /></div>
}

export default AddProject
