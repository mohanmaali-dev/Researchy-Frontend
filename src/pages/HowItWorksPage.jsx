import {
  FiAlertCircle,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiMessageSquare,
  FiMousePointer,
  FiPlus,
  FiRepeat,
  FiStar,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const steps = [
  {
    number: 1,
    title: 'Add the business',
    instruction: 'First, save the basic details of the business you visited or researched.',
    example: 'Sharma Hardware · Retail store · Ahmedabad · Contact: Rajesh Sharma',
    help: 'Click “Add business” and fill in the form.',
    path: ['Left sidebar', 'Businesses', 'Add business'],
    screen: 'Businesses',
    section: 'Your saved businesses',
    action: 'Add business',
    fields: ['Company details', 'Contact details', 'Visit date and status'],
    icon: FiBriefcase,
  },
  {
    number: 2,
    title: 'Add your conversation',
    instruction: 'Open the Business Details page and record what the person told you.',
    example: '14 Aug 2026 · Spoke with Rajesh Sharma, Owner',
    help: 'Click “Add conversation” on the Business Details page.',
    path: ['Businesses', 'Open Sharma Hardware', 'Add conversation'],
    screen: 'Sharma Hardware',
    section: 'Conversations and visits',
    action: 'Add conversation',
    fields: ['Conversation date', 'Person name and role', 'Conversation notes'],
    rule: 'A Conversation is created inside a Business. You will not find it as a separate sidebar button.',
    icon: FiMessageSquare,
  },
  {
    number: 3,
    title: 'Write the problems you found',
    instruction: 'Open that Conversation and add each important problem separately.',
    example: 'Problem: Making one customer quotation takes about 30 minutes.',
    help: 'Click “Add problem” and include the pain level, time impact, and current process.',
    path: ['Open a business conversation', 'Problems discovered', 'Add problem'],
    screen: 'Conversation with Rajesh',
    section: 'Problems discovered',
    action: 'Add problem',
    fields: ['Problem title and current process', 'Choose suggested tags or type a tag and press Enter', 'Pain level, frequency, time impact, and willingness to pay'],
    rule: 'A Problem is created inside a Conversation because it must be connected to the discussion where you found it.',
    icon: FiAlertCircle,
  },
  {
    number: 4,
    title: 'Mark a good problem as an opportunity',
    instruction: 'If the problem looks useful to solve, turn it into an Opportunity.',
    example: 'Opportunity: A simple quotation tool for local hardware shops.',
    help: 'Open the Problem and click “Mark as Opportunity”.',
    path: ['Open Quotation problem', 'Top-right action', 'Mark as Opportunity'],
    screen: 'Quotations take too long',
    section: 'Problem details',
    action: 'Mark as Opportunity',
    fields: ['Why it looks valuable', 'Market potential and difficulty', 'Validation status and notes'],
    rule: 'An Opportunity is created only from an existing Problem. Open the Problem first.',
    icon: FiStar,
  },
  {
    number: 5,
    title: 'Set the next follow-up',
    instruction: 'Add a reminder so you know whom to contact, when to contact them, and why.',
    example: '20 Aug 2026 · Ask Rajesh for two recent quotation samples.',
    help: 'Click “Add follow-up” from the Business, Conversation, or Opportunity page.',
    path: ['Open Business, Conversation, or Opportunity', 'Top-right action', 'Add follow-up'],
    screen: 'Sharma Hardware',
    section: 'Business details',
    action: 'Add follow-up',
    fields: ['Follow-up date', 'Reason for contacting them', 'Notes and status'],
    rule: 'You can create a Follow-up from a Business, Conversation, or Opportunity.',
    icon: FiClock,
  },
]

function ActionPreview({ step }) {
  const ActionIcon = step.number === 4 ? FiStar : step.number === 5 ? FiClock : FiPlus

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">Where to click</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#666]">
        {step.path.map((item, index) => (
          <span key={item} className="inline-flex items-center gap-1.5">
            <span className={index === step.path.length - 1 ? 'font-medium text-primary-dark' : ''}>
              {item}
            </span>
            {index < step.path.length - 1 && <FiArrowRight className="text-[#bbb]" aria-hidden="true" />}
          </span>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(86,72,66,0.06)]">
        <div className="flex items-center gap-1.5 bg-[#f3f1f0] px-3 py-2.5">
          <span className="size-1.5 rounded-full bg-[#d4d4d4]" />
          <span className="size-1.5 rounded-full bg-[#d4d4d4]" />
          <span className="size-1.5 rounded-full bg-[#d4d4d4]" />
          <span className="ml-2 truncate text-[10px] text-[#888]">{step.screen}</span>
        </div>
        <div className="flex min-h-24 items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-[10px] text-[#999]">Page section</p>
            <p className="mt-1 truncate text-sm font-medium text-[#333]">{step.section}</p>
          </div>
          <div className="relative shrink-0 pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[11px] font-medium text-white shadow-sm">
              <ActionIcon aria-hidden="true" /> {step.action}
            </span>
            <span className="absolute -bottom-0 right-1 flex items-center gap-1 text-[9px] font-medium text-primary-dark">
              <FiMousePointer aria-hidden="true" /> Click here
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HowItWorksPage() {
  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-[24px] bg-white p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3.5 py-2 text-xs font-medium text-primary-dark">
              <FiHelpCircle aria-hidden="true" /> Simple help guide
            </span>
            <h1 className="mt-4 text-3xl tracking-tight text-[#171717] sm:text-4xl">
              How to use Researchy
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#666] sm:text-base">
              Suppose you visit <span className="font-medium text-[#222]">Sharma Hardware in Ahmedabad</span>.
              Follow these five steps to save your research properly.
            </p>
          </div>
          <Link
            to="/businesses/new"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Add a business <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-2 rounded-[20px] bg-[#f7f7f7] p-3 sm:grid-cols-2 xl:grid-cols-5">
          {steps.map(({ number, title, icon: Icon }, index) => (
            <div key={number} className="flex items-center gap-2">
              <div className="flex min-h-20 flex-1 items-center gap-3 rounded-2xl bg-white px-3 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] text-[#999]">Step {number}</p>
                  <p className="mt-0.5 text-xs font-medium leading-5 text-[#333]">{title}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <FiArrowRight className="hidden shrink-0 text-[#aaa] xl:block" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-[24px] bg-white p-5 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl tracking-tight text-[#171717]">Step-by-step example</h2>
          <p className="mt-2 text-sm text-[#777]">Complete one step, then move to the next one.</p>

          <div className="mt-7 space-y-3">
            {steps.map((step) => {
              const { number, title, instruction, example, help, fields, rule, icon: Icon } = step

              return (
              <article
                key={number}
                className="grid gap-5 rounded-[20px] bg-[#f7f6f5] p-5 lg:grid-cols-[3rem_minmax(0,0.9fr)_minmax(20rem,1fr)] lg:items-center"
              >
                <span className="grid size-11 place-items-center rounded-full bg-white text-primary-dark shadow-[0_3px_12px_rgba(86,72,66,0.06)]">
                  <Icon aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-medium text-primary-dark">Step {number}</p>
                  <h3 className="mt-1 text-lg text-[#222]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#666]">{instruction}</p>
                  <p className="mt-2 text-xs leading-5 text-[#888]">{help}</p>

                  {rule && (
                    <p className="mt-3 rounded-xl bg-primary-light px-3.5 py-3 text-xs leading-5 text-[#755046]">
                      <span className="font-medium text-primary-dark">Important:</span> {rule}
                    </p>
                  )}

                  <div className="mt-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">What to fill</p>
                    <ul className="mt-2 space-y-1.5">
                      {fields.map((field) => (
                        <li key={field} className="flex gap-2 text-xs leading-5 text-[#666]">
                          <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-4 rounded-xl bg-white px-3.5 py-3 text-xs leading-5 text-[#555]">
                    <span className="font-medium text-[#333]">Example:</span> {example}
                  </p>
                </div>

                <ActionPreview step={step} />
              </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[24px] bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#eef6f2] text-emerald-700">
              <FiRepeat aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl tracking-tight">What happens automatically?</h2>
              <p className="mt-1 text-sm leading-6 text-[#777]">You enter the research. Researchy keeps the useful summary ready.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              'Similar tags show which problems appear across different businesses.',
              'Opportunity scores help you decide what to research first.',
              'Pending follow-ups become overdue when their date has passed.',
              'The Dashboard shows your latest research and important actions.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-[#f7f7f7] p-4 text-sm leading-6 text-[#555]">
                <FiCheckCircle className="mt-1 shrink-0 text-emerald-600" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[24px] bg-[#fff4ef] p-6 sm:p-8">
          <FiStar className="text-xl text-primary-dark" aria-hidden="true" />
          <h2 className="mt-4 text-xl tracking-tight">Remember</h2>
          <p className="mt-3 text-sm leading-7 text-[#6d625f]">
            A high Opportunity score does not guarantee a good business idea. Talk to more businesses and collect real proof before making a decision.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-dark"
          >
            Go to dashboard <FiArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </section>
    </main>
  )
}

export default HowItWorksPage
