# CRTMS Connectivity Issue and Cloudflare Runbook

## Migration Completed — 2026-06-10

The Cloudflare orange-cloud proxy is **live and verified**. `crtms.in` now routes through Cloudflare's edge instead of resolving directly to the VPS IP, which fixes the upstream-routing timeouts described below.

Final live state:

| Component | State |
|-----------|-------|
| Nameservers | `mark.ns.cloudflare.com` / `princess.ns.cloudflare.com` |
| Domain status (Cloudflare) | Active |
| Proxy | Orange cloud / Proxied (`server: cloudflare`, `cf-ray` present) |
| `crtms.in` resolves to | `104.21.61.233`, `172.67.216.14` (Cloudflare edge) |
| SSL/TLS mode | Full |
| SSH | Direct to VPS IP `ssh railway@93.127.198.125` (not proxied) |

Verification commands used (all returned `HTTP/2 200`, `server: cloudflare`):

```bash
# Confirm delegation moved to Cloudflare
dig +short NS crtms.in @8.8.8.8

# Confirm domain resolves to Cloudflare edge IPs (not 93.127.198.125)
dig +short A crtms.in @8.8.8.8

# Force request through a Cloudflare edge IP and confirm proxy headers
curl -sI --resolve crtms.in:443:104.21.61.233 https://crtms.in/
curl -sI --resolve crtms.in:443:172.67.216.14 https://crtms.in/api/status
```

Notes / follow-ups:

- Clients still seeing the old IP need `ipconfig /flushdns` + browser restart to pick up the Cloudflare IPs.
- The grey-cloud `ssh.crtms.in` record was not added; SSH continues via the raw VPS IP, which is unaffected.
- After a few stable days, optionally move SSL/TLS from `Full` to `Full (strict)`. Extra Cloudflare features left off intentionally until offices confirm stable login.
- If timeouts ever recur despite the proxy, escalate to **Cloudflare Tunnel** (see that section below).

## Summary

Around early June 2026, some users reported intermittent access problems with `https://crtms.in`.

Observed patterns:

- The site opens on some PCs/networks while failing on other PCs/networks.
- In some cases the portal page opens, but login fails with:

  ```text
  Connection error. Please try again.
  ```

- In other cases, a new browser tab shows that `crtms.in` takes too long to respond.
- The issue may disappear the next day and return again.

This was initially suspected to be related to the newly added CLI-CMS PWA, but testing showed the primary issue is network routing/TCP reachability to the VPS IP.

## Important Details

Domain:

```text
crtms.in
```

VPS public IP:

```text
93.127.198.125
```

VPS hostname seen in traceroute:

```text
srv976775.hstgr.cloud
```

Affected client public IP tested:

```text
103.206.147.76
```

## What Was Ruled Out

### DNS

On an affected PC:

```bat
nslookup crtms.in
```

Output:

```text
Server:  railtel.primary.dns
Address:  203.153.41.28

Non-authoritative answer:
Name:    crtms.in
Address:  93.127.198.125
```

DNS resolved correctly to the VPS IP. DNS was not the failure point.

### PWA Scope

On a working Mac, browser service worker registration showed:

```js
['https://crtms.in/clicms/']
```

The PWA service worker is scoped to `/clicms/`, not the whole domain.

Relevant files:

- `public/clicms/index.html`
- `public/clicms/manifest.json`
- `public/clicms/clicms-sw.js`

The service worker registration is:

```js
navigator.serviceWorker.register('clicms-sw.js')
```

Because it is registered from `/clicms/`, it should not intercept the root portal or `/api/login`.

Conclusion: the current PWA setup is not the main cause of the domain-level timeout.

### Node App and Nginx Health

Server-side tests at the time of checking:

```bash
curl -I --max-time 10 http://127.0.0.1:3000/
curl -I --max-time 10 http://127.0.0.1:3000/api/status
curl -I --max-time 10 https://crtms.in/
pm2 show bbtro
```

Results:

- `http://127.0.0.1:3000/` returned `HTTP/1.1 200 OK`.
- `http://127.0.0.1:3000/api/status` returned `HTTP/1.1 200 OK`.
- `https://crtms.in/` from the server returned `HTTP/1.1 200 OK`.
- `bbtro` process was online with uptime around 4 days.
- Event loop latency was low.

Conclusion: at the time of server-side testing, Node/Express and Nginx were healthy.

### Server Firewall

Server UFW status:

```bash
sudo ufw status verbose
```

Output showed:

