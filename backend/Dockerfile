# Use an official Node.js image based on Debian to get standard package managers
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

# Copy package.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Create a virtual environment for Python (Recommended in Debian Bullseye+)
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Python requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose the port your Express server uses
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
