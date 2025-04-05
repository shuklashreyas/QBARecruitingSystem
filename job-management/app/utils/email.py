import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")  # e.g., verified sender


def send_reset_email(to_email: str, reset_link: str):
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject="QBA Password Reset",
        html_content=f"""
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="{reset_link}">Reset Password</a>
        <p>If you did not request this, ignore this email.</p>
        """
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print("SendGrid error:", e)
        return None
