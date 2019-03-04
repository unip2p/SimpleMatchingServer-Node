#!/bin/bash
cd `dirname $0`
while read line
do
  heroku apps:destroy --app unip2p-$line --confirm unip2p-$line
done < url