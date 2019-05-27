$UUID = ([Guid]::NewGuid()).ToString().split("-")[0]
$URI = "unip2p-" + $UUID
heroku create $URI
git remote rm heroku
git remote add heroku https://git.heroku.com/$URI.git
git add ../
git commit -m "Publish Heroku"
git push heroku master

$GameKey = ([Guid]::NewGuid()).ToString()
$SecretKey = ([Guid]::NewGuid()).ToString()

heroku config:set GAMEKEY=$GameKey
heroku config:set SERCETKEY=$SecretKey

Write-Output MatchingServerURL:$URI`r`nMatchingGameKey:$GameKey`r`nMatchingSecretKey:$SecretKey > ./MatchingServerSettings.txt

Write-Output MatchingServerURL:https://$URI.herokuapp.com
Write-Output MatchingGameKey:$GameKey
Write-Output MatchingSecretKey:$SecretKey

Read-Host "Press any key to exit."