```text
Status: active
Default: deny (incoming), allow (outgoing), disabled (routed)

22/tcp ALLOW IN Anywhere
80     ALLOW IN Anywhere
443    ALLOW IN Anywhere
```

The affected IP was not blocked in iptables:

```bash
sudo iptables -S | grep 103.206.147.76
sudo iptables -L -n --line-numbers | grep 103.206.147.76
```

No matching block rule was found.

`fail2ban-client` was not installed:

```text
sudo: fail2ban-client: command not found
```

Conclusion: local VPS firewall was not blocking the affected client.

## Key Failure Evidence

### Client TCP Connect Timeout

On affected PC:

```bat
curl -v --connect-timeout 10 https://crtms.in/
```

Output stopped at:

```text
* Host crtms.in:443 was resolved.
* IPv6: (none)
* IPv4: 93.127.198.125
*   Trying 93.127.198.125:443...
```

Direct IP test also hung:

```bat
curl -v --connect-timeout 10 https://93.127.198.125/
```

Output:

```text
*   Trying 93.127.198.125:443...
```

Port 80 also hung:

```bat
curl -v --connect-timeout 10 http://crtms.in/
```

Output:

```text
* Host crtms.in:80 was resolved.
* IPv6: (none)
* IPv4: 93.127.198.125
*   Trying 93.127.198.125:80...
```

Conclusion: this is not HTTPS-only, SSL-only, browser-only, or DNS-only. The affected client cannot establish TCP to the VPS IP on ports 80 or 443.

### API Status Timeout

At another remote office:

```bat
curl -I --connect-timeout 10 https://crtms.in/api/status
```

Output:

```text
curl: (28) Connection timed out after 10007 milliseconds
```

This explains the portal login error. The portal JavaScript shows `Connection error. Please try again.` when the `/api/login` fetch fails.

Relevant file:

```text
public/portal.html
```

### Server tcpdump Test

On server:

```bash
sudo tcpdump -ni any host 103.206.147.76 and tcp
```

While the affected PC ran:

```bat
curl -v --connect-timeout 10 http://crtms.in/
```

The server captured no packets from that client IP.

Conclusion: packets from the affected client were not reaching the VPS at all.

### Traceroute From Affected PC

On affected PC:

```bat
tracert 93.127.198.125
```

Output:

```text
Tracing route to srv976775.hstgr.cloud [93.127.198.125]
over a maximum of 30 hops:

  1    15 ms     8 ms     5 ms  10.31.38.1
  2    11 ms     1 ms     6 ms  10.31.4.49
  3    <1 ms    <1 ms    <1 ms  10.31.4.86
  4    <1 ms    <1 ms    <1 ms  10.255.248.201
  5     *        *        *     Request timed out.
  6     *        *        *     Request timed out.
  7     1 ms     2 ms     1 ms  nsg-corporate-169.147.185.122.airtel.in [122.185.147.169]
  8     1 ms     1 ms     1 ms  116.119.33.35
  9     2 ms     2 ms     2 ms  103.27.170.60
 10     3 ms     2 ms     2 ms  2.25.25.12
 11     *        *        *     Request timed out.
 12     2 ms     3 ms     2 ms  82.25.121.69
 13     *        *        *     Request timed out.
 14     *        *        *     Request timed out.
 ...
 30     *        *        *     Request timed out.

Trace complete.
```

The route dies before reaching the VPS.

## Finding

The evidence points to an upstream routing or filtering issue between some client networks/ISPs and the Hostinger VPS IP `93.127.198.125`.

It is not caused by:

- PWA/service worker scope
- Browser cache
- DNS resolution
- Express app outage
- Nginx outage
- MySQL/session error
- UFW or local iptables block

### Why It Broke Suddenly on Many PCs

The failure looked like "many independent PCs broke at once," but the evidence says otherwise:

