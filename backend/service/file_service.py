import os
from uuid import uuid4
from pathlib import Path
from datetime import datetime, timedelta, timezone
from fastapi import UploadFile, HTTPException
from pypdf import PdfReader

# Configuración base
UPLOAD_DIR = Path("uploads/users")
ALLOWED_TYPES = {"pdf", "png", "jpg", "jpeg"}
MAX_SIZE_MB = 10

def get_pdf_pages(path: str) -> int:
    try:
        reader = PdfReader(path)
        return len(reader.pages)
    except Exception:
        return 0

class FileService:
    @staticmethod
    async def save_files(files: list[UploadFile], user_id: str, session):
        from model import FileGroup, File

        user_temp_dir = UPLOAD_DIR / user_id / "temp"
        user_temp_dir.mkdir(parents=True, exist_ok=True)


        file_group = FileGroup(
            id=str(uuid4()),
            user_id=user_id,

            expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=2)
        )
        session.add(file_group)
        

        await session.flush()

        saved_files = []

        for file in files:
            file_id = str(uuid4())
            suffix = Path(file.filename).suffix.lower().lstrip(".")
            
            if suffix not in ALLOWED_TYPES:
                raise HTTPException(400, f"Tipo de archivo .{suffix} no permitido")

            contents = await file.read()

            if len(contents) > MAX_SIZE_MB * 1024 * 1024:
                raise HTTPException(400, f"El archivo {file.filename} excede los {MAX_SIZE_MB}MB")

            filename = f"{file_id}.{suffix}"
            file_path = user_temp_dir / filename


            with open(file_path, "wb") as buffer:
                buffer.write(contents)

 
            pages = get_pdf_pages(str(file_path)) if suffix == "pdf" else 1


            db_file = File(
                id=file_id,
                user_id=user_id,
                file_group_id=file_group.id, 
                filename=file.filename,
                file_path=str(file_path),
                file_type=suffix,
                size=len(contents),
                pages=pages
            )

            session.add(db_file)
            saved_files.append(db_file)

        try:
            await session.commit()

            await session.refresh(file_group) 
        except Exception as e:
            await session.rollback()
            print(f"Error en commit: {e}")
            raise HTTPException(500, "Error al finalizar la subida en base de datos")

        return file_group, saved_files