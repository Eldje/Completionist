import asyncio
import os
import json
import logging
import subprocess
import pdb

# Setup logging for the plugin
logging.basicConfig(filename="/tmp/completionist.log", format='%(asctime)s %(levelname)s %(message)s', level=logging.DEBUG)


# Chemin standard pour les réglages de plugins sur SteamOS/Bazzite
SETTINGS_PATH = "/home/deck/homebrew/settings/TabMaster/settings.json"

class Plugin:
    async def toggle_and_reload(self, appid):
        try:
            logging.info(f"[completionist] LOG 10: Début traitement AppID {appid}")
            pdb.set_trace()
            if not os.path.exists(SETTINGS_PATH):
                logging.error(f"[completionist] LOG ERROR: Fichier introuvable à {SETTINGS_PATH}")
                return {"success": False, "error": "Settings not found"}

            with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)

            user_ids = list(data.get("usersDict", {}).keys())
            if not user_ids:
                return {"success": False, "error": "No user found"}
            
            user_id = user_ids[0]
            tabs = data["usersDict"][user_id].get("tabs", {})

            # ID unique pour notre onglet (on garde un ID fixe pour pouvoir le retrouver)
            tab_id = "completionist_tab_fixed_id"
            status = "unknown"

            # 1. Création ou récupération de l'onglet
            if tab_id not in tabs:
                logging.info(f"[completionist] LOG 11: Création de l'onglet {tab_id}")
                tabs[tab_id] = {
                    "id": tab_id,
                    "title": "Complétés ✅",
                    "position": len(tabs),
                    "filtersMode": "and",
                    "categoriesToInclude": 1,
                    "autoHide": False,
                    "visibleToOthers": False,
                    "sortByOverride": -1,
                    "filters": [
                        {
                            "type": "whitelist",
                            "inverted": False,
                            "params": {
                                "games": []
                            }
                        }
                    ]
                }

            # 2. Accès à la liste des jeux dans le filtre whitelist
            # On cherche le filtre de type 'whitelist'
            target_filter = next((f for f in tabs[tab_id]["filters"] if f["type"] == "whitelist"), None)
            
            if target_filter:
                games_list = target_filter["params"]["games"]
                appid_int = int(appid)

                if appid_int in games_list:
                    games_list.remove(appid_int)
                    status = "removed"
                else:
                    games_list.append(appid_int)
                    status = "added"
                
                logging.info(f"[completionist] LOG 12: Jeu {appid_int} mis à jour -> {status}")
            else:
                return {"success": False, "error": "Whitelist filter structure missing"}

            # 3. Sauvegarde physique
            with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4)
                f.flush()
                os.fsync(f.fileno())
            
            logging.info(f"[completionist] LOG 13: Sauvegarde OK. Redémarrage Decky...")

            # 4. Relance automatique de Decky
            subprocess.Popen(["systemctl", "restart", "plugin_loader"])
            
            return {"success": True, "status": status}

        except Exception as e:
            logging.error(f"[completionist] LOG ERROR: {str(e)}")
            return {"success": False, "error": str(e)}
        

    def __init__(self):
        # We store data in the plugin's home directory
        self.settings_path = os.path.join(os.environ.get("DECKY_PLUGIN_SETTINGS_DIR", "/tmp"), "status.json")
        self.statuses = self._load_statuses()

    def _load_statuses(self):
        try:
            if os.path.exists(self.settings_path):
                with open(self.settings_path, "r") as f:
                    return json.load(f)
        except Exception as e:
            logging.error(f"Error loading statuses: {e}")
        return {}

    # This is the method your TypeScript is looking for!
    async def get_all_statuses(self):
        logging.info("Frontend requested all statuses")
        return self.statuses

    # This method saves a status for a specific appid
    async def save_status(self, appid, status):
        try:
            logging.info(f"Saving status for {appid}: {status}")
            self.statuses[str(appid)] = status
            with open(self.settings_path, "w") as f:
                json.dump(self.statuses, f)
            return True
        except Exception as e:
            logging.error(f"Error saving status: {e}")
            return False

    # Required for Decky Loader
    async def _main(self):
        logging.info("Completionist plugin started")
        pass

    # --- BLOC DE TEST AUTONOME ---
if __name__ == "__main__":
    # Simuler l'appel que Decky ferait
    test_appid = 400 # Portal par exemple
    plugin = Plugin()
    
    print("--- Lancement du test autonome ---")
    asyncio.run(plugin.toggle_and_reload(test_appid))
    print("--- Fin du test ---")