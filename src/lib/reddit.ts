const REDDIT_API = 'https://www.reddit.com'

export interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  subreddit: string
  url: string
  score: number
  num_comments: number
  created_utc: number
  permalink: string
}

export async function fetchSubredditPosts(
  subreddit: string,
  limit: number = 25
): Promise<RedditPost[]> {
  try {
    console.log(`Fetching from Reddit: r/${subreddit}`)
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IntentRadar/1.0 (AI Lead Detection)',
        },
      }
    )

    console.log(`Reddit response status: ${response.status}`)

    if (!response.ok) {
      console.error(`Reddit API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    
    if (!data?.data?.children) {
      console.log('No children in response')
      return []
    }

    const posts = data.data.children.map((child: { data: RedditPost }) => ({
      id: child.data.id,
      title: child.data.title,
      selftext: child.data.selftext,
      author: child.data.author,
      subreddit: child.data.subreddit,
      url: child.data.url,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      permalink: child.data.permalink,
    }))

    console.log(`Fetched ${posts.length} posts from r/${subreddit}`)
    return posts
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    return []
  }
}

export async function fetchRedditPosts(
  subreddits: string[],
  limit: number = 100
): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = []

  for (const subreddit of subreddits) {
    const posts = await fetchSubredditPosts(subreddit, limit)
    allPosts.push(...posts)
  }

  return allPosts.sort((a, b) => b.created_utc - a.created_utc)
}

export async function searchRedditPosts(
  query: string,
  subreddits: string[],
  limit: number = 25
): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = []

  for (const subreddit of subreddits) {
    const posts = await fetchSubredditPosts(subreddit, limit)
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.selftext.toLowerCase().includes(query.toLowerCase())
    )
    allPosts.push(...filtered)
  }

  return allPosts.sort((a, b) => b.score - a.score)
}

export function calculateIntentScore(post: RedditPost): {
  score: number
  reasons: string[]
} {
  const text = `${post.title} ${post.selftext}`.toLowerCase()
  let score = 5
  const reasons: string[] = []

  const toolKeywords = ['looking for', 'need', 'recommend', 'best', 'suggestion', 'help']
  const painKeywords = ['struggling', 'painful', 'exhausting', 'overwhelmed', 'frustrated', 'hard']
  const urgencyKeywords = ['asap', 'urgent', 'fast', 'quickly', 'now', 'immediately']

  for (const keyword of toolKeywords) {
    if (text.includes(keyword)) {
      score += 2
      reasons.push('tool_seeking')
      break
    }
  }

  for (const keyword of painKeywords) {
    if (text.includes(keyword)) {
      score += 2
      reasons.push('pain_term')
      break
    }
  }

  for (const keyword of urgencyKeywords) {
    if (text.includes(keyword)) {
      score += 1
      reasons.push('urgency')
      break
    }
  }

  if (post.score > 50) {
    score += 1
    reasons.push('high_engagement')
  }

  if (post.num_comments > 20) {
    score += 1
    reasons.push('active_discussion')
  }

  return {
    score: Math.min(10, score),
    reasons: Array.from(new Set(reasons)),
  }
}

export function mapRedditPostToDb(post: RedditPost) {
  return {
    postId: post.id,
    title: post.title,
    body: post.selftext || null,
    author: post.author,
    subreddit: post.subreddit.toLowerCase(),
    url: `https://reddit.com${post.permalink}`,
    score: post.score,
    numComments: post.num_comments,
    createdAt: new Date(post.created_utc * 1000),
  }
}

export interface RedditComment {
  id: string
  author: string
  body: string
  score: number
  created_utc: number
  permalink: string
}

export async function fetchRedditComments(
  subreddit: string,
  postId: string,
  limit: number = 10
): Promise<RedditComment[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IntentRadar/1.0 (AI Lead Detection)',
        },
      }
    )

    if (!response.ok) {
      console.error('Reddit API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    
    if (!data[1]?.data?.children) {
      console.log('No comments found in response')
      return []
    }

    return data[1].data.children
      .filter((child: any) => child.kind === 't1')
      .map((child: any) => ({
        id: child.data.id,
        author: child.data.author,
        body: child.data.body,
        score: child.data.score,
        created_utc: child.data.created_utc,
        permalink: child.data.permalink,
      }))
  } catch (error) {
    console.error('Error fetching Reddit comments:', error)
    return []
  }
}
