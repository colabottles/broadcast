export interface Platform {
  id: string
  name: string
  charLimit: number
  tagFormat: string
  hashtagSymbol: string
  mentionSymbol: string
  urlShortening: boolean
  supportsMarkdown: boolean
}

export const usePlatforms = () => {
  const platforms: Platform[] = [
    {
      id: 'twitter',
      name: 'Twitter/X',
      charLimit: 280,
      tagFormat: 'Hashtags (#tag)',
      hashtagSymbol: '#',
      mentionSymbol: '@',
      urlShortening: true,
      supportsMarkdown: false
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      charLimit: 300,
      tagFormat: 'Hashtags (#tag)',
      hashtagSymbol: '#',
      mentionSymbol: '@',
      urlShortening: false,
      supportsMarkdown: false
    },
    {
      id: 'mastodon',
      name: 'Mastodon',
      charLimit: 500,
      tagFormat: 'Hashtags (#tag)',
      hashtagSymbol: '#',
      mentionSymbol: '@',
      urlShortening: false,
      supportsMarkdown: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      charLimit: 3000,
      tagFormat: 'Hashtags (#tag)',
      hashtagSymbol: '#',
      mentionSymbol: '@',
      urlShortening: false,
      supportsMarkdown: false
    },
    {
      id: 'threads',
      name: 'Threads',
      charLimit: 500,
      tagFormat: 'Hashtags (#tag)',
      hashtagSymbol: '#',
      mentionSymbol: '@',
      urlShortening: false,
      supportsMarkdown: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      charLimit: 63206,
      tagFormat: 'Hashtags (#tag)',
      hashtagSymbol: '#',
      mentionSymbol: '@',
      urlShortening: false,
      supportsMarkdown: false
    }
  ]

  const getPlatformById = (id: string): Platform | undefined => {
    return platforms.find(p => p.id === id)
  }

  const formatTagsForPlatform = (tags: string[], platformId: string): string => {
    const platform = getPlatformById(platformId)
    if (!platform) return ''

    return tags
      .map(tag => {
        const cleanTag = tag.replace(/^[#@]/, '')
        return `${platform.hashtagSymbol}${cleanTag}`
      })
      .join(' ')
  }

  const getMaxCharLimit = (selectedPlatformIds: string[]): number => {
    if (selectedPlatformIds.length === 0) return 0
    
    const selectedPlatforms = selectedPlatformIds
      .map(id => getPlatformById(id))
      .filter(Boolean) as Platform[]
    
    return Math.min(...selectedPlatforms.map(p => p.charLimit))
  }

  const truncateForPlatform = (content: string, platformId: string): string => {
    const platform = getPlatformById(platformId)
    if (!platform) return content

    if (content.length <= platform.charLimit) {
      return content
    }

    // Truncate and add ellipsis
    return content.substring(0, platform.charLimit - 3) + '...'
  }

  return {
    platforms,
    getPlatformById,
    formatTagsForPlatform,
    getMaxCharLimit,
    truncateForPlatform
  }
}
