# syntax = docker/dockerfile:1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Build with production defaults; override by passing --build-arg NODE_ENV=development
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build native node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Install node modules (cacheable layer)
COPY package*.json ./
RUN if [ "$NODE_ENV" = "production" ]; then npm install --only=production; else npm install; fi

# Copy application code
COPY . .

# Final stage for app image
FROM base AS runtime

# Ensure production env in runtime image
ENV NODE_ENV=production

# Copy built application (includes node_modules from build stage)
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["node", "./src/server.js"]
