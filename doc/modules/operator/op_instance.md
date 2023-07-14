# Synopsis

`/post/op/receive/message`のエンドポイントモジュール。

# モジュールメソッド

## func

```
async func(req, res, params)
```

### 引数

#### `req`

Express requestオブジェクト。

#### `res`

Express responseオブジェクト。

#### `params`

様々な値を詰め込んだ連想配列

### 戻り値

Keelからの応答、または`undefined`.

### 処理概要

#### sessionの取得

`op_rid`の値を元にセッションを取得する。

#### post process

OPのpost processを呼び出す。

#### paramsの再設定

Keelに投げるためにparamsの平坦化を行う

#### Keelへリクエスト

Keelの`/post/op/receive/message`にリクエストする。