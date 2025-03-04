# Set the default shell
SHELL := /bin/bash

# Define package manager (npm or yarn)
PKG_MANAGER := npm

# Default target: show available commands
.DEFAULT_GOAL := help

# Mark all targets as phony
.PHONY: help install start build lint format test clean all startbk kill check-dependencies

# Help command (list available commands)
help:
	@echo "Available commands:"
	@echo "  make all      - Run frontend (install, lint, format, test, build, start)"
	@echo "  make startbk  - Start backend (Redis + Node.js server)"
	@echo "  make kill     - Stop Redis & clear cache"
	@echo "  make install  - Install dependencies"
	@echo "  make start    - Start the frontend development server"
	@echo "  make build    - Build the frontend for production"
	@echo "  make lint     - Run ESLint to check code quality"
	@echo "  make clean    - Remove node_modules and build files"

# ----------------- FRONTEND COMMANDS -----------------
# Install dependencies if missing
install:
	@if [ ! -d "node_modules" ]; then \
		echo "⚠️  Dependencies not found! Installing..."; \
		$(PKG_MANAGER) install; \
	else \
		echo "✅ Dependencies already installed!"; \
	fi

# Check and install necessary dependencies
check-dependencies:
	@echo "🔍 Checking dependencies..."
	@if ! npx prettier --version > /dev/null 2>&1; then \
		echo "🚀 Installing Prettier..."; \
		$(PKG_MANAGER) install --save-dev prettier; \
	fi
	@if ! npx eslint --version > /dev/null 2>&1; then \
		echo "🚀 Installing ESLint..."; \
		$(PKG_MANAGER) install --save-dev eslint; \
	fi
	@echo "✅ All dependencies are installed!"

# Start frontend development server
start: check-dependencies
	$(PKG_MANAGER) run dev

# Build frontend for production
build: check-dependencies
	$(PKG_MANAGER) run build

# Run ESLint
lint: check-dependencies
	$(PKG_MANAGER) run lint

# Remove node_modules and build files (clean frontend)
clean:
	rm -rf node_modules dist build

# Run everything for frontend only
all: install lint build start

# ----------------- BACKEND COMMANDS -----------------

# Start backend (Redis + Node.js server)
startbk:
	@echo "🚀 Starting Redis server..."
	redis-server --daemonize yes
	@echo "✅ Redis started!"
	@echo "🚀 Starting Node.js backend..."
	node server.js &

# Stop Redis and clear cache
kill:
	@echo "🛑 Stopping Redis and clearing cache..."
	redis-cli FLUSHALL
	redis-cli shutdown || echo "⚠️ Redis is not running"

	@echo "🔍 Finding process on port 5001..."
	@pid=$$(lsof -t -i:5001); \
	if [ -n "$$pid" ]; then \
		echo "🚨 Killing process on port 5001 (PID: $$pid)"; \
		kill -9 $$pid; \
	else \
		echo "✅ No process is running on port 5001"; \
	fi

