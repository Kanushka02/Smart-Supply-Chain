from fastapi import FastAPI

app = FastAPI(title="Smart Supply Chain AI Service")


@app.get("/")
def root():
    return {"status": "ok", "service": "ai-service"}
