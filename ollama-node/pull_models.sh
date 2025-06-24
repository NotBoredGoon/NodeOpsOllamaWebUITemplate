# Exit immediately if a command exits with a non-zero status.
set -e

# Check if the MODELS environment variable is set.
if [ -z "$MODELS" ]; then
  echo "The MODELS environment variable is not set. No models will be pulled."
  # You might want to pull a default model here if desired, e.g.:
  # echo "Pulling a default model: llama3:8b"
  # /bin/ollama pull llama3:8b
  exit 0
fi

echo "MODELS environment variable is set to: $MODELS"
echo "Starting model downloads..."

# Use 'tr' to replace commas with spaces, creating a list that the 'for' loop can iterate over.
# We wrap the variable in quotes to handle potential whitespace issues.
for model in $(echo "$MODELS" | tr ',' ' '); do
  # Trim leading/trailing whitespace from the model name (just in case)
  model_trimmed=$(echo "$model" | xargs)
  
  if [ -n "$model_trimmed" ]; then
    echo "----------------------------------------"
    echo "--- Pulling model: $model_trimmed ---"
    echo "----------------------------------------"
    /bin/ollama pull "$model_trimmed"
    echo "--- Finished pulling $model_trimmed ---"
  fi
done

echo "All specified models have been downloaded."
