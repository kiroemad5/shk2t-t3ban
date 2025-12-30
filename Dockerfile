# syntax = docker/dockerfile:1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Optionally set environment at build time
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config 

# Install node modules (cacheable layer)
COPY package*.json ./

# Use npm ci for reproducible installs; conditionally install dev deps
RUN if ["$NODE_ENV"="production"]; \
    then npm install --only=production; \
    else npm install  ; \
    fi 

# Copy application code
COPY . .

# Final stage for app image
FROM base AS runtime

# Copy built application (includes node_modules from build stage)
COPY --from=build /app /app

# Ensure production env in runtime image
ENV NODE_ENV=${NODE_ENV}

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000

# Run Node (avoid nodemon in containers)
CMD [ "node", "./src/server.js" ]
