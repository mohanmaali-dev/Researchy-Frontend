export const NAVIGATION_REQUEST_EVENT = 'workspace:navigation-request'

export function requestNavigation(proceed) {
  const event = new CustomEvent(NAVIGATION_REQUEST_EVENT, {
    cancelable: true,
    detail: { proceed },
  })
  if (document.dispatchEvent(event)) proceed()
}
