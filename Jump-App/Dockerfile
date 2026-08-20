FROM mcr.microsoft.com/playwright:v1.56.0-jammy

# 1. Install system dependencies as root
USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jre-headless \
    curl \
    gnupg \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
    && apt-get update && apt-get install -y google-cloud-cli \
    && rm -rf /var/lib/apt/lists/*

# 2. Set up the working directory early
WORKDIR /app


# 3. Cache dependencies and Install Playwright browsers and their OS dependencies (Stay as root to ensure npm can install globally if needed)
COPY package*.json ./
RUN npm ci
RUN npx playwright install --with-deps


# 4. Copy the rest of the application
COPY . .
USER root
RUN chmod -R 777 /app

# 5. Set ownership to 'pwuser' instead of using 777
# This is more secure than chmod 777.
#RUN chown -R pwuser:pwuser /app && chmod +x ./run-tests.sh

# 6. Switch to non-root user for security
#USER pwuser

ENV NODE_ENV=staging
CMD ["./run-tests.sh"]
