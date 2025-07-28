import os
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import osmnx as ox

# === CHEMINS ===
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "..", "data", "raw")
IRIS_PATH = os.path.join(DATA_DIR, "iris.gpkg")
SOCIO_CSV_PATH = os.path.join(DATA_DIR, "filosofie.csv")

# === CHARGEMENTS GLOBAUX ===
geolocator = Nominatim(user_agent="foncier_app")
iris_gdf = gpd.read_file(IRIS_PATH).to_crs(epsg=4326)
df_socio = pd.read_csv(SOCIO_CSV_PATH, sep=";", dtype=str)
df_socio = df_socio.apply(lambda col: col.str.replace(",", ".") if col.dtype == "object" else col)

for col in df_socio.columns:
    if col != "IRIS":
        df_socio[col] = pd.to_numeric(df_socio[col], errors="coerce")

# === Géocodage ===
def geocode_address(address: str):
    try:
        location = geolocator.geocode(address, timeout=10)
        if location:
            return {
                "latitude": location.latitude,
                "longitude": location.longitude,
                "display_name": location.address
            }
        return None
    except GeocoderTimedOut:
        return None

# === CODE_IRIS ===
def get_code_iris_from_coords(lat: float, lon: float) -> str:
    point = Point(lon, lat)
    match = iris_gdf[iris_gdf.contains(point)]
    if not match.empty:
        return match.iloc[0].get("CODE_IRIS", "UNKNOWN")
    return "UNKNOWN"

# === Socio-éco ===
def get_socio_data(code_iris: str) -> dict:
    row = df_socio[df_socio["IRIS"] == code_iris]
    if not row.empty:
        row = row.iloc[0]
        return {
            "DEC_Q121": float(row.get("DEC_Q121", 0)),
            "REV_MED21": float(row.get("DEC_MED21", 0)),
            "DEC_Q321": float(row.get("DEC_Q321", 0)),
        }
    return {"DEC_Q121": 0, "REV_MED21": 0, "DEC_Q321": 0}

# === OSM Tags ===
TAGS = {
    "education": {"amenity": ["school", "kindergarten", "college", "university"]},
    "sante": {"amenity": ["hospital", "clinic", "doctors", "pharmacy"]},
    "commerces": {"shop": True},
    "services": {"amenity": ["bank", "post_office", "townhall", "police"]},
    "transports": {"amenity": ["bus_station", "taxi", "ferry_terminal", "subway_entrance", "train_station"]},
    "loisirs": {"leisure": True},
}
RAYONS = [10_000, 15_000, 20_000]

def count_pois(lat: float, lon: float, radius: int, tags: dict) -> int:
    point = (lat, lon)
    try:
        pois = ox.geometries_from_point(point, tags=tags, dist=radius)
        return len(pois)
    except Exception as e:
        print(f"[OSM ERROR] {e}")
        return 0

def enrich_osm_features(lat: float, lon: float) -> dict:
    enriched = {}
    for rayon in RAYONS:
        for key, tags in TAGS.items():
            count = count_pois(lat, lon, rayon, tags)
            enriched[f"nb_{key}_{rayon}m"] = count
    return enriched

# === Enrichissement complet ===
def enrich_input_from_address(address: str) -> dict:
    geo = geocode_address(address)
    if not geo:
        raise ValueError("Adresse introuvable")

    lat, lon = geo["latitude"], geo["longitude"]
    code_iris = get_code_iris_from_coords(lat, lon)
    socio = get_socio_data(code_iris) if code_iris != "UNKNOWN" else {"REV_MED21": 0, "DEC_Q121": 0, "DEC_Q321": 0}
    osm = enrich_osm_features(lat, lon)

    return {
        "latitude": lat,
        "longitude": lon,
        "CODE_IRIS": code_iris,
        **socio,
        **osm
    }