- The traceroute reaches `82.25.121.69` (Hostinger's own edge range, `82.25.x`, one hop from the VPS) and then dies. Packets get within one hop of the destination network and disappear.
- Server-side `tcpdump` captured zero packets, so the forward path is breaking, not the server dropping traffic.
- It is intermittent: gone the next day, back again later.

That "works, then breaks for a whole group at once, then heals, then breaks again" pattern is the classic signature of an **unstable upstream route or intermittent filtering at the transit/hosting level** (a BGP route flap, a transit/peering change, or Hostinger DDoS scrubbing / null-routing on the shared subnet).

The affected PCs were not failing independently. They **share an ISP / network path** (the affected traces all go through Airtel). When that single path broke, every machine on it lost access together, while PCs on a different ISP kept working. Nothing changed on the client PCs or the server last week — a route somewhere between those ISPs and Hostinger changed.

This is the structural weakness Cloudflare addresses: the site currently lives on a **single static VPS IP with no CDN**, so if one path to that one IP breaks, everyone on that path is locked out with no redundancy.

## Hostinger Response

Hostinger support indicated:

- VPS is OK.
- This appears to be an upstream issue.
- They suggested using Cloudflare.

This suggestion matches the test evidence.

## Why Cloudflare Helps

Without Cloudflare:

```text
User network -> 93.127.198.125 directly
```

If a user ISP/upstream route to `93.127.198.125` is broken, the site times out.

With Cloudflare proxy enabled:

```text
User network -> Cloudflare edge IP -> Cloudflare network -> 93.127.198.125
```

Users connect to Cloudflare's nearby edge, not directly to the VPS IP. This can bypass broken ISP routes to the VPS.

Many large websites already use CDN/proxy networks such as Cloudflare, Akamai, AWS, or Google, which is why they may work while a single VPS IP has reachability problems.

## Recommended Cloudflare Setup From Scratch

### 1. Create/Login to Cloudflare

Open:

```text
https://dash.cloudflare.com
```

Create an account or log in.

### 2. Add Site

Add domain:

```text
crtms.in
```

Choose the Free plan unless a paid feature is specifically needed.

### 3. Configure DNS Records

Important — do this in order. **Add the grey-cloud `ssh` record FIRST**, before proxying the root domain, so you do not lock yourself out of SSH mid-migration:

```text
Type: A
Name: ssh
Content: 93.127.198.125
Proxy status: DNS only / grey cloud
```

This keeps `ssh railway@ssh.crtms.in` working directly to the VPS even after the root domain is proxied. (See the "SSH After Cloudflare" section for why.)

Then add or confirm the root record:

```text
Type: A
Name: @
Content: 93.127.198.125
Proxy status: Proxied / orange cloud
```

If `www.crtms.in` is needed:

```text
Type: CNAME
Name: www
Target: crtms.in
Proxy status: Proxied / orange cloud
```

Important:

```text
Proxy status must be orange cloud / Proxied.
```

If the record is grey cloud / DNS only, users will still connect directly to `93.127.198.125`, and the routing issue may remain.

### 4. Set SSL/TLS Mode

In Cloudflare:

```text
SSL/TLS -> Overview
```

Start with:

```text
Full
```

If the VPS certificate is valid for `crtms.in`, later switch to:

```text
Full (strict)
```

Do not use:

```text
Flexible
```

Flexible can create redirect loops or insecure origin traffic.

### 5. Change Nameservers at Domain Registrar

Cloudflare will provide two nameservers, similar to:

```text
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```

At the registrar where `crtms.in` was purchased:

- Open nameserver settings.
- Replace the existing nameservers with the two Cloudflare nameservers.
- Do not add Cloudflare nameservers as DNS records. They must replace the authoritative nameservers.

### 6. Wait for Activation

Cloudflare may show:

```text
Pending nameserver update
```

After propagation:

```text
Active
```

This may take minutes to a few hours.

### 7. Verify DNS Is Proxied

From a client PC:

```bat
nslookup crtms.in
```

Before Cloudflare proxy:

```text
crtms.in -> 93.127.198.125
```

After Cloudflare proxy is active, it should return Cloudflare IPs, not `93.127.198.125`.

### 8. Verify Site and API

From affected PC:

```bat
curl -I --connect-timeout 10 https://crtms.in/
curl -I --connect-timeout 10 https://crtms.in/api/status
```

Expected:

```text
HTTP/1.1 200 OK
```

Then test login in browser.

## SSH After Cloudflare

Cloudflare's normal orange-cloud proxy does not proxy SSH on port 22.

Continue SSH using the VPS IP:

```bash
ssh railway@93.127.198.125
```

If SSH currently uses the domain:

```bash
ssh railway@crtms.in
```

that may stop working after the root domain is proxied.

Optional DNS record for SSH:

```text
Type: A
Name: ssh
Content: 93.127.198.125
Proxy status: DNS only / grey cloud
```

Then SSH can use:

```bash
ssh railway@ssh.crtms.in
```

Do not orange-cloud proxy the `ssh` record.

## Most Robust Fallback: Cloudflare Tunnel

Use this if the routing issue still recurs **after** the orange-cloud proxy is active.

### Why a tunnel is stronger than the orange-cloud proxy

The orange-cloud proxy still needs Cloudflare to reach the origin **inbound** at `93.127.198.125:443`. That works today because the VPS is reachable from well-connected networks (Cloudflare's backbone almost certainly gets through). But if the real cause is Hostinger intermittently blackholing or filtering that IP's subnet, even the Cloudflare→origin path could occasionally hiccup.

Cloudflare Tunnel removes that dependency entirely:

```text
Without tunnel:  Cloudflare edge -> inbound to 93.127.198.125:443   (depends on inbound reachability)
With tunnel:     VPS (cloudflared) -> outbound 443 -> Cloudflare     (no inbound port needed at all)
```

`cloudflared` on the VPS makes an **outbound** connection to Cloudflare and holds it open. Traffic flows back down that connection, so no one ever needs to reach the VPS IP inbound. This is the bulletproof version when inbound reachability to the VPS IP is the flaky part.

### Setup

On the VPS, install `cloudflared`:

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

Authenticate (opens a browser link to authorize against the Cloudflare account that holds `crtms.in`):

```bash
cloudflared tunnel login
```

Create the tunnel and note the tunnel ID/credentials file it prints:

```bash
cloudflared tunnel create crtms
```

Create the config file:

```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Contents (point the hostname at the local Node app on port 3000):

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: crtms.in
    service: http://127.0.0.1:3000
  - hostname: www.crtms.in
    service: http://127.0.0.1:3000
  - service: http_status:404
```

Route DNS through the tunnel (this creates/updates the proxied CNAME automatically):

```bash
cloudflared tunnel route dns crtms crtms.in
cloudflared tunnel route dns crtms www.crtms.in
```

Run as a service so it survives reboots:

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

### Notes when using a tunnel

- The DNS records for `crtms.in` / `www` become tunnel CNAMEs managed by Cloudflare — remove the old `A @ 93.127.198.125` proxied record to avoid conflict.
- Keep the grey-cloud `ssh.crtms.in` A record for SSH (the tunnel above only routes HTTP).
- Because traffic now hits the Node app directly via `127.0.0.1:3000`, Nginx is no longer in the request path for tunnelled traffic. Leave Nginx running for local/IP access, or route the tunnel at `http://127.0.0.1:80` instead if you want to keep Nginx in front.
- SSL/TLS between Cloudflare and origin is handled inside the tunnel, so the Cloudflare SSL/TLS mode setting becomes irrelevant for tunnelled hostnames.

## Rollback Options

### Option 1: Disable Proxy Only

In Cloudflare DNS, change:

```text
Proxied / orange cloud
```

to:

```text
DNS only / grey cloud
```

Then `crtms.in` will again resolve directly to:

```text
93.127.198.125
```

This is the fastest rollback.

### Option 2: Move Nameservers Back

At the domain registrar, replace Cloudflare nameservers with the old nameservers.

Before changing to Cloudflare, save:

- Current nameservers
- Current DNS records

This makes full rollback simple.

## Initial Cloudflare Settings to Keep Simple

Recommended minimal initial setup:

```text
DNS:
A @ 93.127.198.125 Proxied
CNAME www crtms.in Proxied

SSL/TLS:
Full
```

Avoid enabling extra Cloudflare features initially. First confirm that affected offices can open the site and log in.

## Support Ticket Text

Use this if raising the issue again with Hostinger or an upstream provider:

```text
Intermittent reachability issue to VPS IP 93.127.198.125 / srv976775.hstgr.cloud.

Affected client public IP: 103.206.147.76
Domain: crtms.in
DNS resolves correctly:
crtms.in -> 93.127.198.125

Client cannot establish TCP to ports 80 or 443:
curl -v --connect-timeout 10 http://crtms.in/
Trying 93.127.198.125:80...
No connection.

curl -v --connect-timeout 10 https://crtms.in/
Trying 93.127.198.125:443...
No connection.

Server firewall:
UFW allows 80 and 443 from Anywhere.
No iptables rule blocks 103.206.147.76.
No fail2ban installed.

Server-side tcpdump during client connection attempt:
sudo tcpdump -ni any host 103.206.147.76 and tcp
No traffic captured.

Client traceroute:
tracert 93.127.198.125
Route reaches 82.25.121.69, then times out until hop 30.

Please check upstream routing, BGP path, provider firewall, or DDoS filtering for traffic from 103.206.147.76 or its ISP path to 93.127.198.125.
```
