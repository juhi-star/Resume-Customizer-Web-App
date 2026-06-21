import os
import sys

backend = os.path.join(os.path.dirname(__file__), "backend")
os.chdir(backend)
sys.path.insert(0, backend)

from api import app
