const StatCard = ({ title, value, icon: Icon, description, tone = 'coral' }) => {
  const tones = { coral: 'bg-[#fff0ec] text-primary-dark', blue: 'bg-[#edf3f9] text-[#315f91]', green: 'bg-[#edf5f0] text-[#2f684f]', purple: 'bg-[#f4f0fa] text-[#654b91]' }
  return (
    <div className="rounded-lg border border-[#e3e0dc] bg-white p-4 shadow-[0_3px_12px_rgba(44,38,34,0.045)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-medium text-[#777]">{title}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#202020]">{value}</p></div>
        <span className={`grid size-9 place-items-center rounded-md ${tones[tone] || tones.coral}`}><Icon aria-hidden="true" /></span>
      </div>
      {description && <p className="mt-3 text-xs leading-5 text-[#8a8a8a]">{description}</p>}
    </div>
  )
}

export default StatCard
