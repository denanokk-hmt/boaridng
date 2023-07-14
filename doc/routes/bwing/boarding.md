# エンドポイント

## `/post/op/receive/message`

### 役割

OPによる受信メッセージのコールバックwebhookポイント。

### 処理概要

#### 値の取得とparamsの組み上げ

Express requestから取れる値を取得・設定する。

#### バリデーションとレスポンス

paramsに`null`が含まれていないかと、Keel tokenが一致するかのバリデーションを行う。

バリデーションの結果如何によらずこのタイミングでExpressに応答させる。これは、OKSKYが0.2s以内の応答を求めるため。

#### routesモジュールへの移譲

処理をroutesモジュールへ移譲する

## `/post/op/reg/lineworks/bot`

### 役割

LINE WORKSに対してテナントにトークbotを登録し、botNoを取得する。

botNoはcredential情報の一部を担うものだが、他のcredential情報が揃った状態でAPIによって登録しなければ得られない。
そこで、立ち上げ作業の一環としてこのエンドポイントへのアクセスが必要になる。

### パラメータ

#### token

Keel tokenの値

### 応答

botNoを含むJSON