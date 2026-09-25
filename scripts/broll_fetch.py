#!/usr/bin/env python3
"""
Download real footage instead of rebuilding it.

If the script names a company, product, keynote or launch that has official
video on YouTube, that footage IS the motion graphic. Four seconds of Apple's
own product film beats a day of rebuilding it in Remotion and looks better.
Build from scratch only when nothing real exists, or when the beat is data
that nobody has ever filmed.

    # from a known URL (preferred — you picked the video, not an algorithm)
    python3 broll_fetch.py --url "https://youtube.com/watch?v=..." -d <project>

    # or search a specific channel, which is how you stay on official sources
    python3 broll_fetch.py --search "Apple Vision Pro product film" \
        --channel "https://www.youtube.com/@Apple" -n 5 -d <project>

Downloads to <project>/broll-raw/ at up to 1080p. Nothing is cut here — run
broll_pick.py next to find and cut the usable seconds.

Sourcing rules:
  * official channels only — the brand's own, or the creator's if credited
  * no music videos, no reaction uploads, no re-uploads of someone else's cut
  * record the URL: broll_pick.py writes it into broll.json as provenance
  * this is footage for editorial commentary in a short; if a client asks for
    a licence position, say what was used and where it came from
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

FORMAT = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best"


def run(cmd):
    print("$ " + " ".join(cmd[:6]) + (" …" if len(cmd) > 6 else ""))
    return subprocess.run(cmd, check=False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-d", "--dir", required=True, help="project dir")
    ap.add_argument("--url", action="append", default=[], help="a video URL; repeatable")
    ap.add_argument("--search", help="search terms")
    ap.add_argument("--channel", help="restrict the search to this channel URL")
    ap.add_argument("-n", type=int, default=3, help="how many search results to take")
    ap.add_argument("--list-only", action="store_true",
                    help="print candidate titles and URLs without downloading")
    args = ap.parse_args()

    raw = Path(args.dir).expanduser().resolve() / "broll-raw"
    raw.mkdir(parents=True, exist_ok=True)

    targets = list(args.url)

    if args.search:
        if args.channel:
            # searching within a channel keeps you on official uploads
            query = [args.channel.rstrip("/") + "/search?query=" + args.search.replace(" ", "+")]
            listing = subprocess.run(
                ["yt-dlp", "--flat-playlist", "-J", "--playlist-end", str(args.n)] + query,
                capture_output=True, text=True)
        else:
            listing = subprocess.run(
                ["yt-dlp", "--flat-playlist", "-J", f"ytsearch{args.n}:{args.search}"],
                capture_output=True, text=True)
        if listing.returncode != 0:
            print(listing.stderr.strip()[-800:], file=sys.stderr)
            return 1
        data = json.loads(listing.stdout)
        for e in data.get("entries", [])[: args.n]:
            url = e.get("url") or f"https://www.youtube.com/watch?v={e['id']}"
            print(f"  {e.get('duration') or '?':>6}s  {e.get('title')}\n          {url}")
            targets.append(url)

    if args.list_only:
        return 0
    if not targets:
        print("nothing to download — pass --url or --search", file=sys.stderr)
        return 1

    for url in targets:
        run(["yt-dlp", "-f", FORMAT, "--merge-output-format", "mp4",
             "--no-playlist", "--write-info-json",
             "-o", str(raw / "%(id)s.%(ext)s"), url])

    print(f"\nraw footage in {raw}")
    print("next: python3 broll_pick.py -d <project> --clip <id> --in 12.4 --out 16.0 "
          "--name primary --note 'hero shot of the headset'")
    return 0


if __name__ == "__main__":
    sys.exit(main())
