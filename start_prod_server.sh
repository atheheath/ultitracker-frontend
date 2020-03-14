#!/bin/bash
SSL_FOLDER=./letsencrypt

# sudo serve -s build -l 443
http-serve build -p 443 -S -C ${SSL_FOLDER}/live/ultitracker.com/fullchain.pem -K ${SSL_FOLDER}/live/ultitracker.com/privkey.pem
