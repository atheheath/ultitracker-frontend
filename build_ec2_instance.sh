#!/bin/bash

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt-get install -y nodejs

npm run build
sudo npm install -g http-serve

REACT_APP_SERVER_API_HOST=https://api.ultitracker.com npm run build
