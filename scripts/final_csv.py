import pandas as pd
import geopandas as gpd

print("\n🚀  DÉMARRAGE DU PIPELINE DVF x FILOSOFI 🚀\n")

print("🔧  Chargement des paramètres...")

DVF_FILE = './data/raw/dvf.csv'
CHUNK_SIZE = 200_000
USECOLS = [
    'id_mutation',
    'date_mutation',
    'nature_mutation',
    'type_local',
    'valeur_fonciere',
    'surface_reelle_bati',
    'longitude',
    'latitude',
    'code_departement',
    'nom_commune',
    'surface_terrain',
    'nombre_pieces_principales'
]
DTYPES = {
    'id_mutation'         : 'string',
    'nature_mutation'     : 'category',
    'type_local'          : 'category',
    'valeur_fonciere'     : 'float64',
    'surface_reelle_bati' : 'float64',
    'longitude'           : 'float64',
    'latitude'            : 'float64',
    'code_departement'    : 'string',
    'nom_commune'         : 'string',
    'surface_terrain'     : 'float64',
    'nombre_pieces_principales': 'float64',
}

vente_types       = ['Vente']
residentiel_types = ['Maison', 'Appartement']

print("\n📦  Lecture & nettoyage du fichier DVF (par chunks)...")
filtered_chunks = []
with pd.read_csv(
    DVF_FILE,
    usecols=USECOLS,
    dtype=DTYPES,
    parse_dates=['date_mutation'],
    chunksize=CHUNK_SIZE,
    low_memory=False
) as reader:
    for i, chunk in enumerate(reader):
        chunk.columns = chunk.columns.str.strip()
        chunk = chunk.dropna(how='any')
        chunk = chunk.drop_duplicates()
        chunk = chunk[chunk['nature_mutation'].isin(vente_types)]
        chunk = chunk[chunk['type_local'].isin(residentiel_types)]
        if not chunk.empty:
            filtered_chunks.append(chunk)
        print(f"   ✅ Chunk {i+1} traité ({len(chunk):,} lignes)")

if filtered_chunks:
    df = pd.concat(filtered_chunks, ignore_index=True).drop_duplicates()
    print(f"\n📈  {len(df):,} lignes DVF conservées après concaténation & déduplication.")
else:
    df = pd.DataFrame(columns=USECOLS)
    print("\n⚠️  Aucune donnée DVF retenue après filtres !")

print("\n🧹  Filtrage des valeurs extrêmes (5e-95e percentile)...")
for col in ['valeur_fonciere', 'surface_reelle_bati', 'surface_terrain']:
    q_low = df[col].quantile(0.05)
    q_high = df[col].quantile(0.95)
    df = df[(df[col] >= q_low) & (df[col] <= q_high)]
print(f"   🔢 {len(df):,} lignes restantes après filtrage des extrêmes.")

print("\n🗺️  Filtrage géographique (France métropolitaine)...")
df = df[
    (df['longitude'] >= -5) & (df['longitude'] <= 10) &
    (df['latitude'] >= 41) & (df['latitude'] <= 52)
]
print(f"   🌍 {len(df):,} lignes après filtre géographique.")

print("\n🧮  Calcul des colonnes dérivées (prix/m², date)...")
df['prix_m2'] = df['valeur_fonciere'] / df['surface_reelle_bati']
df['prix_m2'] = df['prix_m2'].round(2)
df['annee'] = df['date_mutation'].dt.year
df['mois']  = df['date_mutation'].dt.month
df['jour']  = df['date_mutation'].dt.day
print("   ➕ Colonnes ajoutées avec succès !")

print("\n📚  Lecture & nettoyage des données Filosofi ...")
FILOSOFI_CSV = './data/raw/filosofie.csv'
filosofi = pd.read_csv(
    FILOSOFI_CSV,
    sep=';',
    na_values=['na', 'sne', 's']
)
filosofi['IRIS'] = filosofi['IRIS'].astype(str).str.zfill(9)
filosofi = filosofi.rename(columns={
    'IRIS': 'CODE_IRIS',
    'DEC_PIMP21': 'POP21',
    'DEC_MED21': 'REV_MED21',
    'DEC_TP6021': 'TX_PAUVRETE21',
    'DEC_GI21': 'GINI21',
    'DEC_RD21': 'RAPPORT_D9D1_21',
})
for col in ['POP21', 'REV_MED21', 'TX_PAUVRETE21', 'GINI21', 'RAPPORT_D9D1_21']:
    if col in filosofi.columns:
        filosofi[col] = pd.to_numeric(filosofi[col], errors='coerce')
filosofi['CODE_COMMUNE'] = filosofi['CODE_IRIS'].str[:5]
filosofi_clean = filosofi.dropna(subset=['REV_MED21'])
colonnes_utiles = ['CODE_IRIS', 'CODE_COMMUNE', 'REV_MED21', 'DEC_Q121', 'DEC_Q321']
filosofi_clean = filosofi_clean[colonnes_utiles].copy()
print(f"   🏘️ {len(filosofi_clean):,} IRIS Filosofi retenus après nettoyage.")

print("\n🗂️  Lecture du fond de carte IRIS (GeoPackage)...")
iris = gpd.read_file('./data/raw/iris.gpkg')
print(f"   🗺️ {len(iris):,} polygones IRIS chargés.")

print("\n🔗  Jointure spatiale : affectation DVF -> IRIS ...")
gdf_dvf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df['longitude'], df['latitude']),
    crs='EPSG:4326'
)
gdf_dvf = gdf_dvf.to_crs("EPSG:2154")
dvf_iris = gpd.sjoin(
    gdf_dvf,
    iris[['code_iris', 'geometry']],
    how='left',
    predicate='within'
)
dvf_iris = dvf_iris.rename(columns={'code_iris': 'CODE_IRIS'})
dvf_iris = dvf_iris[~dvf_iris['CODE_IRIS'].isnull()]
print(f"   🔎 {len(dvf_iris):,} mutations associées à un IRIS.")

print("\n🎯  Filtrage sur les IRIS présents dans Filosofi ...")
dvf_iris_filtre = dvf_iris[dvf_iris['CODE_IRIS'].isin(filosofi_clean['CODE_IRIS'])]
print(f"   🧬 {len(dvf_iris_filtre):,} mutations conservées après filtre Filosofi.")

print("\n🤝  Jointure finale avec les données Filosofi ...")
final = dvf_iris_filtre.merge(filosofi_clean, on='CODE_IRIS', how='left')
print(f"   📊 Shape finale : {final.shape[0]:,} lignes, {final.shape[1]:,} colonnes.")

print("\n💾  Sauvegarde du fichier final dans ./data/processed/final.csv ...")
final.to_csv('./data/processed/final.csv', index=False)
print("\n✅ Le fichier final est prêt 🎉\n")