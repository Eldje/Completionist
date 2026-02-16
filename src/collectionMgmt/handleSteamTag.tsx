export const handleSteamTag = async (appid: number): Promise<void> => {
  const SC = (window as any).SteamClient;
  if (!SC) return;

  const COLLECTION_NAME = "Complété";
  const appIdStr = appid.toString();

  console.log(`[Completionist] Tentative via Service Dispatcher pour l'App ${appIdStr}`);

  try {
    // Méthode 1: Utiliser l'URI via le Browser (Puisque tu as 'Browser' dans ta console)
    // C'est la méthode la plus stable quand 'Apps' est bridé
    if (SC.Browser && SC.Browser.ExecuteSteamURL) {
      SC.Browser.ExecuteSteamURL(`steam://addapptocollection/${appIdStr}/${encodeURIComponent(COLLECTION_NAME)}`);
      console.log("[Completionist] Commande envoyée via Browser.ExecuteSteamURL");
    } 
    // Méthode 2: Si la 1 échoue, on tente le partage de commande console
    else if (SC.Console && SC.Console.ExecuteSteamClientCommand) {
      await SC.Console.ExecuteSteamClientCommand(`app_set_category ${appIdStr} ${COLLECTION_NAME}`);
      console.log("[Completionist] Commande envoyée via Console.ExecuteSteamClientCommand");
    }

    // Petit feedback pour confirmer que le code n'a pas crashé
    if (SC.System?.Notifications?.ShowToast) {
        SC.System.Notifications.ShowToast("Completionist", `Action envoyée pour ${appIdStr}`);
    }

  } catch (e) {
    console.error("[Completionist] Erreur critique lors de l'envoi :", e);
  }
};