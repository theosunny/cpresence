/**
 * X (Twitter) OAuth 2.0 with PKCE.
 *
 * GET  /api/auth/x?action=login  → redirects user to X authorization page
 * GET  /api/auth/x?code=...&state=...  → X redirects here after user authorizes
 *
 * Requires env vars:
 *   X_CLIENT_ID     — from developer.x.com → your App → Keys & Tokens
 *   X_CLIENT_SECRET — same place
 *   NEXT_PUBLIC_APP_URL — https://your-domain.com (or http://localhost:3000)
 *
 * Flow:
 *   1. User clicks "Connect X" in Settings → redirected to X auth page
 *   2. X shows "App wants to post tweets on your behalf" → User clicks Authorize
 *   3. X redirects to /api/auth/x?code=xxx → we exchange code for token
 *   4. We store token in DB → redirect to /settings?connected=x
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDemoUserId, run } from "@/lib/db-sqlite";

const X_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

// Generate PKCE code verifier + challenge
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const hash = crypto.createHash("sha256").update(verifier).digest();
  const challenge = hash.toString("base64url");
  return { verifier, challenge };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/x`;

  // ── Step 1: User clicked "Connect X" → redirect to X auth page ──
  if (action === "login") {
    if (!clientId) {
      return NextResponse.redirect(
        `${appUrl}/settings?error=x_missing_config`
      );
    }

    const { verifier, challenge } = generatePKCE();
    const csrfState = crypto.randomBytes(16).toString("hex");

    // Store verifier to verify later (in production: Redis. For MVP: cookie)
    const response = NextResponse.redirect(
      `${X_AUTH_URL}?${new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "tweet.read tweet.write users.read offline.access",
        state: csrfState,
        code_challenge: challenge,
        code_challenge_method: "S256",
      })}`
    );

    response.cookies.set("x_oauth_verifier", verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });
    response.cookies.set("x_oauth_state", csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });

    return response;
  }

  // ── X error (user declined) ──
  if (error) {
    return NextResponse.redirect(`${appUrl}/settings?error=x_declined`);
  }

  // ── Step 2: X redirected back with code → exchange for token ──
  if (code && state) {
    const savedState = req.cookies.get("x_oauth_state")?.value;
    const verifier = req.cookies.get("x_oauth_verifier")?.value;

    if (state !== savedState || !verifier) {
      return NextResponse.redirect(`${appUrl}/settings?error=x_state_mismatch`);
    }

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/settings?error=x_missing_config`);
    }

    try {
      // Exchange code for access token
      const tokenRes = await fetch(X_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: verifier,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("X token exchange failed:", err);
        return NextResponse.redirect(`${appUrl}/settings?error=x_token_failed`);
      }

      const tokenData = await tokenRes.json();

      // Fetch user info
      const userRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();

      // Save token to DB
      const userId = getDemoUserId();
      run(
        `INSERT INTO platform_tokens (user_id, platform, access_token, refresh_token, platform_user_id, platform_username)
         VALUES (?, 'x', ?, ?, ?, ?)
         ON CONFLICT(user_id, platform) DO UPDATE SET
           access_token = excluded.access_token,
           refresh_token = excluded.refresh_token,
           platform_user_id = excluded.platform_user_id,
           platform_username = excluded.platform_username,
           updated_at = datetime('now')`,
        [
          userId,
          tokenData.access_token,
          tokenData.refresh_token || null,
          userData.data?.id || null,
          userData.data?.username || null,
        ]
      );

      const response = NextResponse.redirect(`${appUrl}/settings?success=x_connected`);
      response.cookies.delete("x_oauth_verifier");
      response.cookies.delete("x_oauth_state");
      return response;
    } catch (err) {
      console.error("X OAuth error:", err);
      return NextResponse.redirect(`${appUrl}/settings?error=x_oauth_error`);
    }
  }

  // No valid action
  return NextResponse.json({
    usage: "GET /api/auth/x?action=login  OR  X redirects here after auth",
  });
}
