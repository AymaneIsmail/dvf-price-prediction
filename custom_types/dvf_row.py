from typing import TypedDict

class DvfRow(TypedDict):
    id_mutation: str
    date_mutation: str
    valeur_fonciere: float
    type_local: str
    surface_reelle_bati: float
    nombre_pieces_principales: float
    surface_terrain: float
    longitude: float
    latitude: float
