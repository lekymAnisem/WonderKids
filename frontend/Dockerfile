FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY routes ./routes
COPY views ./views
COPY public ./public
COPY lib ./lib
COPY data ./data
RUN mkdir -p uploads && chown -R node:node /app
USER 1000
EXPOSE 3000
CMD ["node", "server.js"]