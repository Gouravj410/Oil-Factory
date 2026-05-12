#!/usr/bin/env python3
"""
FMCG Reward System — Admin CLI
Usage: python admin_cli.py [command] [options]
"""
import json, sys, os, csv
import urllib.request, urllib.parse, urllib.error
from datetime import datetime

BASE_URL = os.getenv("FMCG_API_URL", "http://localhost:5000")
TOKEN_FILE = os.path.join(os.path.dirname(__file__), ".fmcg_token")

# ── HTTP helpers ───────────────────────────────────────────────
def _request(method, path, body=None, stream=False):
    token = _load_token()
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            if stream:
                return r.read(), r.headers.get("Content-Type", "")
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        err = json.loads(e.read())
        print(f"\n❌  Error {e.code}: {err.get('error', err.get('message', 'Unknown error'))}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\n❌  Cannot connect to {BASE_URL}. Is the backend running?")
        sys.exit(1)

def get(path): return _request("GET", path)
def post(path, body=None): return _request("POST", path, body)
def put(path, body): return _request("PUT", path, body)
def delete(path): return _request("DELETE", path)

def _save_token(t): open(TOKEN_FILE, "w").write(t)
def _load_token():
    if os.path.exists(TOKEN_FILE): return open(TOKEN_FILE).read().strip()
    return None

def _check_auth():
    if not _load_token():
        print("❌  Not logged in. Run: python admin_cli.py login")
        sys.exit(1)

# ── Pretty print ───────────────────────────────────────────────
def pp(data, indent=0):
    pad = "  " * indent
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                print(f"{pad}\033[36m{k}:\033[0m"); pp(v, indent+1)
            else:
                print(f"{pad}\033[36m{k}:\033[0m {v}")
    elif isinstance(data, list):
        for i, item in enumerate(data):
            print(f"{pad}[{i}]"); pp(item, indent+1)
    else:
        print(f"{pad}{data}")

def table(rows, cols):
    widths = {c: max(len(c), max((len(str(r.get(c,""))) for r in rows), default=0)) for c in cols}
    header = "  ".join(c.upper().ljust(widths[c]) for c in cols)
    sep    = "  ".join("─" * widths[c] for c in cols)
    print(f"\033[90m{sep}\033[0m")
    print(f"\033[1m{header}\033[0m")
    print(f"\033[90m{sep}\033[0m")
    for r in rows:
        print("  ".join(str(r.get(c,"")).ljust(widths[c]) for c in cols))
    print(f"\033[90m{sep}\033[0m")
    print(f"\033[90m{len(rows)} row(s)\033[0m\n")

def ok(msg): print(f"\n\033[32m✅  {msg}\033[0m\n")
def info(msg): print(f"\033[33m➤  {msg}\033[0m")
def hdr(msg): print(f"\n\033[1;34m{'─'*50}\n  {msg}\n{'─'*50}\033[0m\n")

# ══════════════════════════════════════════════════════
# COMMANDS
# ══════════════════════════════════════════════════════

def cmd_login(args):
    """Login to admin panel"""
    import getpass
    username = input("Username: ").strip()
    password = getpass.getpass("Password: ")
    res = post("/api/auth/login", {"username": username, "password": password})
    if res.get("success"):
        _save_token(res["data"]["access_token"])
        d = res["data"]
        ok(f"Logged in as '{d['username']}' (role: {d['role']})")
    else:
        print(f"❌  {res.get('error', 'Login failed')}")

def cmd_logout(args):
    if os.path.exists(TOKEN_FILE): os.remove(TOKEN_FILE)
    ok("Logged out")

def cmd_profile(args):
    _check_auth()
    hdr("Admin Profile")
    res = get("/api/auth/profile")
    pp(res.get("data", {}))

