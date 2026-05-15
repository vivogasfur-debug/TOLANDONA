#!/bin/bash
cd /home/z/my-project
while true; do
    bun run dev
    echo "Server died, restarting in 2 seconds..."
    sleep 2
done
