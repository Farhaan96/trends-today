#!/usr/bin/env python3
"""Shared fail-closed source and automated-access policy."""

import json
from pathlib import Path
from typing import Callable, Dict, Iterable, Optional
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from urllib.robotparser import RobotFileParser


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE_CONFIG = REPO_ROOT / 'config' / 'local-news-sources.json'
TRACKING_QUERY_PARAMS = {
    'fbclid', 'gclid', 'igshid', 'mc_cid', 'mc_eid', 'msclkid',
}


def load_source_config(path: Path = DEFAULT_SOURCE_CONFIG) -> Dict:
    return json.loads(path.read_text(encoding='utf-8'))


def _parsed_http_url(url: object):
    raw = str(url or '').strip()
    if not raw:
        return None
    try:
        parsed = urlparse(raw)
        hostname = parsed.hostname
        parsed.port
    except ValueError:
        return None
    if parsed.scheme.lower() not in {'http', 'https'} or not hostname:
        return None
    return parsed


def is_http_url(url: object) -> bool:
    return _parsed_http_url(url) is not None


def url_host(url: object) -> str:
    raw = str(url or '').strip()
    if raw and '://' not in raw:
        raw = f'//{raw}'
    try:
        host = (urlparse(raw).hostname or '').lower()
    except ValueError:
        return ''
    return host.removeprefix('www.')


def canonical_http_url(url: object) -> str:
    parsed = _parsed_http_url(url)
    if not parsed:
        return ''
    host = (parsed.hostname or '').lower().removeprefix('www.')
    try:
        port = f':{parsed.port}' if parsed.port else ''
    except ValueError:
        return ''
    path = parsed.path.rstrip('/') or '/'
    query = urlencode(sorted(
        (key, value)
        for key, value in parse_qsl(parsed.query, keep_blank_values=True)
        if (
            not key.lower().startswith('utm_')
            and key.lower() not in TRACKING_QUERY_PARAMS
        )
    ))
    return urlunparse((
        parsed.scheme.lower(),
        f'{host}{port}',
        path,
        parsed.params,
        query,
        '',
    ))


def is_discovery_lead(topic: Dict) -> bool:
    return (
        topic.get('discoveryRole') == 'lead'
        or topic.get('sourceTier') == 'secondary'
    )


def lead_hosts(topic: Dict) -> set:
    if not is_discovery_lead(topic):
        return set()
    return {
        host
        for host in (url_host(topic.get('url')), url_host(topic.get('sourceUrl')))
        if host
    }


def host_is_same_or_subdomain(url: object, blocked_host: str) -> bool:
    host = url_host(url)
    return bool(
        host
        and blocked_host
        and (host == blocked_host or host.endswith(f'.{blocked_host}'))
    )


def url_matches_any_host(url: object, blocked_hosts: Iterable[str]) -> bool:
    return any(host_is_same_or_subdomain(url, host) for host in blocked_hosts)


def configured_source_for_url(url: object, config: Dict) -> Optional[Dict]:
    host = url_host(url)
    if not host:
        return None
    for source in config.get('sources', []):
        configured_host = url_host(source.get('domain') or source.get('url'))
        if (
            configured_host
            and (
                host == configured_host
                or host.endswith(f'.{configured_host}')
            )
        ):
            return source
    return None


def automated_access_approved(url: object, config: Dict) -> bool:
    source = configured_source_for_url(url, config)
    if not source:
        return False
    if source.get('tier') == 'primary':
        return True
    return bool(
        source.get('automatedAccessApproved') is True
        and str(source.get('writtenPermissionReference', '')).strip()
    )


def robots_allows(
    url: object,
    user_agent: str,
    fetch: Callable,
    cache: Dict[str, object],
) -> bool:
    parsed = _parsed_http_url(url)
    if not parsed:
        return False
    robots_url = f'{parsed.scheme}://{parsed.netloc}/robots.txt'
    if robots_url in cache:
        cached = cache[robots_url]
        return (
            cached.can_fetch(user_agent, str(url))
            if isinstance(cached, RobotFileParser)
            else bool(cached)
        )
    try:
        response = fetch(
            robots_url,
            timeout=10,
            headers={'User-Agent': user_agent},
        )
    except Exception:
        cache[robots_url] = False
        return False

    if response.status_code == 404:
        allowed = True
    elif response.status_code == 200:
        parser = RobotFileParser()
        parser.set_url(robots_url)
        parser.parse(str(response.text or '').splitlines())
        allowed = parser.can_fetch(user_agent, str(url))
        cache[robots_url] = parser
        return allowed
    else:
        allowed = False
    cache[robots_url] = allowed
    return allowed
