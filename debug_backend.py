import asyncio
import json
import logging
from main import Plugin  # Import your actual plugin code

# Configure logging to see what's happening in the terminal
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

async def test_plugin():
    print("--- Starting Completionist Backend Test ---")
    
    # 1. Instantiate the plugin
    plugin = Plugin()
    
    # 2. Call the method directly
    # In Decky, this is what happens when you call serverApi.callPluginMethod
    print(f"Calling get_local_games()...\n")
    result = await plugin.get_local_games()
    
    # 3. Format and display the output
    if result.get("success"):
        games = result.get("games", [])
        print(f"✅ SUCCESS: Found {len(games)} games.\n")
        
        # Display the first 5 games as a sample
        print("Sample of found games:")
        for game in games[:5]:
            print(f" - [{game['appid']}] {game['name']} (Status: {game['status']})")
            
        if len(games) > 5:
            print(f" ... and {len(games) - 5} more.")
    else:
        print(f"❌ ERROR: {result.get('error')}")

    # 4. Print the raw JSON to verify structure for React
    print("\n--- Raw JSON for React ---")
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    # Run the async function
    asyncio.run(test_plugin())