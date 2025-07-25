export interface Mutation {
  id_mutation: string;
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: number;
  nom_commune: string;
  code_departement: string;
  type_local: string;
  surface_reelle_bati: number;
  nombre_pieces_principales: number;
  surface_terrain: number;
  longitude: number;
  latitude: number;
  prix_m2: number;
  annee: number;
  mois: number;
  jour: number;
  index_right: number;
  CODE_IRIS: string;
  CODE_COMMUNE: string;
  REV_MED21: number;
  DEC_Q121: number;
  DEC_Q321: number;
  region: string;
  nb_education_10000m: number;
  nb_sante_10000m: number;
  nb_commerces_10000m: number;
  nb_services_10000m: number;
  nb_transports_10000m: number;
  nb_loisirs_10000m: number;
  nb_education_15000m: number;
  nb_sante_15000m: number;
  nb_commerces_15000m: number;
  nb_services_15000m: number;
  nb_transports_15000m: number;
  nb_loisirs_15000m: number;
  nb_education_20000m: number;
  nb_sante_20000m: number;
  nb_commerces_20000m: number;
  nb_services_20000m: number;
  nb_transports_20000m: number;
  nb_loisirs_20000m: number;
}

export interface PaginatedResponse<T> {
  page: number;
  page_size: number;
  total: number;
  results: T[];
}
