#!/bin/bash
# BinaryBonds Setup Script

set -e

echo "🚀 BinaryBonds Setup Script"
echo "============================="

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi
echo "✅ Python 3 found: $(python3 --version)"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed"
    exit 1
fi
echo "✅ Yarn found: $(yarn --version)"

if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB 5.0+"
else
    echo "✅ MongoDB found"
fi

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created virtual environment"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
echo "✅ Installed backend dependencies"

# Setup environment
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit backend/.env and set your SECRET_KEY and MONGO_URL"
else
    echo "✅ .env file already exists"
fi

cd ..

# Setup frontend
echo ""
echo "📱 Setting up frontend..."
cd frontend

# Install dependencies
yarn install
echo "✅ Installed frontend dependencies"

cd ..

# Final instructions
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and set your SECRET_KEY (min 32 characters)"
echo "2. Ensure MongoDB is running"
echo "3. Start backend: cd backend && source venv/bin/activate && python -m backend.app"
echo "4. Start frontend: cd frontend && yarn start"
echo ""
echo "📚 API Documentation: http://localhost:8001/docs"
echo "📱 Frontend: Follow Expo instructions after 'yarn start'"
echo ""
echo "Happy coding! 🎉"
