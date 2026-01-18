# test_parse.py
import os
import re

def test():
    # Remplace par un vrai chemin vers un fichier .acf sur ton PC
    test_path = os.path.expanduser("~/.local/share/Steam/steamapps/appmanifest_400.acf")
    
    if not os.path.exists(test_path):
        print(f"Fichier non trouvé : {test_path}")
        return

    with open(test_path, 'r') as f:
        content = f.read()
        print("--- Contenu du fichier ---")
        print(content[:200]) # Affiche le début
        
        match = re.search(r'"name"\s+"(.*?)"', content, re.I)
        if match:
            print(f"\nSUCCÈS ! Nom trouvé : {match.group(1)}")
        else:
            print("\nÉCHEC : Regex n'a rien trouvé.")

if __name__ == "__main__":
    test()