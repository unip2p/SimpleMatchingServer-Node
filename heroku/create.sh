#!/bin/bash
cd `dirname $0`
UUIDTEXT=`uuidgen`
UUID=${UUIDTEXT:0:7}
URI=`echo ${UUID} | tr ‘[A-Z]’ ‘[a-z]’`
heroku create "unip2p-"$URI
git remote set-url heroku https://git.heroku.com/unip2p-${URI}.git
git add ../
git commit -m "Publish Heroku"
git push heroku master

GameKey=`uuidgen`
SecretKeyTEXT=`uuidgen`
SecretKey=${SecretKeyTEXT:0:7}${SecretKeyTEXT:9:13}

heroku config:set GAMEKEY=${GameKey}
heroku config:set SERCETKEY=${SecretKey}
echo ${URI} > ./url

echo MatchingServerURL: https://unip2p-${URI}.herokuapp.com/
echo MatchingGameKey: ${GameKey}
echo MatchingSecretKey: ${SecretKey}

open https://unip2p-${URI}.herokuapp.com/${GameKey}