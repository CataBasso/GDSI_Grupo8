"""
Rutas para subir archivos
"""
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse
from services.upload_service import UploadService

router = APIRouter(prefix="/upload", tags=["archivos"])


@router.post("/comprobante")
async def upload_comprobante(file: UploadFile = File(...)):
    """Subir archivo de comprobante"""
    return await UploadService.save_comprobante(file)


@router.get("/comprobante/{filename}")
async def get_comprobante(filename: str):
    """Descargar archivo de comprobante"""
    file_path = UploadService.get_comprobante_path(filename)

    return FileResponse(
        file_path,
        filename=filename,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )
