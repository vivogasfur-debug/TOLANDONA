#!/bin/bash

# Setup Script for Auto-Push to GitHub
# Run this script once to enable automatic pushing

PROJECT_DIR="/home/z/my-project"

echo "Setting up auto-push to GitHub..."

# Method 1: Create post-commit hook (pushes after every commit)
cat > "$PROJECT_DIR/.git/hooks/post-commit" << 'EOF'
#!/bin/bash
# Auto-push after commit
git push origin main 2>/dev/null &
EOF

chmod +x "$PROJECT_DIR/.git/hooks/post-commit"
echo "✓ Post-commit hook created (auto-push after every commit)"

# Method 2: Setup cron job (pushes every 5 minutes)
# Uncomment the line below to enable cron job
# (crontab -l 2>/dev/null; echo "*/5 * * * * /home/z/my-project/scripts/auto-push.sh >> /home/z/my-project/auto-push.log 2>&1") | crontab -

echo ""
echo "=== Auto-Push Setup Complete ==="
echo ""
echo "Method 1 (Post-commit hook): ACTIVE"
echo "  → Changes will be pushed automatically after each commit"
echo ""
echo "Method 2 (Cron job): NOT ACTIVE"
echo "  → To enable periodic auto-push, run:"
echo "     (crontab -l 2>/dev/null; echo '*/5 * * * * /home/z/my-project/scripts/auto-push.sh >> /home/z/my-project/auto-push.log 2>&1') | crontab -"
echo ""
echo "IMPORTANT: You need to set up GitHub authentication first!"
echo "Run: git config --global credential.helper store"
echo "Then push once manually to save your credentials."
