# SimpleMatchingServer-Node.js
UniP2Pのためのシンプルなマッチングサーバーです。
UniP2Pに関しては、https://github.com/unip2p/unip2p

# Usage
```bash
$ git clone https://github.com/unip2p/SimpleMatchingServer-Node.js.git

$ cd SimpleMatchingServer-Node

$ npm install

$ npm start
```

# herokuにデプロイする場合

## 共通
- [heroku](https://heroku.com)でアカウントを作成する

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)をインストールする

## Windows
- heroku/create.ps1を実行する

## Mac
```bash
$ bash heroku/create.sh
```

## Unity側の設定
上記のスクリプトを実行した後、MatchingServerURI、GameKey、SecretKeyをメモして、UniP2PのMatchingSettingで設定する

## License

  [MIT](LICENSE)
