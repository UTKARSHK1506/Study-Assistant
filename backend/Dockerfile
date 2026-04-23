# Use an official Node.js image based on Debian
FROM node:18-bullseye-slim

# Install Python, Tesseract OCR, Poppler (for pdf2image), and other system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json from the backend folder
COPY backend/package*.json ./
RUN npm install

# Create a virtual environment for Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Python requirements from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY backend/ .

# Expose the port your Express server uses
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
