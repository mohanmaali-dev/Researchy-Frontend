export const FORM_INPUT_CLASS =
  'mt-1.5 min-h-12 w-full rounded-md border border-[#dedbd7] bg-[#faf9f7] px-3.5 py-2.5 text-sm font-normal text-[#242424] outline-none transition placeholder:text-[#999] hover:border-[#cfcbc6] focus:border-primary focus:bg-white focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-[#efefed] disabled:text-[#888]'

export function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-normal leading-5 text-red-500" aria-live="polite">{message}</p>
}

export function ServerError({ message }) {
  if (!message) return null
  return <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm font-normal leading-5 text-red-600">{message}</p>
}
