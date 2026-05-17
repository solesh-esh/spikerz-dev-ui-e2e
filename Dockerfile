FROM cypress/included:15.15.0

WORKDIR /app
ENTRYPOINT []

ENV CYPRESS_INSTALL_BINARY=0

COPY package*.json ./
RUN npm ci

COPY tsconfig.json cypress.config.ts ./
COPY src ./src
COPY cypress ./cypress

RUN npm run build && npx cypress verify

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
