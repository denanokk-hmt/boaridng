# Synopsis

LINE WORKSから取得した画像をCargoへアップロードし、アドレスを取得する。

# モジュールメソッド

## func

```
func(overall)
```

### 引数

#### overall

`postProc`用にパラメータの詰め込まれた`overall`連想配列。

### 戻り値

成功時は`overall.op_data`。

失敗時は`null`

### 副作用

まず、Works mobile (LINE WORKS)サーバーから画像を取得する。
このとき、LINE WORKS側がアクセスを単一のIPアドレスのレベルで制限していることから、この取得はKeel経由で行われる。

*Keelに対して処理途中でリクエストを発行するのはこれだけである。通常、Boardingとしての仕事をすべて終えてからKeelにパスするものであり、この機能はこのデザインを破壊するwartである。これが気に入らない場合は、Works mobileに対する呪詛を10回唱えて落ち着こう。*

続いて、Cargoへと画像をアップロードした上で`overall.op_data.img_url`にアドレスをセットし、`overall.op_data.resourceId`を削除する。

## 呼び出し元

LINE WORKSの`op.index.postProc`として呼び出される。