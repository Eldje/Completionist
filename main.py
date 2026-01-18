import os
import re
import json
import logging

class Plugin:
    # Absolute paths for the plugin directory
    PLUGIN_DIR = os.path.dirname(os.path.realpath(__file__))
    DATA_PATH = os.path.join(PLUGIN_DIR, "data.json")

    async def get_local_games(self):
        """
        Main scan function. 
        All comments in English for open-source collaboration.
        """
        game_list = []
        # Call as a static method
        saved_data = self._load_saved_data(self.DATA_PATH)
        
        # Hardcoded path for your Bazzite environment
        path = "/home/deck/.local/share/Steam/steamapps"

        try:
            if not os.path.exists(path):
                return {"success": False, "error": f"Path not found: {path}"}

            for filename in os.listdir(path):
                if filename.startswith("appmanifest_") and filename.endswith(".acf"):
                    full_path = os.path.join(path, filename)
                    
                    appid_match = re.search(r'\d+', filename)
                    appid = appid_match.group(0) if appid_match else "0"
                    
                    name = self._parse_acf_name(full_path)
                    
                    if name:
                        status = saved_data.get(appid, "To Do")
                        game_list.append({
                            "appid": int(appid),
                            "name": name,
                            "status": status
                        })

            game_list.sort(key=lambda x: str(x['name']).lower())
            return {"success": True, "games": game_list}

        except Exception as e:
            logging.error(f"completionist error: {str(e)}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def _load_saved_data(data_path):
        """Loads data without needing the 'self' context."""
        if os.path.exists(data_path):
            try:
                with open(data_path, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {}

    @staticmethod
    def _parse_acf_name(filepath):
        """Parses manifest name without needing the 'self' context."""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                match = re.search(r'"name"\s+"(.*?)"', content, re.I)
                return match.group(1) if match else None
        except:
            return None

    async def _main(self):
        pass