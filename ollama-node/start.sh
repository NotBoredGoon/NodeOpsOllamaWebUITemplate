# Start the Ollama server in the background
/bin/ollama serve &

# Capture the process ID of the server
pid=$!

echo "Ollama server started. Waiting for it to be ready..."
sleep 5 # Wait for the server to initialize

# --- Read models from config.yaml and pull them ---
# We use a simple method here to parse YAML with 'sed' and 'awk'
# which are available in the base image.

MODELS=$(sed -n 's/.*- //p' /app/config.yaml)

for model in $MODELS
do
  echo "--- Pulling model: $model ---"
  /bin/ollama pull $model
  echo "--- Finished pulling $model ---"
done

echo "All specified models have been downloaded. Ollama is ready."

# Wait for the background Ollama server process to exit, keeping the container alive
wait $pid
