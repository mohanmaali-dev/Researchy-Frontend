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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
        <h2 className="text-xl font-bold">Score breakdown</h2>
        <p className="mt-1 text-sm text-slate-500">A transparent prioritization score using the current Problem data.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {components.map(([key, label]) => {
          const component = breakdown[key]
          const percentage = component.max ? (component.score / component.max) * 100 : 0

          return (
            <div key={key} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800">{label}</p>
                  <p className="mt-1 text-xs text-slate-500">{component.reason}</p>
                </div>
                <p className="shrink-0 font-bold text-primary-dark">{component.score}/{component.max}</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between bg-primary-light px-5 py-4 text-primary-dark">
        <span className="font-bold">Total opportunity score</span>
        <span className="text-2xl font-bold">{total}/100</span>
      </div>
      <p className="border-t border-primary/10 bg-primary-light/50 px-5 py-4 text-xs leading-5 text-slate-600">
        This score is only a prioritization tool—not proof that the opportunity is good. Continue researching any opportunity regardless of its score.
      </p>
    </section>
  )
}

export default ScoreBreakdown
