import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import logging

import pandas as pd
import geopandas as gpd
from pyrosm import OSM

from utils.debt_region_map import DEPT_TO_REGION

BASE_PBF_DIR   = r"D:\Pbf"
INPUT_FILE     = "./data/processed/final.csv"
OUTPUT_FILE    = "./data/processed/enriched_csv.csv"
CHUNK_SIZE     = 10_000

# Mapping des familles d'amenities
AMENITY_FAMILIES = {
    "education": {"school", "kindergarten", "childcare"},
    "sante": {"pharmacy", "hospital", "clinic", "doctors", "dentist"},
    "commerces": {"supermarket", "bakery", "convenience"},
    "services": {"post_office", "bank", "atm"},
    "transports": {"bus_station", "train_station", "tram_stop", "subway_entrance"},
    "loisirs": {"park", "playground"}
}
# Plat pour OSM filter
AMENITIES = set.union(*AMENITY_FAMILIES.values())

RADIUS_METERS   = [10_000, 15_000, 20_000]

CRS_SRC        = "EPSG:4326"
CRS_DST_EPSG   = 2154  # code EPSG pour la reprojection

# Cache des GeoDataFrames POIs par région
region_pois_cache: dict[str, gpd.GeoDataFrame] = {}

# Logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

def get_region_from_dept(dept_code: str) -> str | None:
    return DEPT_TO_REGION.get(dept_code.zfill(2))

def load_pois_for_region(region: str, bbox_df: pd.DataFrame) -> gpd.GeoDataFrame:
    if region in region_pois_cache:
        return region_pois_cache[region]
    pbf_path = os.path.join(BASE_PBF_DIR, f"{region.lower()}-latest.osm.pbf")
    if not os.path.exists(pbf_path):
        raise FileNotFoundError(f"Fichier PBF introuvable : {pbf_path}")
    logger.info(f"Chargement POIs {region} depuis {os.path.basename(pbf_path)}")
    min_lon, max_lon = bbox_df.longitude.min(), bbox_df.longitude.max()
    min_lat, max_lat = bbox_df.latitude.min(), bbox_df.latitude.max()
    bbox = [min_lon, min_lat, max_lon, max_lat]
    osm = OSM(pbf_path, bounding_box=bbox)
    pois = osm.get_pois(custom_filter={"amenity": list(AMENITIES)})
    if pois.empty:
        logger.warning(f"Aucun POI trouvé pour la région {region}")
        pois_gdf = gpd.GeoDataFrame(columns=["amenity", "geometry"], crs=CRS_SRC)
    else:
        pois_gdf = pois.to_crs(epsg=CRS_DST_EPSG)
    region_pois_cache[region] = pois_gdf
    return pois_gdf

def enrich_dataframe_with_pois(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["latitude", "longitude", "code_departement"])
    df["region"] = df["code_departement"].astype(str).apply(get_region_from_dept)
    df = df.dropna(subset=["region"]).sort_values("code_departement")
    enriched_chunks = []
    for region, region_df in df.groupby("region"):
        logger.info(f"Traitement région {region} ({len(region_df)} biens)")
        try:
            pois_gdf = load_pois_for_region(region, region_df)
        except Exception as e:
            logger.error(f"Erreur chargement POIs pour {region} : {e}")
            continue
        gdf_pts = gpd.GeoDataFrame(
            region_df,
            geometry=gpd.points_from_xy(
                region_df.longitude, region_df.latitude
            ),
            crs=CRS_SRC
        ).to_crs(epsg=CRS_DST_EPSG)
        # Collecte des features par amenity & radius
        amenity_cols = []
        for radius in RADIUS_METERS:
            buffers = gdf_pts.copy()
            buffers.geometry = buffers.geometry.buffer(radius)
            joined = (
                gpd.sjoin(
                    buffers[['geometry']],
                    pois_gdf[['amenity', 'geometry']],
                    how='left',
                    predicate='intersects'
                )
                .reset_index()
                .rename(columns={'index': 'pt_idx'})
            )
            counts = (
                joined
                .groupby(['pt_idx', 'amenity'])
                .size()
                .unstack(fill_value=0)
                .reindex(
                    index=gdf_pts.index,
                    columns=AMENITIES,
                    fill_value=0
                )
            )
            # Ajout des features individuelles
            for amen in AMENITIES:
                col = f"nb_{amen}s_{radius}m"
                gdf_pts[col] = counts[amen].values
                amenity_cols.append(col)
        # Agrégation par famille (ex : nb_education_10000m, ...)
        for radius in RADIUS_METERS:
            for fam, fam_amenities in AMENITY_FAMILIES.items():
                fam_col = f"nb_{fam}_{radius}m"
                gdf_pts[fam_col] = sum(
                    gdf_pts.get(f"nb_{amen}s_{radius}m", 0) for amen in fam_amenities
                )
        # On ne garde que les colonnes originales + agrégées (pour simplifier)
        keep_cols = [col for col in gdf_pts.columns if not col.startswith("nb_") or any(
            col.startswith(f"nb_{fam}_") for fam in AMENITY_FAMILIES
        )]
        enriched_chunks.append(gdf_pts[keep_cols].drop(columns='geometry'))
    if enriched_chunks:
        return pd.concat(enriched_chunks, ignore_index=True)
    else:
        cols = df.columns.tolist() + [
            f"nb_{fam}_{r}m"
            for r in RADIUS_METERS
            for fam in AMENITY_FAMILIES
        ]
        return pd.DataFrame(columns=cols)

if __name__ == "__main__":
    if os.path.exists(OUTPUT_FILE):
        os.remove(OUTPUT_FILE)
        print(f"🗑️ Ancien fichier supprimé : {OUTPUT_FILE}")

    first_write = True
    total_count = 0

    for chunk in pd.read_csv(
        INPUT_FILE,
        chunksize=CHUNK_SIZE,
        dtype={"code_departement": str}
    ):
        enriched = enrich_dataframe_with_pois(chunk)
        if enriched.empty:
            continue
        enriched.to_csv(
            OUTPUT_FILE,
            mode='w' if first_write else 'a',
            header=first_write,
            index=False
        )
        total_count += len(enriched)
        logger.info(f"Chunk traité : {len(enriched)} lignes (Total : {total_count})")
        first_write = False

    logger.info(f"✅ Enrichissement terminé — fichier généré : {OUTPUT_FILE}")