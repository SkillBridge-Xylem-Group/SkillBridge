import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { checkRateLimitAsync, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";

type GiphyImage = {
  url: string;
  width?: string;
  height?: string;
};

type GiphyGif = {
  id: string;
  title: string;
  images: {
    fixed_width?: GiphyImage;
    downsized_medium?: GiphyImage;
  };
};

function mapGif(g: GiphyGif) {
  const img = g.images.fixed_width ?? g.images.downsized_medium;
  return {
    id: g.id,
    title: g.title || "GIF",
    url: img?.url ?? "",
    width: img?.width ? Number(img.width) : 200,
    height: img?.height ? Number(img.height) : 200,
  };
}

export async function GET(request: Request) {
  const { error: authError } = await requireActiveUser();
  if (authError) return authError;

  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GIF search is not configured. Set GIPHY_API_KEY on the server." },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  const limit = await checkRateLimitAsync("giphy:ip", ip, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many GIF requests. Try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterMs) }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const offset = searchParams.get("offset") ?? "0";
  const pageLimit = "20";

  const endpoint = q
    ? `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q)}&limit=${pageLimit}&offset=${encodeURIComponent(offset)}&rating=g`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(apiKey)}&limit=${pageLimit}&offset=${encodeURIComponent(offset)}&rating=g`;

  try {
    const res = await fetch(endpoint, { cache: q ? "no-store" : "force-cache", next: { revalidate: q ? 0 : 300 } });
    if (!res.ok) {
      console.error("[giphy] upstream error:", res.status, await res.text());
      return NextResponse.json({ error: "Could not load GIFs right now." }, { status: 502 });
    }

    const data = (await res.json()) as { data?: GiphyGif[] };
    const gifs = (data.data ?? []).map(mapGif).filter((g) => g.url);
    return NextResponse.json({ gifs });
  } catch (err) {
    console.error("[giphy] fetch failed:", err);
    return NextResponse.json({ error: "Could not load GIFs right now." }, { status: 502 });
  }
}
