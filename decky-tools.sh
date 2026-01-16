#!/bin/bash

# --- CONFIGURATION ---
DEFAULT_DISTROBOX="Dev-box"
DECKY_PATH="/home/deck/homebrew/plugins"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get current folder name and convert to lowercase for the plugin name
FOLDER_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]')

show_help() {
    echo "Usage: ./decky-tools.sh [init|deploy]"
    echo "  init   : Setup environment, project files, and install decky-frontend-lib"
    echo "  deploy : Clean, build in distrobox, and restart Decky"
}

# Function to initialize open-source boilerplate files
init_project_files() {
    echo -e "${BLUE}>>> Initializing open-source boilerplate files...${NC}"

    # .gitignore
    if [ ! -f ".gitignore" ]; then
        cat <<EOF > .gitignore
node_modules/
dist/
out/
*.log
.DS_Store
__pycache__/
*.pyc
EOF
        echo -e "${GREEN}Created .gitignore${NC}"
    fi

    # README.md
    if [ ! -f "README.md" ]; then
        cat <<EOF > README.md
# $FOLDER_NAME

A Decky Loader plugin developed for SteamOS and Bazzite.

## Development

1. Use \`./decky-tools.sh deploy\` to build and test locally.
2. Ensure you have a Distrobox named \`$DEFAULT_DISTROBOX\` with node/pnpm installed.

## License
MIT
EOF
        echo -e "${GREEN}Created README.md${NC}"
    fi

    # LICENSE (MIT)
    if [ ! -f "LICENSE" ]; then
        cat <<EOF > LICENSE
MIT License
Copyright (c) $(date +%Y)
(See full MIT license text: https://opensource.org/licenses/MIT)
EOF
        echo -e "${GREEN}Created LICENSE stub${NC}"
    fi
}

init_env() {
    echo -e "${BLUE}>>> Setting up Decky environment...${NC}"
    
    # 1. Ensure Decky plugin directory exists
    if [ ! -d "$DECKY_PATH" ]; then
        echo -e "${YELLOW}Creating $DECKY_PATH...${NC}"
        sudo mkdir -p "$DECKY_PATH"
    fi

    # 2. Fix host permissions for the current user
    sudo chmod 755 /home/$USER
    
    # 3. Initialize OS files (README, etc.)
    init_project_files

    # 4. Install decky-frontend-lib inside Distrobox
    echo -e "${BLUE}>>> Installing decky-frontend-lib inside $DEFAULT_DISTROBOX...${NC}"
    # Ensure the project directory is writable by the current user to avoid EACCES on temp files
    sudo chown -R $USER:$USER "$(pwd)"
    # Set TMPDIR to /tmp inside the container so pnpm can create temp files without hitting permission issues
    distrobox enter $DEFAULT_DISTROBOX -- bash -c "export TMPDIR=/tmp && pnpm install && pnpm install decky-frontend-lib"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Library decky-frontend-lib installed successfully!${NC}"
    else
        echo -e "${RED}Failed to install the library. Check your Distrobox setup.${NC}"
        exit 1
    fi

    echo -e "${GREEN}Environment and files are ready!${NC}"
}

deploy_plugin() {
    echo -e "${BLUE}>>> Building and Deploying: $FOLDER_NAME${NC}"

    # 1. Build
    distrobox enter $DEFAULT_DISTROBOX -- bash -c "pnpm run build"

    # 2. Nettoyage complet
    sudo rm -rf "$DECKY_PATH/$FOLDER_NAME"
    sudo mkdir -p "$DECKY_PATH/$FOLDER_NAME"

    # 3. Copie structurée (On recrée le dossier dist dans la destination)
    sudo mkdir -p "$DECKY_PATH/$FOLDER_NAME/dist"
    sudo cp -r dist/* "$DECKY_PATH/$FOLDER_NAME/dist/"
    sudo cp main.py "$DECKY_PATH/$FOLDER_NAME/"
    sudo cp plugin.json "$DECKY_PATH/$FOLDER_NAME/"

    # 4. Permissions
    sudo chown -R root:root "$DECKY_PATH/$FOLDER_NAME"
    sudo chmod -R 755 "$DECKY_PATH/$FOLDER_NAME"

    # 5. Restart
    sudo systemctl restart plugin_loader
    
    echo -e "${GREEN}>>> Plugin deployed with correct structure!${NC}"
}

# Main routing logic
case "$1" in
    init)
        init_env
        ;;
    deploy)
        deploy_plugin
        ;;
    *)
        show_help
        ;;
esac