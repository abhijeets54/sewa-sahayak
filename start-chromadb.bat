@echo off
echo Starting ChromaDB server...
echo.
echo Checking if Docker is available...

docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed or not in PATH
    echo Please install Docker Desktop and try again
    echo.
    echo Alternative: Install Python and run:
    echo   pip install chromadb
    echo   chroma run --host 0.0.0.0 --port 8000
    pause
    exit /b 1
)

echo Docker found! Starting ChromaDB container...
docker run -d --name seva-chromadb -p 8000:8000 -e CHROMA_SERVER_CORS_ALLOW_ORIGINS=["http://localhost:3000"] chromadb/chroma

echo.
echo ChromaDB is starting up...
echo It will be available at http://localhost:8000
echo.
echo To stop ChromaDB later, run:
echo   docker stop seva-chromadb
echo   docker rm seva-chromadb
echo.
pause