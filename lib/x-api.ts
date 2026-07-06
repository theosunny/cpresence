/**
 * X (Twitter) API v2 client.
 *
 * Rate limits: Free tier — 100 tweets/month read, 500 tweets/month write
 * Basic tier ($100/month) — 10K reads, 3K writes
 * Pro tier ($5000/month) — 1M reads, 300K writes
 *
 * For MVP: use Free/Basic tier for reading user timeline,
 * Basic tier for posting.
 *
 * Docs: https://developer.x.com/en/docs/twitter-api
 */

const X_API_BASE = "https://api.twitter.com/2";

interface XTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Fetch recent tweets from a user's timeline.
 */
export async function fetchUserTweets(tokens: XTokens, userId: string, maxResults = 100) {
  const response = await fetch(
    `${X_API_BASE}/users/${userId}/tweets?` +
      new URLSearchParams({
        max_results: String(Math.min(maxResults, 100)),
        "tweet.fields": "created_at,public_metrics,conversation_id",
        exclude: "retweets,replies",
      }),
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`X API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.data ?? [];
}

/**
 * Post a tweet.
 * Returns the created tweet ID.
 */
export async function postTweet(tokens: XTokens, text: string, options?: {
  replyToTweetId?: string;
}) {
  const body: Record<string, unknown> = { text };

  if (options?.replyToTweetId) {
    body.reply = { in_reply_to_tweet_id: options.replyToTweetId };
  }

  const response = await fetch(`${X_API_BASE}/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`X post error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get mentions (tweets that mention the authenticated user).
 */
export async function fetchMentions(tokens: XTokens, userId: string, maxResults = 20) {
  const response = await fetch(
    `${X_API_BASE}/users/${userId}/mentions?` +
      new URLSearchParams({
        max_results: String(maxResults),
        "tweet.fields": "created_at,author_id,conversation_id",
      }),
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`X mentions error: ${response.status}`);
  }

  return (await response.json()).data ?? [];
}

/**
 * Get DMs (direct messages).
 * Requires OAuth 1.0a User Context — not available via API v2 yet.
 * Use OAuth 1.0a for DMs in production.
 */
export async function fetchDMs(tokens: XTokens) {
  // X DMs require OAuth 1.0a — use a library like twitter-api-v2 for this
  // For MVP, DMs can be handled via webhook/review notifications
  throw new Error("X DMs require OAuth 1.0a — use twitter-api-v2 package");
}

/**
 * Get authenticated user's profile info.
 */
export async function getMyProfile(tokens: XTokens) {
  const response = await fetch(
    `${X_API_BASE}/users/me?user.fields=public_metrics,profile_image_url,description`,
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`X profile error: ${response.status}`);
  }

  return (await response.json()).data;
}
