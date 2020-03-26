#!/bin/bash
aws elasticbeanstalk create-environment \
    --application-name ultitracker-frontend \
    --environment-name ultitracker-frontend-0-0-10 \
    --tier "Name=WebServer,Type=Standard,Version= " \
    --solution-stack-name "64bit Amazon Linux 2018.03 v4.13.1 running Node.js" \
    --version-label ultitracker-frontend-0-0-7 \
    --option-settings file://./environment-config-https.json
