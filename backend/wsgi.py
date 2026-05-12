"""
WSGI Entry Point for Production
Used by Gunicorn, Heroku, and other production servers
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env")

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
