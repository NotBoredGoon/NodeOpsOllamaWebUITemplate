# Start the Ollama server in the background
/bin/ollama serve &

# Capture the process ID of the server
pid=$!

echo "Ollama server started. Waiting for it to be ready..."
sleep 5 # Wait for the server to initialize

/pull_models.sh

echo "Ollama is ready."

# Wait for the background Ollama server process to exit, keeping the container alive
wait $pid
