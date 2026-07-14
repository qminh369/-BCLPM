# Image chính thức của Playwright đã kèm sẵn trình duyệt + thư viện hệ thống
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /e2e

COPY package.json ./
RUN npm install

COPY . .

# Mặc định chạy toàn bộ test khi container khởi động.
# BASE_URL trỏ tới service frontend trong docker network.
ENV BASE_URL=http://frontend:80
CMD ["npx", "playwright", "test"]
