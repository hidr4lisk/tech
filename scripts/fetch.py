#!/usr/bin/env python3
"""
Hidr4lisk_Tech — data fetcher
Runs via GitHub Actions every 6h. Fetches news, models and releases,
merges with existing data, and writes data/*.json.
"""
import os
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse

import requests
import yaml
from dateutil import parser as dateparser

ROOT    = Path(__file__).resolve().parent.parent
DATA    = ROOT / "data"
MAP_FILE = DATA / "map.yaml"

TIMEOUT = 15
GH_HEADERS = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
if token := os.getenv("GH_TOKEN"):
    GH_HEADERS["Authorization"] = f"Bearer {token}"

RSS_SOURCES = [
    {"slug": "huggingface", "url": "https://huggingface.co/blog/feed.xml",                     "filter": None},
    {"slug": "meta",        "url": "https://engineering.fb.com/feed/",                         "filter": ["llama", "open", "model", "ai"]},
    {"slug": "google",      "url": "https://blog.research.google/feeds/posts/default",         "filter": ["gemma", "language model", "llm", "open", "model"]},
    {"slug": "microsoft",   "url": "https://www.microsoft.com/en-us/research/feed/",           "filter": ["phi", "language model", "llm", "open", "model"]},
    {"slug": "gradient",    "url": "https://thegradient.pub/rss/",                             "filter": None},
]

# Tool repos: active projects with frequent releases
GH_TOOL_REPOS = [
    ("ollama",       "ollama",        "ollama",       "tool"),
    ("ggerganov",    "llama.cpp",     "llama-cpp",    "tool"),
    ("vllm-project", "vllm",         "vllm",          "tool"),
    ("huggingface",  "transformers",  "transformers", "tool"),
    ("mudler",       "LocalAI",       "localai",      "tool"),
]

# HuggingFace orgs to track for new model uploads
HF_MODEL_ORGS = [
    "meta-llama", "mistralai", "google", "microsoft",
    "EleutherAI", "stabilityai", "Qwen", "deepseek-ai",
]


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text[:60].strip("-")


def safe_parse_date(raw):
    if not raw:
        return None
    try:
        return dateparser.parse(raw).isoformat(timespec="seconds").replace("+00:00", "Z")
    except Exception:
        return None


def load_json(path):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return {}


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"  wrote {path.name} ({len(json.dumps(data))} bytes)")


def load_map():
    if not MAP_FILE.exists():
        return {}
    with open(MAP_FILE) as f:
        return yaml.safe_load(f) or {}


def fetch_rss(url, slug, filter_words=None):
    resp = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": "Hidr4liskTech/1.0"})
    resp.raise_for_status()
    root = ET.fromstring(resp.content)

    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"

    ATOM_NS = "http://www.w3.org/2005/Atom"

    items = root.findall(f".//{ns}item")
    is_atom = not items
    if is_atom:
        items = root.findall(f"{{{ATOM_NS}}}entry") or root.findall(f".//{{{ATOM_NS}}}entry")

    results = []
    for item in items:
        def get_text(tags):
            for tag in tags:
                el = item.find(tag)
                if el is not None and el.text:
                    return el.text.strip()
                el = item.find(f"{{{ATOM_NS}}}{tag}")
                if el is not None and el.text:
                    return el.text.strip()
            return ""

        title   = get_text(["title"]) or ""
        pub     = get_text(["pubDate", "published", "updated"]) or ""
        summary = get_text(["description", "summary", "content"]) or ""

        link = get_text(["link", "id"])
        if not link:
            link_el = item.find("link") or item.find(f"{{{ATOM_NS}}}link")
            if link_el is not None:
                link = link_el.get("href", link_el.text or "")

        if not title or not link:
            continue

        if filter_words:
            haystack = (title + " " + summary).lower()
            if not any(w.lower() in haystack for w in filter_words):
                continue

        summary_clean = re.sub(r"<[^>]+>", "", summary or "")[:220]
        date_iso = safe_parse_date(pub)

        results.append({
            "id":           f"{slug}-{(date_iso or now_iso())[:10]}-{slugify(title)}",
            "source":       slug,
            "title":        title,
            "url":          link,
            "published_at": date_iso or now_iso(),
            "summary":      summary_clean,
            "tags":         [slug],
        })

    return results


