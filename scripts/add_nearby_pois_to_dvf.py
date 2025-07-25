import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import osmnx as ox
import time

from utils.logger import Logger, LogMode

INPUT_FILE = './data/dvf_clean.csv'
OUTPUT_FILE = './data/dvf_enriched_multi_poi.csv'
SAMPLE_SIZE = 10
RADIUS = [1_000, 2_000, 3_000]  
POI_TYPES = ['school', 'pharmacy', 'hospital']

logger = Logger(name="pois", mode=LogMode.PRINT)  

def count_pois_nearby(lat, lon, poi, radius):
    try:
        gdf = ox.features_from_point((lat, lon), tags={'amenity': poi}, dist=radius)
        return len(gdf)
    except Exception as e:
        if "No matching features" not in str(e):
            logger.log(f"❌ Erreur pour POI='{poi}' à lat={lat}, lon={lon} → {e}")
        return 0

def add_nearby_pois_to_dvf():
    logger.log("📥 Chargement du fichier DVF...")
    df = pd.read_csv(INPUT_FILE).head(SAMPLE_SIZE)

    logger.log(f"🔍 Début de l'enrichissement sur {SAMPLE_SIZE} biens...\n")

    if os.path.exists(OUTPUT_FILE):
        os.remove(OUTPUT_FILE)

    first_row = True
    for i, row in df.iterrows():
        lat, lon = row['latitude'], row['longitude']
        logger.log(f"🏠 Bien #{i+1} (lat: {lat}, lon: {lon})")

        for poi in POI_TYPES:
            for r in RADIUS:
                count = count_pois_nearby(lat, lon, poi, r)
                row[f'nb_{poi}s_{r}m'] = count
                logger.log(f"   • {count} {poi}(s) trouvés dans un rayon de {r}m")
                time.sleep(1.1)
            
                
            logger.log('-' * 40)

        pd.DataFrame([row]).to_csv(OUTPUT_FILE, mode='a', index=False, header=first_row)
        first_row = False
        
        
    logger.log(f"\n✅ Données enrichies enregistrées dans : {OUTPUT_FILE}")

if __name__ == "__main__":
    add_nearby_pois_to_dvf()