# Synopsis

マルチOP対応のための抽象化に合わせて従来コードをラップするモジュール

# モジュールメソッド

## init

```
init(op_instnace)
```

### 引数

#### op\_instance

OKSKYの`op_instance`.

### 戻り値

`null`

### 副作用

`op_instance`に`getToken`と`getBody`を定義する。

#### getToken

keel tokenの値をOKSKY callbackメッセージから取得して返す。

#### getBody

`conversions.requestBody`のエイリアス。

## postProc

後処理メソッド。

`validation.func` へのラッパー。

# モジュールプロパティ

## validation

`validation`モジュール。

## conversions

`conversions`モジュール。