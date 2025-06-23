FROM ubuntu:24.04

# Install curl (and any other dependencies)
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama CLI
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy your config and startup script
COPY config.yaml /app/config.yaml
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose Ollama’s default port
EXPOSE 11434

CMD ["/start.sh"]