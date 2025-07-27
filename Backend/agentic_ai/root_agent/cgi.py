"""
Mock cgi module for Python 3.13+ compatibility.
The cgi module was removed in Python 3.13, but some packages still try to import it.
This provides the minimal functionality needed.
"""

import urllib.parse as _urllib_parse
from collections.abc import Mapping
from io import StringIO
import sys

# Mock classes and functions that might be used
class FieldStorage:
    """Mock FieldStorage class"""
    def __init__(self, fp=None, headers=None, outerboundary=b'',
                 environ=None, keep_blank_values=0, strict_parsing=0,
                 limit=None, encoding='utf-8', errors='replace',
                 max_num_fields=None, separator='&'):
        self.list = []
        self.file = None
        self.value = None
        self.filename = None
        self.name = None

def parse_qs(qs, keep_blank_values=False, strict_parsing=False, 
             encoding='utf-8', errors='replace', max_num_fields=None, separator='&'):
    """Parse query string"""
    return _urllib_parse.parse_qs(qs, keep_blank_values, strict_parsing, 
                                  encoding, errors, max_num_fields, separator)

def parse_qsl(qs, keep_blank_values=False, strict_parsing=False,
              encoding='utf-8', errors='replace', max_num_fields=None, separator='&'):
    """Parse query string into list of tuples"""
    return _urllib_parse.parse_qsl(qs, keep_blank_values, strict_parsing,
                                   encoding, errors, max_num_fields, separator)

def escape(s, quote=False):
    """Escape HTML characters"""
    import html
    return html.escape(s, quote)

def print_exception():
    """Print exception information"""
    import traceback
    traceback.print_exc()

def print_environ(environ=None):
    """Print environment variables"""
    if environ is None:
        import os
        environ = os.environ
    for key, value in environ.items():
        print(f"{key}={value}")

# Additional constants that might be needed
maxlen = 0

# Mock functions
def parse_header(line):
    """Parse Content-Type like header"""
    parts = line.split(';')
    main_type = parts[0].strip()
    pdict = {}
    for p in parts[1:]:
        if '=' in p:
            i = p.find('=')
            name = p[:i].strip().lower()
            value = p[i+1:].strip()
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            pdict[name] = value
    return main_type, pdict

def parse_multipart(fp, pdict, encoding="utf-8", errors="replace", separator="&"):
    """Parse multipart data (mock implementation)"""
    return []

# For backward compatibility
def parse(fp=None, environ=None, keep_blank_values=0, strict_parsing=0):
    """Parse form data (mock implementation)"""
    return FieldStorage(fp, environ=environ, 
                       keep_blank_values=keep_blank_values,
                       strict_parsing=strict_parsing)

def test():
    """Test function"""
    print("Mock cgi module loaded successfully")

if __name__ == "__main__":
    test() 