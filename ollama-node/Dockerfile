FROM ollama/ollama:latest

# Copy the configuration and the startup script into the container
COPY config.yaml /app/config.yaml
COPY start.sh /start.sh

# Make the script executable
RUN chmod +x /start.sh

# This script will run when the container starts
CMD ["/start.sh"]
