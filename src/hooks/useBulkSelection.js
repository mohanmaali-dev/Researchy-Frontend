import { useEffect, useMemo, useState } from 'react'

export const useBulkSelection = (items = []) => {
  const visibleIds = useMemo(() => items.map((item) => String(item._id)), [items])
  const [selected, setSelected] = useState(() => new Set())

  useEffect(() => {
    const visible = new Set(visibleIds)
    setSelected((current) => new Set([...current].filter((id) => visible.has(id))))
  }, [visibleIds])

  const toggle = (id) => setSelected((current) => {
    const next = new Set(current)
    const key = String(id)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visibleIds))
  const clear = () => setSelected(new Set())

  return { selected, selectedIds: [...selected], allSelected, toggle, toggleAll, clear, visibleCount: visibleIds.length }
}
