#!/bin/bash
UUIDTEXT=`uuidgen`
UUID=${UUIDTEXT:0:7}
LUUID=`echo ${UUID} | tr ‘[A-Z]’ ‘[a-z]’`
heroku create "unip2p-"$LUUID
git add .
git commit -m "Publish Heroku"
git push heroku master