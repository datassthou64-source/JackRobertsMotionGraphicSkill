#!/usr/bin/env python3
"""Pull a brand's real kit off its own site via Firecrawl's `branding` format.
  fetch_brand.py <project> <url> [name]
Writes public/brand/<name>.json (colours, fonts, radius, button styles), saves the site's
logo / favicon / og-image into public/logos/ + public/stills/, prints the palette, and appends
SOURCES.md. Needs $FIRECRAWL_API_KEY (global env). Verify the logo before shipping — a site
header mark can be a sticker/variant; svgl or the press kit wins when they disagree.
"""
import json, os, sys, urllib.parse, urllib.request
from pathlib import Path

if len(sys.argv) < 3:
    sys.exit(__doc__)
proj, url = Path(sys.argv[1]), sys.argv[2]
name = sys.argv[3] if len(sys.argv) > 3 else urllib.parse.urlparse(url).netloc.replace("www.", "").split(".")[0]
key = os.environ.get("FIRECRAWL_API_KEY") or sys.exit("FIRECRAWL_API_KEY not set (source ~/.zshrc)")

req = urllib.request.Request(
    "https://api.firecrawl.dev/v2/scrape",
    data=json.dumps({"url": url, "formats": ["branding"]}).encode(),
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
)
res = json.load(urllib.request.urlopen(req, timeout=120))
b = (res.get("data") or {}).get("branding") or sys.exit(f"no branding returned: {res.get('error')}")

(proj / "public/brand").mkdir(parents=True, exist_ok=True)
(proj / "public/brand" / f"{name}.json").write_text(json.dumps(b, indent=2))
src_lines = [f"brand/{name}.json | {url} | Firecrawl branding scrape | none"]

def save(ref, dest_dir, stem):
    if not ref:
        return
    if ref.startswith("data:"):
        head, _, body = ref.partition(",")
        ext = "svg" if "svg" in head else "png"
        data = urllib.parse.unquote(body).encode() if ";base64" not in head else __import__("base64").b64decode(body)
    else:
        ext = Path(urllib.parse.urlparse(ref).path).suffix.lstrip(".").lower() or "png"
        data = urllib.request.urlopen(urllib.request.Request(ref, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read()
    out = proj / "public" / dest_dir / f"{stem}.{ext}"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(data)
    print(f"-> public/{dest_dir}/{out.name}")
    src_lines.append(f"{dest_dir}/{out.name} | {url} | {name} site (mark © brand) | none")

imgs = b.get("images") or {}
for k, d, s in (("logo", "logos", f"{name}-site"), ("favicon", "logos", f"{name}-favicon"), ("ogImage", "stills", f"{name}-og")):
    try:
        save(imgs.get(k), d, s)
    except Exception as e:
        print(f"   {k}: skipped ({e})")

print(f"-> public/brand/{name}.json")
for k, v in (b.get("colors") or {}).items():
    print(f"   {k:<12} {v}")
fonts = (b.get("typography") or {}).get("fontFamilies") or {}
print("   fonts       " + ", ".join(f"{k}={v}" for k, v in fonts.items()))
with open(proj / "SOURCES.md", "a") as f:
    f.write("\n".join(src_lines) + "\n")
