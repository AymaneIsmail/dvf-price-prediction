import os
from enum import Enum
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class LogMode(str, Enum):
    SILENT = "silent"
    PRINT = "print"
    FILE = "file"
    BOTH = "both"

class Logger:
    def __init__(self, name: str = "", mode: LogMode = None, file_path: str = None):
        self.name = name or "default"
        self.mode = mode or LogMode(os.getenv("LOG_MODE", "print"))

        # Création du nom de fichier dynamique basé sur la date
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{self.name}_{timestamp}.log" if self.name else f"{timestamp}.log"
        default_path = os.path.join("logs", filename)

        self.file_path = file_path or os.getenv("LOG_FILE", default_path)

        if self.mode != LogMode.SILENT:
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

    def log(self, message: str, end: str = "\n"):
        if self.mode == LogMode.SILENT:
            return

        timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
        full_message = f"{timestamp} [{self.name}] {message}"

        if self.mode in (LogMode.PRINT, LogMode.BOTH):
            print(full_message, end=end)

        if self.mode in (LogMode.FILE, LogMode.BOTH):
            with open(self.file_path, "a", encoding="utf-8") as f:
                f.write(full_message + "\n")
