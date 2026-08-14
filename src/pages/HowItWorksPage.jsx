import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiHelpCircle,
  FiMessageSquare,
  FiRepeat,
  FiStar,
  FiTag,
  FiUser,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const workflowSteps = [
  {
    number: '01',
    title: 'Add a business',
    description: 'Save the company, location, contact person, and your research status.',
    example: 'Example: BrightBuild Hardware in Surat.',
    icon: FiBriefcase,
  },
  {
    number: '02',
    title: 'Record a conversation',
    description: 'Open the Business page and save each call, visit, or interview.',
    example: 'Example: Spoke with Imran, the Sales Manager.',
    icon: FiMessageSquare,
  },
  {
    number: '03',
    title: 'Capture the problems',
    description: 'Add every important problem you discovered during that conversation.',
    example: 'Example: Preparing quotations takes 45 minutes.',
    icon: FiAlertCircle,
  },
  {
    number: '04',
    title: 'Add useful tags',
    description: 'Tags connect similar problems reported by different businesses.',
    example: 'Example: Quotation, Excel, and Manual Work.',
    icon: FiTag,
  },
  {
    number: '05',
    title: 'Create an opportunity',
    description: 'Mark a promising Problem as an Opportunity and review its score.',
    example: 'Example: A faster quotation tool may be worth researching.',
    icon: FiStar,
  },
  {
    number: '06',
    title: 'Plan a follow-up',
    description: 'Set the next action, date, and reason so nothing is forgotten.',
    example: 'Example: Ask for two recent quotations next Tuesday.',
    icon: FiClock,
  },
]

const pageGuides = [
  {
    title: 'Dashboard',
    description: 'A quick view of your research, strongest opportunities, patterns, and urgent follow-ups.',
    to: '/dashboard',
    action: 'Open dashboard',
    icon: FiGrid,
  },
  {
    title: 'Problem Patterns',
    description: 'Shows which tags or problem titles are being reported by multiple businesses.',
    to: '/problem-patterns',
    action: 'View patterns',
    icon: FiRepeat,
  },
  {
    title: 'Opportunities',
    description: 'Compares promising problems using a simple, transparent score from 0 to 100.',
    to: '/opportunities',
    action: 'View opportunities',
    icon: FiStar,
  },
  {
    title: 'Follow-ups',
    description: 'Shows upcoming, completed, cancelled, and overdue actions in one place.',
    to: '/follow-ups',
    action: 'View follow-ups',
    icon: FiClock,
  },
]

