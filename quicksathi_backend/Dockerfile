# TiptoBook API: one image for any container host (Railway builds this automatically when the
# service root is quicksathi_backend; Render, Fly, a VPS or `docker run` work the same way).
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies first so this layer is cached between code changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

USER node
# The host sets PORT; 5050 is only the local default.
ENV PORT=5050
EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5050) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
