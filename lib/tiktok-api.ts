/**
 * TikTok API integration.
 *
 * TikTok has multiple APIs:
 *   - TikTok for Developers (TikTok Login Kit + Content Posting API)
 *   - TikTok Creator API (analytics + content for creator accounts)
 *   - TikTok Research API (academic/nonprofit use)
 *
 * For our use case (AI posting + engagement):
 *   - OAuth: TikTok Login Kit → get user's creator account
 *   - Content: TikTok Content Posting API (video upload)
 *   - Comments: TikTok Comments API (read + reply)
 *   - Analytics: TikTok Creator Insights API
 *
 * Docs: https://developers.tiktok.com/
 *
 * MVP scope: OAuth login + content posting (video scheduling).
 * Full engagement automation is limited by TikTok's strict anti-bot policies.
 */

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

interface TikTokTokens {
  accessToken: string;
  refreshToken?: string;
  openId?: string;
}

/**
 * Initialize TikTok OAuth URL for user authentication.
 */
export function getTikTokAuthUrl(clientKey: string, redirectUri: string, state: string) {
  const csrfState = state || Math.random().toString(36).substring(7);
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic,video.upload,video.list,user.insights",
    redirect_uri: redirectUri,
    state: csrfState,
  });

  return {
    url: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`,
    state: csrfState,
  };
}

/**
 * Exchange OAuth code for access token.
 */
export async function exchangeTikTokCode(
  clientKey: string,
  clientSecret: string,
  code: string,
  redirectUri: string
) {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`TikTok OAuth error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get authenticated user's profile.
 */
export async function getTikTokProfile(tokens: TikTokTokens) {
  const response = await fetch(
    `${TIKTOK_API_BASE}/user/info/?fields=open_id,display_name,avatar_url,follower_count,likes_count,video_count`,
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`TikTok profile error: ${response.status}`);
  }

  return (await response.json()).data;
}

/**
 * Upload and post a TikTok video.
 * Video must be pre-uploaded via TikTok's upload endpoint first.
 *
 * Flow:
 *   1. POST /video/upload/ → initialize upload → get upload URL
 *   2. PUT video bytes to upload URL
 *   3. POST /video/publish/ → publish the uploaded video with caption
 */
export async function initializeTikTokUpload(
  tokens: TikTokTokens,
  videoSize: number,
  sourceInfo: "PULL_FROM_URL" | "FILE_UPLOAD" = "FILE_UPLOAD"
) {
  const response = await fetch(`${TIKTOK_API_BASE}/video/upload/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_info: {
        source: sourceInfo,
        video_size: videoSize,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`TikTok upload init error: ${response.status}`);
  }

  return response.json();
}

/**
 * Publish a TikTok video after upload.
 */
export async function publishTikTokVideo(
  tokens: TikTokTokens,
  uploadUrl: string,
  caption: string,
  privacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY" = "PUBLIC_TO_EVERYONE"
) {
  const response = await fetch(`${TIKTOK_API_BASE}/video/publish/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_id: uploadUrl,
      post_info: {
        title: caption.substring(0, 2200), // TikTok max 2200 chars
        privacy_level: privacyLevel,
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`TikTok publish error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get recent videos from the authenticated user.
 */
export async function fetchTikTokVideos(tokens: TikTokTokens, maxCount = 20) {
  const response = await fetch(
    `${TIKTOK_API_BASE}/video/list/?fields=id,title,create_time,share_url,like_count,comment_count,share_count,view_count&max_count=${maxCount}`,
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`TikTok video list error: ${response.status}`);
  }

  return (await response.json()).data?.videos ?? [];
}

/**
 * Get comments on a specific video.
 */
export async function fetchTikTokComments(
  tokens: TikTokTokens,
  videoId: string,
  maxCount = 50
) {
  const response = await fetch(
    `${TIKTOK_API_BASE}/video/comment/list/?video_id=${videoId}&max_count=${maxCount}`,
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`TikTok comments error: ${response.status}`);
  }

  return (await response.json()).data?.comments ?? [];
}
