"""
Settings and environment configuration
Load environment variables from .env file using python-dotenv
"""

import os
from dotenv import load_dotenv
from .app_config import APP_NAME, APP_VERSION, DEBUG

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_bt1RPUL4IXoQ@ep-rough-firefly-amhjfuv8.c-5.us-east-1.aws.neon.tech/employee-engagement?sslmode=require"
)
# API settings
API_V1_STR = "/api/v1"