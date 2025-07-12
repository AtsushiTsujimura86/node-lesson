# C++ → Node.js → React → ブラウザ でログを出力

## C++ → Node.jsの部分、HTTP.ver
### curlコマンドを使った方法
curlコマンドを使って、HTTPのPOSTリクエストを行う。curlのコマンドをつかうため、環境に依存する。これはwindownsのpowershell
2秒ごとにcurlコマンドを実行する。
``` cpp
#include <cstdlib>
#include <string>
#include <thread>   // sleep_for
#include <chrono>   // seconds

void sendLogToNodeServer(std::string& log){
    //escape the log string
    std::string escapedLog = log;
    //use curl to send the log to the Node.js server
    std::string command = "curl.exe -X POST http://localhost:3000/post -H \"Content-Type: application/json\" -d \"{\\\"log\\\":\\\"" + escapedLog + "\\\"}\"";
    system(command.c_str());
}

int main(){
    std::string log = "This is a test log message.";
    int i = 0;
    while(i < 10){
        log = "Log message number: " + std::to_string(i);
        sendLogToNodeServer(log);
        std::this_thread::sleep_for(std::chrono::seconds(2)); // Sleep for 2 seconds
        i++;
    }
    return 0;
}
```
#### ライブラリの解説
- ```cstdlib```： C標準のライブラリを使うためのヘッダ。ここではsystem()を実行するために使っている。ほかにもrand()やmalloc()などに用いられる。
- ```string```：std::stringを使うためのC++標準ライブラり。
- ```thread```：スレッド制御用ライブラリ、std::this_thread::sleep_for() のような関数で現在のスレッドを一時停止できる。
- ```chrono```：時間を扱うためのC++標準ライブラリ、std::chrono::seconds(2) は「2秒」という時間オブジェクト、 用途：時間計測、遅延処理、経過時間の計算など
<br>

## MSYS2の紹介
ここからは外部ライブラリを用いる関係で、MSYS2を導入する。

### ✅ MSYS2とは？

- Windows上でLinux風の開発ができる環境
- g++, make, curl, libmosquittoなどが簡単に使える
- pacmanコマンドでパッケージ管理できる

---

### ✅ 手順まとめ

#### ① MSYS2のインストール

- 公式サイト：[https://www.msys2.org](https://www.msys2.org)
- インストーラーをダウンロード → 実行
- インストール先はそのまま `C:\msys64` 推奨（変更しない）
- MSYS2 MINGW64を起動

---

#### ③ 初回アップデート

```bash
pacman -Syuu
```

- 一度終了して再起動を求められたら、再実行

---

#### ④ MQTT用ライブラリとC++ビルド環境の導入

```bash
pacman -S mingw-w64-x86_64-mosquitto mingw-w64-x86_64-gcc
```

- `libmosquitto`: MQTTライブラリ
- `g++`: C++ビルド用
- `mosquitto`: ブローカー（動作確認にも使える）

#### 確認コマンド

```bash
g++ --version         # → g++のバージョンが出る
mosquitto -v          # → mosquittoが起動する（Ctrl+Cで終了）
```

---


### libcurlを使った方法
```

```
#### 使用したライブラリ
-  ```libcurl```： HTTP, HTTPS, FTP など多くの通信プロトコルに対応した C/C++ の外部ライブラリ。Windows・Linux・macOS すべてで使える。C++ネイティブでHTTP POSTができる（curl.exeを呼び出さない）
<br>
<br>

---

## ✅ 1. MQTTとは？

MQTT（Message Queuing Telemetry Transport）は、
**軽量でリアルタイム性が高い通信プロトコル**。

主にIoTや組込み機器で使われ、
**「小さな機器 → サーバ → ブラウザ」などの情報共有をシンプルに実現できる**。

---

## ✅ 2. MQTTの基本構造

MQTTは3つの役割に分かれる：

| 役割         | 説明                            | 例                          |
|--------------|---------------------------------|-----------------------------|
| Publisher    | データを送る側                  | C++の組込み機器からログ送信 |
| Broker       | 中継サーバ（受け取って配る役）   | Node.js or Mosquitto        |
| Subscriber   | データを受け取る側              | ReactアプリやNode.js        |

通信の流れは：

```
Publisher（送信） → Broker（中継） → Subscriber（受信）
```

---

## ✅ 3. MQTTの特徴

| 特徴            | 内容                                                         |
|-----------------|--------------------------------------------------------------|
| 🔁 Pub/Sub形式  | 発信者と受信者が直接つながらず、「チャンネル」を通じて通信 |
| 💨 軽量          | HTTPより小さな通信で済む（組込み機器向け）                |
| 🔒 安定性        | QoS（配信保証）レベルを選べる                               |
| 🔌 常時接続型    | 一度つながればリアルタイムにデータを送受信できる           |
| 🌍 複数端末対応  | 複数のSubscriberが同じトピックを購読できる                 |

---

## ✅ 4. よく使われる用語

| 用語       | 意味                                | 例                              |
|------------|-------------------------------------|---------------------------------|
| トピック   | 情報の分類名（例：`device/log`）     | 温度 → `sensor/temp`            |
| メッセージ | トピックに送られるデータ（文字列等） | `"温度: 24.6℃"`                  |
| QoS        | 配信の信頼性レベル（0,1,2）         | QoS 1なら「必ず1回は届く」保証  |

---

## ✅ 5. ツジムラさんの構成例（リアルタイムログ）

```text
[C++（Publisher）]
  → "device/log" にメッセージ送信（libmosquitto）

[Node.js（Broker or Subscriber）]
  → メッセージを受信 or 中継

[React（Subscriber or Socket.IO経由）]
  → ログをブラウザにリアルタイム表示
```

---

## ✅ 6. C++でMQTT通信を実現するために必要なもの

| 要素 | 推奨ライブラリ | 備考                                  |
|------|----------------|---------------------------------------|
| MQTTクライアント | `libmosquitto`    | 軽量・組込み向け・C/C++対応          |
| ブローカー      | `Mosquitto` or `Node.js + mqtt` | ローカルで使う場合もセットアップ可能 |
| C++ビルド環境   | MSYS2 or Visual Studio     | `libmosquitto` をリンクしてビルド   |

---

## ✅ 7. 次のステップ（実装）

1. `libmosquitto` をMSYS2などでインストール
2. C++でMQTTメッセージを送る `main.cpp` を書く
3. ブローカーを立ち上げて受信確認
4. 必要に応じてNode.js・Reactと連携

---

## ✅ 参考コマンド（Mosquitto使用時）

```bash
# ブローカーをローカルで起動（Mosquitto）
mosquitto -v

# テスト受信（Subscriber）
mosquitto_sub -t "device/log"

# テスト送信（Publisher）
mosquitto_pub -t "device/log" -m "Hello from MQTT"
```

---

## ✅ まとめ

- MQTTは「軽い・速い・多機器向け」の通信手段
- HTTPよりも組込み向けでリアルタイム性が高い
- C++からも安定して使えるライブラリが揃っている

## C++ → Node.jsの部分、MQTT.ver

