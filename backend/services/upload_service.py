"""
Servicio para la lógica de negocio de upload de archivos
"""
import os
import time
from fastapi import UploadFile, HTTPException
from pathlib import Path


class UploadService:
    """Servicio para gestionar upload de archivos"""
    
    # Directorio donde se guardarán los archivos
    UPLOAD_DIR = Path("backend/data/uploads")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    async def save_comprobante(file: UploadFile):
        """Guardar archivo de comprobante"""
        try:
            # Validar tipo de archivo
            allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
            if file.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400, 
                    detail="Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG) y PDF"
                )
            
            # Validar tamaño (máximo 10MB)
            max_size = 10 * 1024 * 1024  # 10MB
            file_content = await file.read()
            if len(file_content) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail="El archivo es demasiado grande. Máximo permitido: 10MB"
                )
            
            # Generar nombre único para el archivo
            timestamp = int(time.time())
            file_name = f"{timestamp}_{file.filename.replace(' ', '_')}"
            file_path = UploadService.UPLOAD_DIR / file_name
            
            # Guardar archivo
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
            
            return {
                "success": True,
                "filename": file_name,
                "original_filename": file.filename,
                "size": len(file_content),
                "message": "Archivo subido correctamente"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")
    
    @staticmethod
    def get_comprobante_path(filename: str):
        """Obtener path del archivo de comprobante"""
        # Validar que el filename no contenga caracteres peligrosos
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Nombre de archivo inválido")
        
        file_path = UploadService.UPLOAD_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        return file_path