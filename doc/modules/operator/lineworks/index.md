# Synopsis

OP LINE WORKSのためのラップモジュール。

# モジュールメソッド

## initFunc

```
init(op_instance)
```

### 引数

#### op\_instance

LINE WORKSの`op_instance`.

### 戻り値

`null`

### 副作用

`op_instance`に`getToken`と`getBody`を定義する。

#### getToken

Keel token *そのものを* 返す。
検証を有名無実化することでパスさせる。

#### getBody

LINE WORKSコールバックメッセージの変換処理を行う。
`null`またはメッセージオブジェクトを返す。

## postProc

`setimage.func`を参照のこと。