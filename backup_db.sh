#!/bin/bash
ENV_PATH="./backend/.env"

# Load environment variables from the .env file in the backend directory
if [ -f "$ENV_PATH" ]; then
    export $(cat "$ENV_PATH" | grep -v ^# | xargs)
else
    echo "Error: .env file not found in the backend directory."
    exit 1
fi

# Check if the required environment variables are set
if [ -z "$DB_MONGO_HOST" ] || [ -z "$DB_MONGO_DATABASE" ] || [ -z "$BACKUP_DIR" ]; then
    echo "Error: Missing required environment variables. Please make sure DB_MONGO_HOST, DB_MONGO_DATABASE, and BACKUP_DIR are set in your .env file."
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup file name with timestamp
backup_file="$BACKUP_DIR/$(date +"%Y-%m-%d-%H-%M-%S")-$DB_MONGO_DATABASE-dump.tar.gz"

# Dump the MongoDB database
mongodump --uri="mongodb://$DB_MONGO_HOST" --db="$DB_MONGO_DATABASE" --archive="$backup_file" --gzip

if [ $? -eq 0 ]; then
    echo "MongoDB database '$DB_MONGO_DATABASE' dumped successfully to $backup_file"
else
    echo "Error: Failed to dump MongoDB database '$DB_MONGO_DATABASE'"
    exit 1
fi
