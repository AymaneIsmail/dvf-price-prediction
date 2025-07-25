import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_PATH = os.getenv("SQLITE_PATH", os.path.join(BASE_DIR, "..", "data", "enriched_data.sqlite"))
TABLE_NAME = "mutations"

print(SQLITE_PATH)

# === Pydantic Model ===
class Mutation(BaseModel):
    id_mutation: str
    date_mutation: str
    nature_mutation: Optional[str]
    valeur_fonciere: Optional[float]
    nom_commune: Optional[str]
    code_departement: Optional[str]
    type_local: Optional[str]
    surface_reelle_bati: Optional[float]
    nombre_pieces_principales: Optional[int]
    surface_terrain: Optional[float]
    longitude: Optional[float]
    latitude: Optional[float]
    prix_m2: Optional[float]
    annee: Optional[int]
    mois: Optional[int]
    jour: Optional[int]
    index_right: Optional[int]
    CODE_IRIS: Optional[str]
    CODE_COMMUNE: Optional[str]
    REV_MED21: Optional[float]
    DEC_Q121: Optional[float]
    DEC_Q321: Optional[float]
    region: Optional[str]
    nb_education_10000m: Optional[int]
    nb_sante_10000m: Optional[int]
    nb_commerces_10000m: Optional[int]
    nb_services_10000m: Optional[int]
    nb_transports_10000m: Optional[int]
    nb_loisirs_10000m: Optional[int]
    nb_education_15000m: Optional[int]
    nb_sante_15000m: Optional[int]
    nb_commerces_15000m: Optional[int]
    nb_services_15000m: Optional[int]
    nb_transports_15000m: Optional[int]
    nb_loisirs_15000m: Optional[int]
    nb_education_20000m: Optional[int]
    nb_sante_20000m: Optional[int]
    nb_commerces_20000m: Optional[int]
    nb_services_20000m: Optional[int]
    nb_transports_20000m: Optional[int]
    nb_loisirs_20000m: Optional[int]


# FastAPI instance 
app = FastAPI(
    title="API Foncières",
    description="API pour exposer des données foncières en SQLite",
    version="1.0.0",
)

# CORS config 
origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# Utils 
def get_connection():
    try:
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur SQLite: {e}")


# Endpoints 

@app.get("/debug/tables")
def debug_tables():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        return [row["name"] for row in tables]
    finally:
        conn.close()

@app.get("/api/v1/mutations", tags=["Mutations"])
async def get_paginated_mutations(page: int = 1, page_size: int = 50):
    """
    Récupère les mutations avec pagination.
    """
    if page < 1 or page_size < 1:
        raise HTTPException(status_code=400, detail="Page et page_size doivent être >= 1")

    offset = (page - 1) * page_size

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Total count
        cursor.execute(f"SELECT COUNT(*) as total FROM {TABLE_NAME}")
        total = cursor.fetchone()["total"]

        # Paginated results
        cursor.execute(f"""
            SELECT * FROM {TABLE_NAME}
            ORDER BY date_mutation DESC
            LIMIT ? OFFSET ?
        """, (page_size, offset))

        rows = cursor.fetchall()
        mutations = [Mutation(**dict(row)) for row in rows]

        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "results": mutations,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne: {e}")
    finally:
        conn.close()



@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """
    Vérifie que la base SQLite est accessible.
    """
    try:
        conn = get_connection()
        conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception:
        return {"status": "error"}
    finally:
        conn.close()
