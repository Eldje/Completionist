import logging

# Configuration des logs pour voir ce qui se passe dans Decky
logging.basicConfig(filename="/tmp/completionist.log", format='%(asctime)s %(levelname)s %(message)s', filemode='w', level=logging.DEBUG)

class Plugin:
    # Cette méthode doit correspondre au nom appelé dans ton index.tsx
    async def get_status(self):
        logging.info("Appel de get_status reçu !")
        # On retourne un dictionnaire qui sera converti en objet JSON pour le JS
        return {"success": True, "data": "Serveur Python opérationnel !"}

    async def _main(self):
        logging.info("Plugin Completionist démarré")
        pass

    async def _unload(self):
        pass