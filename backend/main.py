
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from service.config import CORS_ORIGINS, db
from service.auth_service import (
    auto_verify_users_for_testing,
    generate_admin_user,
    generate_role,
    generate_universities,
    generate_kiosks,
)
from fastapi.staticfiles import StaticFiles
import os


def init_app():
    db.init()

    app = FastAPI(
        title= "Printia Project",
        description = "Login Page",
        version= "1.0.0"
    )

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(BASE_DIR, "media"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "uploads"), exist_ok=True)

    app.mount(
        "/media",
        StaticFiles(directory=os.path.join(BASE_DIR, "media")),
        name="media"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup():
        await db.create_all()
        await generate_role()
        await generate_universities()
        await generate_kiosks()
        await generate_admin_user()
        await auto_verify_users_for_testing()

    @app.on_event("shutdown")
    async def shutdown():
        await db.close()

    @app.get("/healthz")
    async def healthz():
        return {"status": "ok"}

    from controller import authentification, users, admin, print_jobs, assistant

    app.include_router(authentification.router)
    app.include_router(users.router)

    app.include_router(admin.router)

    app.include_router(print_jobs.router)
    app.include_router(assistant.router)

    return app

app =init_app()
