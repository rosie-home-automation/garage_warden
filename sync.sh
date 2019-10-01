rsync -arvzc --delete --exclude node_modules/ --exclude logs/  --exclude .git/ --exclude yarn.lock --exclude database.sqlite3 ./ garage_pi.local:/home/pi/garage_warden/
