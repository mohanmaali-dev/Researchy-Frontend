function DateInput({ className = '', onClick, ...props }) {
  const handleClick = (event) => {
    onClick?.(event)

    if (!event.defaultPrevented && !event.currentTarget.disabled && !event.currentTarget.readOnly) {
      event.currentTarget.showPicker?.()
    }
  }

  return (
    <input
      {...props}
      type="date"
      onClick={handleClick}
      className={`${className} cursor-pointer`}
    />
  )
}

export default DateInput
