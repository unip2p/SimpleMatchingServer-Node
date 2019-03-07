#!/bin/bash
cd `dirname $0`
while read line
do
  heroku apps:destroy --app $line --confirm $line
done < url