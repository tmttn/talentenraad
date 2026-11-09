FROM node:26-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# A new date busts the cache from here on, so date-dependent static pages are rebuilt nightly.
ARG BUILD_DATE=unknown
ENV BUILD_DATE=$BUILD_DATE
# Next.js salts the Server Action IDs with this key and makes a new random one when it
# is missing (no .next/cache here). A fixed key keeps the IDs the same from build to
# build, so a page opened before a deploy can still save afterwards ("Server Action
# was not found", 409). Empty or absent secret: random key, as before.
RUN --mount=type=secret,id=next_actions_key \
  if [ -s /run/secrets/next_actions_key ]; then \
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_actions_key)"; \
    export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY; \
  else \
    echo "No next_actions_key secret: Server Action IDs change with this build"; \
  fi \
  && echo "Building for $BUILD_DATE" && npm run build

FROM node:26-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends tzdata \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir /data && chown node:node /data
WORKDIR /app
ENV TZ=Europe/Brussels \
  NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0 \
  DATABASE_PATH=/data/talentenraad.db
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/content ./content
COPY --from=build --chown=node:node /app/drizzle ./drizzle
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
