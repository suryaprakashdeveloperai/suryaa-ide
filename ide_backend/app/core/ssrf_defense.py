import socket
import ipaddress
from urllib.parse import urlparse
from typing import Tuple

class SSRFSecurityException(Exception):
    """Raised when a user-supplied URL targets a disallowed or private network address."""
    pass

# Prohibited CIDR ranges (RFC 1918, loopback, link-local, cloud metadata, multicast)
PROHIBITED_RANGES = [
    ipaddress.ip_network("0.0.0.0/8"),         # Current network
    ipaddress.ip_network("10.0.0.0/8"),        # Private RFC 1918
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("169.254.0.0/16"),    # Link-local / Cloud metadata (AWS, GCP, Azure 169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),     # Private RFC 1918
    ipaddress.ip_network("192.168.0.0/16"),    # Private RFC 1918
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved
    ipaddress.ip_network("255.255.255.255/32"),# Broadcast
    # IPv6 prohibited
    ipaddress.ip_network("::1/128"),           # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),          # IPv6 Unique Local Address
    ipaddress.ip_network("fe80::/10"),         # IPv6 Link-Local
]

def validate_stream_destination(url_str: str, allow_local_dev: bool = False) -> Tuple[bool, str]:
    """
    Validates that a URL does not resolve to private, loopback, link-local,
    or cloud metadata IP addresses to prevent Server-Side Request Forgery (SSRF).
    
    Returns (True, resolved_ip) or raises SSRFSecurityException.
    """
    if not url_str or not isinstance(url_str, str):
        raise SSRFSecurityException("URL cannot be empty.")

    try:
        parsed = urlparse(url_str)
    except Exception as e:
        raise SSRFSecurityException(f"Malformed URL structure: {e}")

    scheme = (parsed.scheme or "").lower()
    if scheme not in ("http", "https", "ws", "wss"):
        raise SSRFSecurityException(f"Unsupported URL scheme '{scheme}'. Only http, https, ws, and wss are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise SSRFSecurityException("URL is missing a valid hostname.")

    # Check for known dangerous cloud metadata hostnames directly
    lowered_host = hostname.lower()
    if lowered_host in ("metadata.google.internal", "metadata", "instance-data", "169.254.169.254"):
        raise SSRFSecurityException(f"Access to cloud instance metadata service ({hostname}) is forbidden.")

    # Allow localhost explicitly in local development mode if requested
    if allow_local_dev and lowered_host in ("localhost", "127.0.0.1", "10.0.2.2"):
        return True, "127.0.0.1"

    # Resolve hostname via DNS
    try:
        resolved_ips = socket.getaddrinfo(hostname, None)
    except socket.gaierror as e:
        raise SSRFSecurityException(f"DNS resolution failed for host '{hostname}': {e}")

    for item in resolved_ips:
        ip_str = item[4][0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            continue

        if allow_local_dev and ip_obj.is_loopback:
            continue

        for prohibited in PROHIBITED_RANGES:
            if ip_obj in prohibited:
                raise SSRFSecurityException(
                    f"Destination host '{hostname}' resolved to prohibited address {ip_str} "
                    f"within protected range {prohibited}. Target rejected to prevent SSRF."
                )

    resolved_ip = resolved_ips[0][4][0] if resolved_ips else "0.0.0.0"
    return True, resolved_ip