def fetch_hf_models():
    url = "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=100&filter=text-generation"
    resp = requests.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def strip_markdown(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]*`', '', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'^[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'Full Changelog[^.]*\.', '', text)
    text = re.sub(r'\s{2,}', ' ', text)
    text = re.sub(r'\n+', ' ', text)
    return text.strip()


def fetch_hf_model_releases(orgs, days=60):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    results = []
    for org in orgs:
        try:
            url = f"https://huggingface.co/api/models?author={org}&sort=createdAt&direction=-1&limit=15"
            resp = requests.get(url, timeout=TIMEOUT)
            resp.raise_for_status()
            for m in resp.json():
                created = m.get("createdAt", "")
                if not created or created < cutoff:
                    continue
                mid = m.get("id") or m.get("modelId", "")
                if not mid:
                    continue
                name = mid.split("/")[-1] if "/" in mid else mid
                results.append({
                    "id":           f"hf-{mid.replace('/', '-')}",
                    "project":      org,
                    "version":      name,
                    "url":          f"https://huggingface.co/{mid}",
                    "published_at": safe_parse_date(created) or now_iso(),
                    "body_excerpt": "",
                    "type":         "model",
                })
            print(f"  hf models {org}: {len([m for m in resp.json() if m.get('createdAt','') >= cutoff])} recent")
        except Exception as e:
            print(f"  WARN hf models {org}: {e}")
    return results


def fetch_gh_releases(owner, repo, project_slug, release_type):
    url = f"https://api.github.com/repos/{owner}/{repo}/releases?per_page=20"
    resp = requests.get(url, timeout=TIMEOUT, headers=GH_HEADERS)
    resp.raise_for_status()
    results = []
    for rel in resp.json():
        tag  = rel.get("tag_name", "")
        body = strip_markdown((rel.get("body") or ""))[:400]
        pub  = safe_parse_date(rel.get("published_at", ""))
        results.append({
            "id":           f"{project_slug}-{tag}",
            "project":      project_slug,
            "version":      tag,
            "url":          rel.get("html_url", ""),
            "published_at": pub or now_iso(),
            "body_excerpt": body,
            "type":         release_type,
        })
    return results


def merge_news(existing_items, new_items, max_items=60):
    by_url = {i["url"]: i for i in existing_items}
    for item in new_items:
        if item["url"] not in by_url:
            by_url[item["url"]] = item
    merged = sorted(by_url.values(), key=lambda i: i.get("published_at", ""), reverse=True)
    return merged[:max_items]


def merge_changelog(existing_items, new_items, days=90):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    by_id  = {i["id"]: i for i in existing_items}
    for item in new_items:
        by_id[item["id"]] = item
    merged = sorted(by_id.values(), key=lambda i: i.get("published_at", ""), reverse=True)
    return [i for i in merged if i.get("published_at", "") >= cutoff]


def build_models_from_map(map_data, hf_data):
    hf_by_id = {}
    for m in (hf_data or []):
        mid = m.get("id") or m.get("modelId", "")
        if mid:
            hf_by_id[mid] = m

    result = []
    for company in map_data.get("companies", []):
        org_id = company["id"]
        for model in (company.get("models") or []):
            hf_id  = model.get("hf_model_id")
            hf_entry = hf_by_id.get(hf_id, {})
            entry = {
                "id":             model.get("id", slugify(model.get("name", ""))),
                "name":           model.get("name", ""),
                "org":            org_id,
                "hf_model_id":    hf_id,
                "context_window": model.get("context_window"),
                "params_b":       model.get("params_b"),
                "open_weights":   model.get("open_weights", False),
                "license":        model.get("license"),
                "multimodal":     model.get("multimodal", False),
                "released_at":    hf_entry.get("createdAt") or model.get("released_at"),
                "hf_downloads":   hf_entry.get("downloads"),
                "tags":           hf_entry.get("tags", []),
            }
            result.append(entry)
    return result


def main():
    print("=== Hidr4lisk_Tech fetch ===")
    DATA.mkdir(exist_ok=True)
    map_data = load_map()

    # ── News ──────────────────────────────────────────────────────────────
    print("\n[news]")
    news_items = []
    for src in RSS_SOURCES:
        try:
            items = fetch_rss(src["url"], src["slug"], src.get("filter"))
            print(f"  {src['slug']}: {len(items)} items")
            news_items.extend(items)
        except Exception as e:
            print(f"  WARN {src['slug']}: {e}")

    existing_news = load_json(DATA / "news.json")
    merged_news   = merge_news(existing_news.get("items", []), news_items)
    write_json(DATA / "news.json", {"updated_at": now_iso(), "items": merged_news})

    # ── Models ────────────────────────────────────────────────────────────
    print("\n[models]")
    hf_data = []
    try:
        hf_data = fetch_hf_models()
        print(f"  huggingface api: {len(hf_data)} models")
    except Exception as e:
        print(f"  WARN huggingface api: {e}")

    companies = [
        {"id": c["id"], "name": c["name"], "type": c.get("type", "lab"),
         "description_es": c.get("description_es", ""), "description_en": c.get("description_en", ""),
         "website": c.get("website")}
        for c in map_data.get("companies", [])
    ]
    models = build_models_from_map(map_data, hf_data)
    print(f"  built {len(models)} models from map.yaml")
    write_json(DATA / "models.json", {
        "updated_at": now_iso(),
        "companies":  companies,
        "models":     models,
    })

    # ── Changelog ─────────────────────────────────────────────────────────
    print("\n[changelog]")
    cl_items = []
    for owner, repo, slug, rtype in GH_TOOL_REPOS:
        try:
            items = fetch_gh_releases(owner, repo, slug, rtype)
            print(f"  {owner}/{repo}: {len(items)} releases")
            cl_items.extend(items)
        except Exception as e:
            print(f"  WARN {owner}/{repo}: {e}")

    print("  [hf model releases]")
    cl_items.extend(fetch_hf_model_releases(HF_MODEL_ORGS))

    existing_cl = load_json(DATA / "changelog.json")
    merged_cl   = merge_changelog(existing_cl.get("releases", []), cl_items)
    write_json(DATA / "changelog.json", {"updated_at": now_iso(), "releases": merged_cl})

    print("\n=== done ===")


if __name__ == "__main__":
    main()
