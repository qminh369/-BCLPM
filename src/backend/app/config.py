import os

# Cấu hình ứng dụng — có thể ghi đè bằng biến môi trường
SECRET_KEY = os.getenv("SECRET_KEY", "doi-secret-key-nay-trong-production-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 giờ

# Đường dẫn database SQLite (mount volume trong Docker để lưu bền vững)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/apartment.db")