def cmd_dashboard(args):
    _check_auth()
    hdr("Dashboard Statistics")
    res = get("/api/admin/dashboard")
    d = res.get("data", {})

    qr  = d.get("qr_codes", {})
    sub = d.get("submissions", {})
    sch = d.get("schemes", {})
    win = d.get("winners", {})

    print(f"  \033[1m📱 QR CODES\033[0m")
    print(f"     Total:    {qr.get('total',0):,}")
    print(f"     Used:     {qr.get('used',0):,}  ({qr.get('usage_percentage',0):.1f}%)")
    print(f"     Remaining:{qr.get('remaining',0):,}\n")

    print(f"  \033[1m📥 SUBMISSIONS\033[0m")
    print(f"     Total:    {sub.get('total_submissions',0):,}")
    print(f"     Winners:  {sub.get('total_winners',0):,}")
    print(f"     Cities:   {sub.get('unique_cities',0):,}\n")

    print(f"  \033[1m📋 SCHEMES\033[0m")
    print(f"     Active:   {sch.get('active',0)}")
    print(f"     Total:    {sch.get('total',0)}\n")

    print(f"  \033[1m🏆 WINNERS\033[0m")
    print(f"     Total:    {win.get('total_winners',0):,}")
    print(f"     Announced:{win.get('announced',0):,}")
    print(f"     Pending:  {win.get('pending_announcement',0):,}\n")

def cmd_schemes(args):
    _check_auth()
    hdr("Campaign Schemes")
    res = get("/api/schemes?per_page=100")
    schemes = res.get("data", {}).get("schemes", [])
    if not schemes: print("  No schemes found.\n"); return
    rows = [{
        "id": s["id"], "title": s["title"][:30], "active": "✅" if s["is_active"] else "❌",
        "qr_total": f"{s.get('total_qr_codes',0):,}", "usage": f"{s.get('usage_percentage',0):.1f}%"
    } for s in schemes]
    table(rows, ["id","title","active","qr_total","usage"])

def cmd_create_scheme(args):
    _check_auth()
    hdr("Create Campaign Scheme")
    title   = input("Title: ").strip()
    desc    = input("Description: ").strip()
    reward  = input("Reward text (shown to user): ").strip()
    details = input("Reward details: ").strip()
    start   = input("Start date (YYYY-MM-DD): ").strip()
    end     = input("End date   (YYYY-MM-DD): ").strip()
    res = post("/api/schemes", {
        "title": title, "description": desc,
        "reward_text": reward, "reward_details": details,
        "start_date": f"{start}T00:00:00Z", "end_date": f"{end}T23:59:59Z"
    })
    if res.get("success"): ok(f"Scheme created! ID={res['data']['id']}")

def cmd_batches(args):
    _check_auth()
    hdr("QR Batches")
    res = get("/api/admin/batches?per_page=100")
    batches = res.get("data", {}).get("batches", [])
    if not batches: print("  No batches found.\n"); return
    rows = [{
        "id": b["id"], "name": b["batch_name"][:28], "total": f"{b.get('total_codes',0):,}",
        "used": f"{b.get('used_codes',0):,}", "usage": f"{b.get('usage_percentage',0):.1f}%"
    } for b in batches]
    table(rows, ["id","name","total","used","usage"])

def cmd_create_batch(args):
    _check_auth()
    hdr("Create QR Batch")
    name     = input("Batch name: ").strip()
    qty      = int(input("Quantity (QR codes): ").strip())
    scheme   = input("Scheme ID (leave blank for none): ").strip()
    body     = {"batch_name": name, "quantity": qty}
    if scheme: body["scheme_id"] = int(scheme)
    res = post("/api/admin/batch/create", body)
    if res.get("success"):
        ok(f"Batch created! ID={res['data']['batch_id']} — generating {qty:,} QR codes…")

def cmd_batch_detail(args):
    _check_auth()
    bid = args[0] if args else input("Batch ID: ").strip()
    hdr(f"Batch #{bid}")
    res = get(f"/api/admin/batch/{bid}")
    pp(res.get("data", {}))

def cmd_submissions(args):
    _check_auth()
    hdr("Recent Submissions")
    period = args[0] if args else ""
    path   = f"/api/admin/submissions?per_page=20{('&period='+period) if period else ''}"
    res    = get(path)
    subs   = res.get("data", {}).get("submissions", [])
    pag    = res.get("data", {}).get("pagination", {})
    if not subs: print("  No submissions found.\n"); return
    rows = [{
        "id": s["id"], "name": s["name"], "phone": s["phone"],
        "city": s["city"], "winner": "🏆" if s.get("is_winner") else "",
        "date": s.get("submitted_at","")[:10]
    } for s in subs]
    table(rows, ["id","name","phone","city","winner","date"])
    print(f"  Total: {pag.get('total',0):,} submissions  |  Page 1 of {pag.get('total_pages',1)}")

