const components = [
  ['pain', 'Pain'],
  ['frequency', 'Frequency'],
  ['impact', 'Financial / time impact'],
  ['willingness', 'Willingness to pay'],
  ['repeatedDemand', 'Repeated demand'],
  ['ease', 'Ease of solution'],
]

function ScoreBreakdown({ breakdown, total }) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-[0_2px_10px_rgba(44,38,34,0.05)]">
      <div className="bg-[#faf9f8] p-3.5 sm:p-5">
        <h2 className="text-lg font-semibold text-[#292929]">Score breakdown</h2>
        <p className="mt-1 text-xs leading-5 text-[#777] sm:text-sm">How the current problem data builds this score.</p>
      </div>
      <div className="divide-y divide-[#efedeb]">
        {components.map(([key, label]) => {
          const component = breakdown[key]
          const percentage = component.max ? (component.score / component.max) * 100 : 0

          return (
            <div key={key} className="px-3.5 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#444]">{label}</p>
                  <p className="mt-0.5 text-xs leading-4 text-[#888]">{component.reason}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary-dark">{component.score}/{component.max}</p>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#eeeae7]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between bg-primary-light px-3.5 py-3.5 text-primary-dark sm:px-5 sm:py-4">
        <span className="text-sm font-semibold">Total opportunity score</span>
        <span className="text-xl font-semibold sm:text-2xl">{total}/100</span>
      </div>
      <p className="bg-primary-light/50 px-3.5 py-3 text-xs leading-5 text-[#666] sm:px-5 sm:py-4">
        This score is only a prioritization tool—not proof that the opportunity is good. Continue researching any opportunity regardless of its score.
      </p>
    </section>
  )
}

export default ScoreBreakdown
