#!/usr/bin/env python3
import json
import base64
import cgi
import hashlib
import hmac
import os
import re
import secrets
import smtplib
import time
import uuid
from email.message import EmailMessage
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = ROOT / "assets" / "adverts"
USERS_FILE = ROOT / "admin" / "users.local.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
PDF_EXTENSIONS = {".pdf"}
POST_CONTENT_KEYS = {"notices", "vacancies", "tenders"}
ADMIN_CONTENT_KEYS = {"information", "contact_form", "contact_cards", "contact_submissions", "visitor_analytics"}
SESSIONS = {}
CONTENT_FILES = {
    "information": ROOT / "content" / "information.json",
    "notices": ROOT / "content" / "notices.json",
    "vacancies": ROOT / "content" / "vacancies.json",
    "tenders": ROOT / "content" / "tenders.json",
    "contact_form": ROOT / "content" / "contact-form.json",
    "contact_cards": ROOT / "content" / "contact-cards.json",
    "contact_submissions": ROOT / "content" / "contact-submissions.json",
    "visitor_analytics": ROOT / "content" / "visitor-analytics.json",
}


class LocalAdminHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        parsed = urlparse(path)
        relative = parsed.path.lstrip("/")
        return str((ROOT / relative).resolve())

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        route = urlparse(self.path).path
        if route == "/admin/users.local.json":
            self.send_error(404)
            return

        if route == "/admin/local.html":
            self.send_response(302)
            self.send_header("Location", "/admin/")
            self.end_headers()
            return

        if route == "/admin/post-editor.html" and not self.require_role({"editor"}):
            return

        if route == "/__local-admin/session":
            session = self.current_session()
            self.send_json({"authenticated": bool(session), "user": public_user(session) if session else None})
            return

        if route == "/__local-admin/users":
            if not self.require_role({"admin"}, api=True):
                return
            self.send_json({"users": public_users()})
            return

        if route == "/__local-admin/files":
            if not self.require_role({"editor"}, api=True):
                return
            session = self.current_session()
            visible_files = {
                key: CONTENT_FILES[key]
                for key in [*sorted(POST_CONTENT_KEYS), "contact_form", "contact_submissions", "visitor_analytics"]
            }
            self.send_json({
                key: json.loads(path.read_text(encoding="utf-8"))
                for key, path in visible_files.items()
            })
            return

        super().do_GET()

    def do_POST(self):
        route = urlparse(self.path).path
        if route == "/__local-admin/login":
            self.handle_login()
            return

        if route == "/__local-admin/logout":
            self.handle_logout()
            return

        if route == "/__local-admin/users":
            if not self.require_role({"admin"}, api=True):
                return
            self.handle_users_save()
            return

        if route == "/__local-admin/upload":
            if not self.require_role({"editor"}, api=True):
                return
            self.handle_upload()
            return

        if route == "/__local-admin/contact-submit":
            self.handle_contact_submit()
            return

        if route != "/__local-admin/save":
            self.send_error(404)
            return

        if not self.require_role({"editor"}, api=True):
            return

        length = int(self.headers.get("content-length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            key = payload["key"]
            data = payload["data"]
        except (KeyError, json.JSONDecodeError, UnicodeDecodeError):
            self.send_error(400, "Invalid save payload")
            return

        path = CONTENT_FILES.get(key)
        if not path:
            self.send_error(400, "Unknown content file")
            return

        session = self.current_session()
        if key not in POST_CONTENT_KEYS:
            self.send_error(403, "Post editor users can only update advert posts")
            return
        current_data = read_json(path, {})
        data = {
            **current_data,
            "items": data.get("items", current_data.get("items", [])),
        }

        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        self.send_json({"ok": True, "file": str(path.relative_to(ROOT))})

    def current_session(self):
        cookie_header = self.headers.get("Cookie", "")
        cookies = SimpleCookie(cookie_header)
        token = cookies.get("aja_admin_session")
        if not token:
            return None

        session = SESSIONS.get(token.value)
        if not session:
            return None

        if session.get("expires", 0) < time.time():
            SESSIONS.pop(token.value, None)
            return None

        return session

    def require_role(self, roles, api=False):
        session = self.current_session()
        if session and session.get("role") in roles:
            return True

        if api:
            self.send_json({"ok": False, "error": "not_authorised"}, status=403 if session else 401)
            return False

        self.send_response(302)
        self.send_header("Location", dashboard_for_role(session.get("role")) if session else "/admin/login.html")
        self.end_headers()
        return False

    def handle_login(self):
        length = int(self.headers.get("content-length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            username = str(payload.get("username", "")).strip().lower()
            password = str(payload.get("password", ""))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_error(400, "Invalid login payload")
            return

        user = find_user(username)
        if not user or user.get("status") != "active" or not verify_password(password, user):
            self.send_json({"ok": False, "error": "Invalid username or password"}, status=401)
            return

        if user.get("role") != "editor":
            self.send_json({
                "ok": False,
                "error": "Admin users must sign in through the GitHub dashboard at /admin/."
            }, status=403)
            return

        token = secrets.token_urlsafe(32)
        SESSIONS[token] = {
            "id": user["id"],
            "name": user.get("name", ""),
            "username": user["username"],
            "role": user["role"],
            "expires": time.time() + 60 * 60 * 8,
        }

        self.send_json(
            {"ok": True, "user": public_user(SESSIONS[token]), "redirect": dashboard_for_role(user["role"])},
            cookies=[f"aja_admin_session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800"],
        )

    def handle_logout(self):
        cookie_header = self.headers.get("Cookie", "")
        cookies = SimpleCookie(cookie_header)
        token = cookies.get("aja_admin_session")
        if token:
            SESSIONS.pop(token.value, None)
        self.send_json(
            {"ok": True},
            cookies=["aja_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"],
        )

    def handle_users_save(self):
        length = int(self.headers.get("content-length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            users = payload["users"]
        except (KeyError, json.JSONDecodeError, UnicodeDecodeError):
            self.send_error(400, "Invalid users payload")
            return

        current_users = read_user_store().get("users", [])
        current_by_id = {user["id"]: user for user in current_users}
        saved_users = []

        for item in users:
            username = str(item.get("username", "")).strip().lower()
            if not username:
                continue

            role = item.get("role")
            if role not in {"admin", "editor"}:
                role = "editor"

            status = item.get("status")
            if status not in {"active", "inactive"}:
                status = "active"

            existing = current_by_id.get(item.get("id")) or find_user(username, current_users)
            user = {
                "id": existing.get("id") if existing else str(uuid.uuid4()),
                "name": str(item.get("name", "")).strip(),
                "username": username,
                "role": role,
                "status": status,
                "createdAt": existing.get("createdAt") if existing else time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            }

            password = str(item.get("password", ""))
            if password:
                user.update(hash_password(password))
            elif existing:
                user["salt"] = existing["salt"]
                user["passwordHash"] = existing["passwordHash"]
            else:
                user.update(hash_password("ChangeMe123"))

            saved_users.append(user)

        if not any(user["role"] == "admin" and user["status"] == "active" for user in saved_users):
            self.send_error(400, "At least one active admin user is required")
            return

        usernames = [user["username"] for user in saved_users]
        if len(usernames) != len(set(usernames)):
            self.send_error(400, "Usernames must be unique")
            return

        write_user_store({"users": saved_users})
        self.send_json({"ok": True, "users": public_users(saved_users)})

    def handle_upload(self):
        length = int(self.headers.get("content-length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            section = safe_segment(payload["section"])
            filename = safe_filename(payload["filename"])
            content = base64.b64decode(payload["content"])
        except (KeyError, ValueError, json.JSONDecodeError, UnicodeDecodeError):
            self.send_error(400, "Invalid upload payload")
            return

        if section not in POST_CONTENT_KEYS:
            self.send_error(403, "Uploads are only available for advert posts")
            return

        extension = Path(filename).suffix.lower()
        if extension in IMAGE_EXTENSIONS:
            kind = "image"
        elif extension in PDF_EXTENSIONS:
            kind = "pdf"
        else:
            self.send_error(400, "Only image and PDF uploads are supported")
            return

        upload_dir = UPLOAD_ROOT / section
        upload_dir.mkdir(parents=True, exist_ok=True)

        stem = Path(filename).stem[:64] or "advert-file"
        target_name = f"{int(time.time() * 1000)}-{stem}{extension}"
        target = upload_dir / target_name
        target.write_bytes(content)

        self.send_json({
            "ok": True,
            "kind": kind,
            "path": str(target.relative_to(ROOT)).replace("\\", "/"),
        })

    def handle_contact_submit(self):
        try:
            form_data = read_form_fields(self)
        except ValueError:
            self.send_error(400, "Invalid contact submission")
            return

        if form_data.get("website"):
            self.send_json({"ok": True, "status": "ignored"})
            return

        config = read_json(CONTENT_FILES["contact_form"], {})
        submissions = read_json(CONTENT_FILES["contact_submissions"], {"submissions": []})
        notification_to = config.get("notificationEmail") or config.get("formRecipient") or "sales@aja.pt"

        record = {
            "id": str(uuid.uuid4()),
            "submittedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "notificationTo": notification_to,
            "notificationStatus": "pending",
            "name": form_data.get("name", ""),
            "company": form_data.get("company", ""),
            "country": form_data.get("country", ""),
            "email": form_data.get("email", ""),
            "phone": form_data.get("phone", ""),
            "enquiryType": form_data.get("enquiryType", ""),
            "grade": form_data.get("grade", ""),
            "quantity": form_data.get("quantity", ""),
            "message": form_data.get("message", ""),
        }
        record["notificationStatus"] = send_notification(record, config)

        submissions.setdefault("submissions", []).insert(0, record)
        CONTENT_FILES["contact_submissions"].write_text(
            json.dumps(submissions, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        self.send_json({"ok": True, "recordId": record["id"], "notificationStatus": record["notificationStatus"]})

    def send_json(self, data, status=200, cookies=None):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        for cookie in cookies or []:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)


def read_json(path, fallback):
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback


def read_user_store():
    ensure_user_store()
    return read_json(USERS_FILE, {"users": []})


def write_user_store(data):
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    USERS_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def ensure_user_store():
    if USERS_FILE.exists():
        return

    admin_password = os.environ.get("AJA_LOCAL_ADMIN_PASSWORD", "admin123")
    user = {
        "id": str(uuid.uuid4()),
        "name": "Admin",
        "username": "admin",
        "role": "admin",
        "status": "active",
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    user.update(hash_password(admin_password))
    write_user_store({"users": [user]})


def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120000,
    ).hex()
    return {"salt": salt, "passwordHash": digest}


def verify_password(password, user):
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        user.get("salt", "").encode("utf-8"),
        120000,
    ).hex()
    return hmac.compare_digest(digest, user.get("passwordHash", ""))


def find_user(username, users=None):
    if users is None:
        users = read_user_store().get("users", [])
    for user in users:
        if user.get("username") == username:
            return user
    return None


def public_user(user):
    if not user:
        return None
    return {
        "id": user.get("id"),
        "name": user.get("name", ""),
        "username": user.get("username", ""),
        "role": user.get("role", ""),
        "status": user.get("status", "active"),
    }


def public_users(users=None):
    if users is None:
        users = read_user_store().get("users", [])
    return [public_user(user) for user in users]


def dashboard_for_role(role):
    if role == "admin":
        return "/admin/"
    return "/admin/post-editor.html"


def read_form_fields(handler):
    content_type = handler.headers.get("content-type", "")
    if content_type.startswith("application/json"):
        length = int(handler.headers.get("content-length", "0"))
        return json.loads(handler.rfile.read(length).decode("utf-8"))

    form = cgi.FieldStorage(
        fp=handler.rfile,
        headers=handler.headers,
        environ={
            "REQUEST_METHOD": "POST",
            "CONTENT_TYPE": content_type,
            "CONTENT_LENGTH": handler.headers.get("content-length", "0"),
        },
    )
    fields = {}
    for key in form.keys():
        value = form[key]
        if isinstance(value, list):
            fields[key] = ", ".join(str(item.value) for item in value)
        else:
            fields[key] = str(value.value)
    return fields


def send_notification(record, config):
    host = os.environ.get("AJA_SMTP_HOST")
    if not host:
        return "not_configured"

    port = int(os.environ.get("AJA_SMTP_PORT", "587"))
    username = os.environ.get("AJA_SMTP_USER", "")
    password = os.environ.get("AJA_SMTP_PASSWORD", "")
    sender = os.environ.get("AJA_SMTP_FROM", username or record["notificationTo"])
    use_tls = os.environ.get("AJA_SMTP_TLS", "1") != "0"

    message = EmailMessage()
    message["From"] = sender
    message["To"] = record["notificationTo"]
    message["Reply-To"] = record["email"]
    message["Subject"] = f"{config.get('formSubjectPrefix', 'Aja Alloys enquiry')}: {record['enquiryType']}"
    message.set_content(
        "\n".join([
            f"Name: {record['name']}",
            f"Company: {record['company']}",
            f"Country: {record['country']}",
            f"Email: {record['email']}",
            f"Phone: {record['phone']}",
            f"Enquiry type: {record['enquiryType']}",
            f"Product or grade: {record['grade']}",
            f"Quantity: {record['quantity']}",
            "",
            record["message"],
        ])
    )

    try:
        with smtplib.SMTP(host, port, timeout=10) as smtp:
            if use_tls:
                smtp.starttls()
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
        return "sent"
    except Exception:
        return "failed"


def safe_segment(value):
    return re.sub(r"[^a-z0-9_-]+", "-", str(value).lower()).strip("-") or "general"


def safe_filename(value):
    name = Path(str(value)).name
    safe = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip(".-")
    if not safe:
        raise ValueError("Missing filename")
    return safe


def main():
    port = 8766
    server = ThreadingHTTPServer(("127.0.0.1", port), LocalAdminHandler)
    print(f"Post editor server running at http://127.0.0.1:{port}/admin/login.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
