import os
import requests
import gzip
import shutil

DVF_SOURCE_URL = "https://www.data.gouv.fr/api/1/datasets/r/d7933994-2c66-4131-a4da-cf7cd18040a4"
COMPRESSED_FILE = "./data/dvf.csv.gz"
OUTPUT_FILE = "./data/dvf.csv"
CHUNK_SIZE = 8192

def download_compressed_dvf():
    print("📥 Initialisation du téléchargement du fichier DVF...")

    os.makedirs(os.path.dirname(COMPRESSED_FILE), exist_ok=True)

    try:
        response = requests.get(DVF_SOURCE_URL, stream=True)
        response.raise_for_status()

        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0

        with open(COMPRESSED_FILE, 'wb') as f:
            for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    percent = (downloaded / total_size) * 100 if total_size else 0
                    print(f"⬇️  Téléchargement en cours... {percent:.1f}%", end='\r')

        print("\n✅ Téléchargement terminé avec succès : fichier compressé enregistré.")
        return { "success": True, "message": "Téléchargement réussi." }

    except requests.exceptions.RequestException as e:
        error_message = f"❌ Échec du téléchargement : {e}"
        print(error_message)
        return { "success": False, "message": error_message }

def unzip_compressed_dvf():
    print("🧩 Décompression du fichier compressé DVF (.csv.gz)...")

    if not os.path.exists(COMPRESSED_FILE):
        message = "❌ Fichier compressé introuvable. Télécharge-le d'abord avec `download_compressed_dvf()`."
        print(message)
        return { "success": False, "message": message }

    try:
        with gzip.open(COMPRESSED_FILE, 'rb') as f_in:
            with open(OUTPUT_FILE, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        print("✅ Décompression réussie ! Fichier CSV prêt à l'utilisation.")

        os.remove(COMPRESSED_FILE)
        print("🗑️ Fichier compressé supprimé après décompression.")

        return { "success": True, "message": "Décompression réussie et fichier compressé supprimé." }

    except OSError as e:
        error_message = f"❌ Erreur lors de la décompression : {e}"
        print(error_message)
        return { "success": False, "message": error_message }


if __name__ == "__main__":
    result = download_compressed_dvf()
    if result["success"]:
        unzip_result = unzip_compressed_dvf()
