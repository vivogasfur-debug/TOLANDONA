#!/bin/bash

# Auto Push to GitHub Script
# This script automatically commits and pushes changes to GitHub

PROJECT_DIR="/home/z/my-project"
REPO_URL="https://github.com/vivogasfur-debug/TOLANDONA.git"
BRANCH="main"

cd "$PROJECT_DIR"

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "$(date): Changes detected, committing and pushing..."
    
    # Add all changes
    git add -A
    
    # Create commit with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "Auto-push: $TIMESTAMP"
    
    # Push to GitHub
    git push origin $BRANCH
    
    if [ $? -eq 0 ]; then
        echo "$(date): Successfully pushed to GitHub"
    else
        echo "$(date): Failed to push to GitHub"
    fi
else
    echo "$(date): No changes to commit"
fi
