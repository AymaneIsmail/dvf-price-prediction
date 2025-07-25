import os
import sqlite3
import pandas as pd

# === Paramètres ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR,"..", "data")
CSV_PATH = os.path.join(DATA_DIR, "processed", "enriched_data.csv")
DB_PATH = os.path.join(DATA_DIR, "enriched_data.sqlite")
TABLE_NAME = "mutations"
CHUNK_SIZE = 10_000

# Assure que le dossier 'data/' existe
os.makedirs(DATA_DIR, exist_ok=True)

# Création manuelle de la table
def create_table(cursor):
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        id_mutation TEXT,
        date_mutation TEXT,
        nature_mutation TEXT,
        valeur_fonciere REAL,
        nom_commune TEXT,
        code_departement TEXT,
        type_local TEXT,
        surface_reelle_bati REAL,
        nombre_pieces_principales INTEGER,
        surface_terrain REAL,
        longitude REAL,
        latitude REAL,
        prix_m2 REAL,
        annee INTEGER,
        mois INTEGER,
        jour INTEGER,
        index_right INTEGER,
        CODE_IRIS TEXT,
        CODE_COMMUNE TEXT,
        REV_MED21 REAL,
        DEC_Q121 REAL,
        DEC_Q321 REAL,
        region TEXT,
        nb_education_10000m INTEGER,
        nb_sante_10000m INTEGER,
        nb_commerces_10000m INTEGER,
        nb_services_10000m INTEGER,
        nb_transports_10000m INTEGER,
        nb_loisirs_10000m INTEGER,
        nb_education_15000m INTEGER,
        nb_sante_15000m INTEGER,
        nb_commerces_15000m INTEGER,
        nb_services_15000m INTEGER,
        nb_transports_15000m INTEGER,
        nb_loisirs_15000m INTEGER,
        nb_education_20000m INTEGER,
        nb_sante_20000m INTEGER,
        nb_commerces_20000m INTEGER,
        nb_services_20000m INTEGER,
        nb_transports_20000m INTEGER,
        nb_loisirs_20000m INTEGER
    );
    """)

# Traitement par batch
# Traitement par batch
def ingest_csv():
    if not os.path.exists(CSV_PATH):
        print(f"❌ Fichier CSV introuvable : {CSV_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("📄 Lecture du CSV et création de la base...")
    create_table(cursor)
    conn.commit()

    total = 0
    for i, chunk in enumerate(pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE)):
        # Supprime les doublons avant insertion
        chunk = chunk.drop_duplicates(subset=["id_mutation", "latitude", "longitude"])

        chunk.to_sql(TABLE_NAME, conn, if_exists='append', index=False)
        total += len(chunk)
        print(f"✅ Chunk {i+1}: {len(chunk)} lignes ajoutées (total: {total})")

    conn.commit()
    conn.close()
    print(f"\n🎉 Ingestion terminée. {total} lignes insérées dans {DB_PATH}")


if __name__ == "__main__":
    ingest_csv()
