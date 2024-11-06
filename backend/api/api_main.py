import uvicorn

from fastapi import FastAPI
from starlette.responses import RedirectResponse, JSONResponse

from backend.api import auth

app = FastAPI(title="SplitIt API", version="1.0.0")
app.include_router(auth.router)


@app.get("/")
async def redirect_to_docs():
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    uvicorn.run(
        app="api_main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )
