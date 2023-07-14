# Synopsis

LINE WORKSのコールバックで画像を受信した際に、WhatYaで画像を扱えるように用意する。

# モジュールメソッド

## func

```
func(resourceId)
```

### resourceId

コールバックで得られる画像のresourceId

### 戻り値

成功した場合、`content_type`及び`data`を持つ連想配列。
`data`はバイナリデータの`Buffer`.

失敗した場合は`null`.