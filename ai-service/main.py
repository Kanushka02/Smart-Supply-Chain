from fastapi import FastAPI

app = FastAPI(
    title="Smart Supply Chain AI Service",
    version="1.0.0",
    description="AI Microservice for Demand Prediction"
)


@app.get("/")
def root():
    return {
        "message": "AI Service Running 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "AI Microservice"
    }
