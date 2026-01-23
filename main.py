import os
import json
import logging

# Setup logging for the plugin
logging.basicConfig(filename="/tmp/completionist.log", format='%(asctime)s %(levelname)s %(message)s', level=logging.DEBUG)

class Plugin:
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