def cmd_export_submissions(args):
    _check_auth()
    info("Downloading submissions CSV…")
    data, ctype = _request("GET", "/api/admin/submissions/export", stream=True)
    fname = f"submissions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    open(fname, "wb").write(data)
    ok(f"Saved to {fname}")

def cmd_winners(args):
    _check_auth()
    hdr("Winners")
    res = get("/api/winners?per_page=20")
    winners = res.get("data", {}).get("winners", [])
    stats   = get("/api/winners/statistics").get("data", {})
    print(f"  Total: {stats.get('total_winners',0):,}  |  Announced: {stats.get('announced',0):,}  |  Pending: {stats.get('pending_announcement',0):,}\n")
    if not winners: print("  No winners yet.\n"); return
    rows = [{
        "id": w["submission_id"], "name": w["name"],
        "phone": w["phone"], "city": w["city"],
        "announced": "✅" if w.get("announced") else "⏳"
    } for w in winners]
    table(rows, ["id","name","phone","city","announced"])

def cmd_select_winners(args):
    _check_auth()
    hdr("Select Random Winners")
    scheme = input("Scheme ID: ").strip()
    count  = int(input("Number of winners: ").strip())
    res = post("/api/winners/select-random", {"scheme_id": int(scheme), "count": count})
    if res.get("success"):
        ok(f"{res['data']['winners_selected']} winners selected!")
        winners = res["data"].get("winners", [])
        if winners:
            rows = [{"name": w["name"], "phone": w["phone"], "city": w["city"]} for w in winners[:10]]
            table(rows, ["name","phone","city"])

def cmd_announce(args):
    _check_auth()
    sid = args[0] if args else input("Submission ID to announce: ").strip()
    res = post(f"/api/winners/{sid}/announce")
    if res.get("success"): ok(f"Winner #{sid} announced!")

def cmd_export_winners(args):
    _check_auth()
    info("Downloading winners CSV…")
    data, _ = _request("GET", "/api/winners/export", stream=True)
    fname = f"winners_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    open(fname, "wb").write(data)
    ok(f"Saved to {fname}")

def cmd_validate_qr(args):
    code = args[0] if args else input("QR Code: ").strip()
    hdr(f"QR Validation: {code}")
    res = get(f"/api/qr/validate/{code}")
    pp(res.get("data", {}))

def cmd_help(args=None):
    print("""
\033[1;34m FMCG Admin CLI — Available Commands \033[0m
──────────────────────────────────────────────
  \033[36mAuth\033[0m
    login              Login to admin panel
    logout             Clear saved token
    profile            View admin profile

  \033[36mDashboard\033[0m
    dashboard          Show all statistics

  \033[36mCampaign Schemes\033[0m
    schemes            List all campaigns
    create-scheme      Create new campaign

  \033[36mQR Batches\033[0m
    batches            List all batches
    create-batch       Generate a new batch
    batch <id>         View batch details

  \033[36mSubmissions\033[0m
    submissions [period]  List (today/week/month)
    export-submissions    Download CSV

  \033[36mWinners\033[0m
    winners            List winners
    select-winners     Random winner selection
    announce <id>      Announce a winner
    export-winners     Download winners CSV

  \033[36mQR\033[0m
    validate-qr <code>  Validate a QR code

  \033[36mOther\033[0m
    help               Show this help

\033[90mExample: python admin_cli.py login\033[0m
""")

# ── Command router ─────────────────────────────────────────────
COMMANDS = {
    "login":               cmd_login,
    "logout":              cmd_logout,
    "profile":             cmd_profile,
    "dashboard":           cmd_dashboard,
    "schemes":             cmd_schemes,
    "create-scheme":       cmd_create_scheme,
    "batches":             cmd_batches,
    "create-batch":        cmd_create_batch,
    "batch":               cmd_batch_detail,
    "submissions":         cmd_submissions,
    "export-submissions":  cmd_export_submissions,
    "winners":             cmd_winners,
    "select-winners":      cmd_select_winners,
    "announce":            cmd_announce,
    "export-winners":      cmd_export_winners,
    "validate-qr":         cmd_validate_qr,
    "help":                cmd_help,
}

if __name__ == "__main__":
    argv = sys.argv[1:]
    cmd  = argv[0].lower() if argv else "help"
    rest = argv[1:]
    fn   = COMMANDS.get(cmd)
    if fn:
        fn(rest)
    else:
        print(f"❌  Unknown command: '{cmd}'")
        cmd_help()
