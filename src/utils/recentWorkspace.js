const STORAGE_PREFIX = 'enter_manage_recent_workspace_'

const pageDetails = (pathname) => {
  if (
    pathname.endsWith('/new') ||
    pathname.endsWith('/edit') ||
    pathname.includes('/demo-data') ||
    pathname === '/how-it-works' ||
    pathname === '/sessions'
  ) {
    return null
  }

  if (pathname === '/dashboard') return { section: 'Business', page: 'Business overview' }
  if (pathname === '/businesses') return { section: 'Business', page: 'Businesses' }
  if (/^\/businesses\/[^/]+$/.test(pathname)) return { section: 'Business', page: 'Business details' }
  if (/^\/conversations\/[^/]+$/.test(pathname)) return { section: 'Business', page: 'Conversation details' }
  if (/^\/problems\/[^/]+$/.test(pathname)) return { section: 'Business', page: 'Problem details' }
  if (pathname === '/problem-patterns') return { section: 'Business', page: 'Problem patterns' }
  if (pathname.startsWith('/problem-patterns/details/')) return { section: 'Business', page: 'Pattern details' }
  if (pathname === '/opportunities') return { section: 'Business', page: 'Opportunities' }
  if (/^\/opportunities\/[^/]+$/.test(pathname)) return { section: 'Business', page: 'Opportunity details' }
  if (pathname === '/follow-ups') return { section: 'Business', page: 'Follow-ups' }
  if (/^\/follow-ups\/[^/]+$/.test(pathname)) return { section: 'Business', page: 'Follow-up details' }

  if (pathname === '/contacts') return { section: 'Contacts', page: 'Contacts' }
  if (/^\/contacts\/[^/]+$/.test(pathname)) return { section: 'Contacts', page: 'Contact details' }

  if (pathname === '/learning') return { section: 'Learning', page: 'Learning overview' }
  if (pathname === '/learning/topics') return { section: 'Learning', page: 'Learning topics' }
  if (/^\/learning\/topics\/[^/]+$/.test(pathname)) return { section: 'Learning', page: 'Topic details' }
  if (pathname === '/learning/resources') return { section: 'Learning', page: 'Learning resources' }
  if (pathname === '/learning/questions') return { section: 'Learning', page: 'Learning questions' }
  if (pathname === '/learning/takeaways') return { section: 'Learning', page: 'Key takeaways' }
  if (pathname === '/learning/archived') return { section: 'Learning', page: 'Archived topics' }
  if (/^\/learning\/(entries|resources|practice|questions)\/[^/]+$/.test(pathname)) {
    return { section: 'Learning', page: 'Learning details' }
  }

  if (pathname === '/notes') return { section: 'Notes', page: 'My notes' }
  if (/^\/notes\/[^/]+$/.test(pathname)) return { section: 'Notes', page: 'Note editor' }

  if (pathname === '/portfolio') return { section: 'Portfolio', page: 'Portfolio overview' }
  if (pathname === '/portfolio/projects') return { section: 'Portfolio', page: 'Portfolio projects' }
  if (pathname === '/portfolio/skills') return { section: 'Portfolio', page: 'Portfolio skills' }
  if (pathname === '/portfolio/experience') return { section: 'Portfolio', page: 'Portfolio experience' }
  if (pathname === '/portfolio/profile') return { section: 'Portfolio', page: 'Portfolio profile' }
  if (pathname === '/portfolio/contact') return { section: 'Portfolio', page: 'Contact messages' }
  if (pathname === '/portfolio/preview') return { section: 'Portfolio', page: 'Portfolio preview' }

  return null
}

const storageKey = (userId) => `${STORAGE_PREFIX}${userId || 'workspace'}`

export const rememberWorkspacePage = (pathname, userId) => {
  const details = pageDetails(pathname)
  if (!details) return

  try {
    window.localStorage.setItem(
      storageKey(userId),
      JSON.stringify({ ...details, path: pathname, savedAt: Date.now() }),
    )
  } catch {
    // Remembering the last page is optional when browser storage is unavailable.
  }
}

export const getRecentWorkspace = (userId) => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey(userId)))
    return saved?.path && saved?.section && saved?.page ? saved : null
  } catch {
    return null
  }
}