function HowItWorksPage() {
  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="overflow-hidden rounded-[24px] bg-white">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:p-10">
          <div className="self-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3.5 py-2 text-xs font-medium text-primary-dark">
              <FiHelpCircle aria-hidden="true" /> Simple project guide
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl tracking-[-0.035em] text-[#111] sm:text-4xl">
              Turn real business conversations into clear research opportunities.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#666] sm:text-base">
              Researchy keeps your work connected. Start with a Business, record what people say,
              capture their Problems, and follow the strongest ideas without losing the original context.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/businesses/new"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
              >
                Add your first business <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#dedede] px-5 py-3 text-sm font-medium text-[#333] transition hover:bg-[#f7f7f7]"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f7f7f7] p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#888]">How records connect</p>
            <div className="mt-5 space-y-2.5">
              {[
                { label: 'Business', detail: 'BrightBuild Hardware', icon: FiBriefcase },
                { label: 'Conversation', detail: 'Visit with the Sales Manager', icon: FiMessageSquare },
                { label: 'Problem', detail: 'Quotations take too long', icon: FiAlertCircle },
              ].map(({ label, detail, icon: Icon }, index) => (
                <div key={label}>
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
                      <Icon aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-[#888]">{label}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-[#222]">{detail}</p>
                    </div>
                  </div>
                  {index < 2 && <FiArrowDown className="mx-auto my-1.5 text-[#aaa]" aria-hidden="true" />}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-[#fff4ef] p-4">
                <FiStar className="text-primary-dark" aria-hidden="true" />
                <p className="mt-3 text-xs text-[#777]">Optional result</p>
                <p className="mt-1 text-sm font-medium text-[#222]">Opportunity</p>
              </div>
              <div className="rounded-2xl bg-[#eef8f3] p-4">
                <FiClock className="text-emerald-700" aria-hidden="true" />
                <p className="mt-3 text-xs text-[#777]">Next action</p>
                <p className="mt-1 text-sm font-medium text-[#222]">Follow-up</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-[24px] bg-white p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-dark">The workflow</p>
          <h2 className="mt-2 text-2xl tracking-tight text-[#171717]">Six simple steps from research to action</h2>
          <p className="mt-2 text-sm leading-6 text-[#777]">Use only the steps you need. You can keep researching even when an Opportunity score is low.</p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workflowSteps.map(({ number, title, description, example, icon: Icon }) => (
            <article key={number} className="rounded-[20px] border border-black/[0.05] bg-[#fafafa] p-5 transition hover:border-primary/20 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-white text-primary-dark ring-1 ring-black/[0.05]">
                  <Icon aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-[#aaa]">{number}</span>
              </div>
              <h3 className="mt-5 text-base text-[#202020]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#696969]">{description}</p>
              <p className="mt-4 rounded-xl bg-white px-3.5 py-3 text-xs leading-5 text-[#555] ring-1 ring-black/[0.04]">
                {example}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
        <div className="rounded-[24px] bg-white p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-dark">Complete example</p>
          <h2 className="mt-2 text-2xl tracking-tight">From one visit to a useful next step</h2>

          <div className="mt-6 space-y-3">
            {[
              ['1', 'You visit BrightBuild Hardware', 'Save the company and Imran, the Sales Manager, as the contact person.'],
              ['2', 'You record the conversation', 'Imran explains that staff copy prices from PDFs and Excel into every quotation.'],
              ['3', 'You add the problem', 'Title it “Quotations take too long,” set the pain level, impact, current process, and willingness to pay.'],
              ['4', 'The pattern becomes visible', 'Tags such as Quotation and Manual Work connect this problem with reports from other businesses.'],
              ['5', 'You mark it as an Opportunity', 'The score helps you compare it with other ideas. The score guides priority; it does not prove success.'],
              ['6', 'You create a Follow-up', 'Set a date to collect two real quotations and confirm what the business would pay for a solution.'],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-4 rounded-2xl bg-[#f8f8f8] p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#222] text-xs font-medium text-white">{number}</span>
                <div>
                  <h3 className="text-sm text-[#222]">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#6f6f6f]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[24px] bg-[#eef6f2] p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-full bg-white text-emerald-700 ring-1 ring-emerald-900/5">
            <FiBarChart2 aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl">What you learn</h2>
          <p className="mt-3 text-sm leading-7 text-[#617269]">After repeating this process across businesses, you can answer:</p>
          <ul className="mt-5 space-y-4">
            {[
              'Which problems appear repeatedly?',
              'Which opportunities deserve more research?',
              'Which business should I contact next?',
              'What evidence supports each idea?',
            ].map((question) => (
              <li key={question} className="flex gap-3 text-sm leading-6 text-[#34483e]">
                <FiCheckCircle className="mt-1 shrink-0 text-emerald-600" aria-hidden="true" />
                {question}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="mt-3 rounded-[24px] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-dark">Main pages</p>
            <h2 className="mt-2 text-2xl tracking-tight">Where to find each answer</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#777]">Each page has one clear job, so you can move through your research quickly.</p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pageGuides.map(({ title, description, to, action, icon: Icon }) => (
            <Link key={title} to={to} className="group flex min-h-56 flex-col rounded-[20px] bg-[#f7f7f7] p-5 transition hover:bg-[#f2f2f2]">
              <span className="grid size-10 place-items-center rounded-full bg-white text-[#333] ring-1 ring-black/[0.04]">
                <Icon aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base text-[#202020]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6c6c6c]">{description}</p>
              <span className="mt-auto flex items-center gap-2 pt-5 text-xs font-medium text-primary-dark">
                {action} <FiArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-3 flex flex-col gap-5 rounded-[24px] bg-[#fff4ef] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-primary-dark">
            <FiUser aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl tracking-tight">Ready to record your next visit?</h2>
            <p className="mt-1 text-sm leading-6 text-[#6d625f]">Start with the Business. You can add conversations and problems from its details page.</p>
          </div>
        </div>
        <Link to="/businesses/new" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark">
          Add business <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}

export default HowItWorksPage
