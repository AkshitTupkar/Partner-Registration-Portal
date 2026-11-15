# Demo image: the registration site, its API and a SQLite database in one service,
# for hosts such as Render or Railway. Not a production setup: the OTP is mocked and
# NODE_ENV is left at development. See README.md, "Deploy a demo".
FROM node:22-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json frontend/
RUN npm ci --prefix frontend
COPY backend/package.json backend/package-lock.json backend/
COPY backend/prisma/schema.prisma backend/prisma/
RUN npm ci --prefix backend

COPY frontend frontend
RUN npm run build --prefix frontend
COPY backend backend
RUN cd backend && npx prisma generate && npm run build

WORKDIR /app/backend
ENV STATIC_DIR=../frontend/dist \
    TRUST_PROXY=1 \
    DATABASE_URL=file:./dev.db \
    PORT=4000
EXPOSE 4000
# Applies migrations, seeds the masters and the demo applicants, then starts the API.
# The database lives inside the container, so it starts fresh on every deploy or restart.
CMD ["npm", "run", "start:demo"]
