"""
Development Server Entry Point
Run with: python run.py
"""

import os
from dotenv import load_dotenv

# Load environment variables FIRST — before any app imports
# config.py reads os.getenv() at class-definition time
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from app import create_app

app = create_app()

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    port = int(os.getenv("FLASK_PORT", 5000))
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    
    print(f"Starting Flask development server on {host}:{port}...")
    app.run(debug=debug, host=host, port=port)
