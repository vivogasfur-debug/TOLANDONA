#!/bin/bash
cd /home/z/my-project
while true; do
    echo "Starting server at $(date)" >> /tmp/server-restart.log
    node .next/standalone/server.js
    echo "Server stopped at $(date), restarting in 2 seconds..." >> /tmp/server-restart.log
    sleep 2
done
