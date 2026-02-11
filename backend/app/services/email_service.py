import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

SMTP_HOST     = os.getenv("SMTP_HOST",     "sandbox.smtp.mailtrap.io")
SMTP_PORT     = int(os.getenv("SMTP_PORT", 587))
SMTP_USER     = os.getenv("MAILTRAP_USER", "")
SMTP_PASS     = os.getenv("MAILTRAP_PASS", "")
MAIL_FROM     = os.getenv("MAIL_FROM",     "noreply@cendres-et-vapeur.colony")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Cendres et Vapeur")
EDITOR_EMAIL  = os.getenv("EDITOR_EMAIL",  "editor@colony.local")


async def _send(to: str, subject: str, html: str, plain: str) -> None:
    """Envoie un email via SMTP (Mailtrap en dev, SendGrid en prod)."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
    msg["To"]      = to

    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USER,
        password=SMTP_PASS,
        start_tls=True,
    )


async def send_otp_email(to: str, code: str) -> None:
    subject = "⚙ Code de vérification — Cendres et Vapeur"

    html = f"""
    <div style="background:#0d0b08;color:#d4c9a8;font-family:monospace;padding:32px;max-width:480px;border:1px solid #b87333;">
      <h2 style="color:#c8860a;letter-spacing:3px;">CENDRES ET VAPEUR</h2>
      <p>Technicien,</p>
      <p>Voici votre code d'accès à la zone franche :</p>
      <div style="background:#1a1612;border:1px solid #b87333;padding:16px;text-align:center;margin:24px 0;">
        <span style="font-size:32px;color:#e8a020;letter-spacing:8px;font-weight:bold;">{code}</span>
      </div>
      <p style="color:#9a8e78;font-size:12px;">Ce code expire dans <strong style="color:#d4c9a8;">10 minutes</strong>.</p>
      <p style="color:#9a8e78;font-size:12px;">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
      <hr style="border-color:#b87333;margin:24px 0;">
      <p style="color:#6a5e48;font-size:11px;">Guilde Marchande — Zone Franche, Secteur 4</p>
    </div>
    """

    plain = (
        f"Cendres et Vapeur — Code de vérification\n\n"
        f"Votre code OTP : {code}\n\n"
        f"Ce code expire dans 10 minutes.\n"
        f"Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."
    )

    await _send(to, subject, html, plain)


async def send_contact_email(
    sender_name:  str,
    sender_email: str,
    subject:      str,
    message:      str,
) -> None:
    """Envoie le message de contact à l'editor."""
    full_subject = f"[Contact] {subject}"

    html = f"""
    <div style="background:#0d0b08;color:#d4c9a8;font-family:monospace;padding:32px;max-width:600px;border:1px solid #b87333;">
      <h2 style="color:#c8860a;letter-spacing:3px;">BUREAU DE POSTE — NOUVEAU MESSAGE</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="color:#9a8e78;padding:4px 0;width:120px;">De :</td>
          <td style="color:#d4c9a8;">{sender_name} &lt;{sender_email}&gt;</td>
        </tr>
        <tr>
          <td style="color:#9a8e78;padding:4px 0;">Sujet :</td>
          <td style="color:#d4c9a8;">{subject}</td>
        </tr>
      </table>
      <div style="background:#1a1612;border:1px solid #b87333;padding:16px;white-space:pre-wrap;">
{message}
      </div>
      <hr style="border-color:#b87333;margin:24px 0;">
      <p style="color:#6a5e48;font-size:11px;">Message reçu via le formulaire de contact de la zone franche.</p>
    </div>
    """

    plain = (
        f"Nouveau message de contact\n\n"
        f"De : {sender_name} <{sender_email}>\n"
        f"Sujet : {subject}\n\n"
        f"Message :\n{message}"
    )

    try:
        await _send(EDITOR_EMAIL, full_subject, html, plain)
        logger.info(f"Message de contact envoyé à {EDITOR_EMAIL}")
    except Exception as e:
        logger.warning(f"[DEV] Impossible d'envoyer le contact : {e}")
        raise