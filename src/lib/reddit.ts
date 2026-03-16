interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  subreddit: string
  url: string
  permalink: string
  created_utc: number
  score: number
  num_comments: number
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
  }
}

const REDDIT_PUBLIC_URL = 'https://www.reddit.com'

export async function fetchRedditPosts(subreddits: string[], limit = 100): Promise<RedditPost[]> {
  const subredditQuery = subreddits.map((s) => `r/${s.toLowerCase()}`).join('+')

  const response = await fetch(
    `${REDDIT_PUBLIC_URL}/${subredditQuery}/new.json?limit=${limit}`,
    {
      headers: {
        'User-Agent': 'IntentRadar/1.0 (Mozilla/5.0)',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`)
  }

  const data: RedditResponse = await response.json()

  return data.data.children.map((child) => child.data)
}

export function mapRedditPostToDb(post: RedditPost) {
  return {
    postId: post.id,
    title: post.title,
    body: post.selftext || null,
    author: post.author,
    subreddit: post.subreddit,
    url: `https://reddit.com${post.permalink}`,
    createdAt: new Date(post.created_utc * 1000),
    score: post.score,
    numComments: post.num_comments,
  }
}
