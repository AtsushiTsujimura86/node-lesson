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

## ✅ 参考コマンド（Mosquitto使用時）

```bash
# ブローカーをローカルで起動（Mosquitto）
mosquitto -v

# テスト受信（Subscriber）
mosquitto_sub -t "device/log"

# テスト送信（Publisher）
mosquitto_pub -t "device/log" -m "Hello from MQTT"
```


## C++ → Node.jsの部分、MQTT.ver
<br>
<br>
<br>

# 📡 組込みログをリアルタイムでWeb表示する構成（概要まとめ）

## ✅ 目的

組込み機器が出力するログを、**リアルタイムにWebブラウザ上で表示**する。  
構成要素ごとに役割を分担し、**扱いやすく・安定した設計**にする。

---

## ✅ 全体構成（役割分担）

```
[組込み機器]
   ↓（USBシリアル通信）
[Pythonスクリプト]
   ↓（MQTT publish）
[Node.jsサーバ]
   ↓（Socket.IO）
[React（ブラウザ）]
```

---

## ✅ 各パートの処理内容

### 🛠 組込み機器（C/C++）

- UART（USBシリアル）でログを出力
- 例：`printf("log: 1234\n");` など

---

### 🐍 Pythonスクリプト

- `pyserial` でシリアルポートからログを受信
- `paho-mqtt` を使って MQTT で送信

```python
import serial
import paho.mqtt.client as mqtt

# シリアル設定
ser = serial.Serial('COM3', 9600)

# MQTTクライアント
client = mqtt.Client()
client.connect("localhost", 1883)

while True:
    line = ser.readline().decode('utf-8').strip()
    client.publish("device/log", line)
```

---

### 🧩 Node.jsサーバ（中継）

- `mqtt` で "device/log" を購読
- `socket.io` でブラウザにプッシュ配信

```js
const mqtt = require('mqtt');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const mqttClient = mqtt.connect('mqtt://localhost');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

mqttClient.on('connect', () => {
  mqttClient.subscribe('device/log');
});

mqttClient.on('message', (topic, message) => {
  io.emit('log', message.toString());
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

### 🌐 React（Webフロントエンド）

- `socket.io-client` で Node.js に接続
- `useEffect` で `log` イベントを購読
- ログを配列として `setState` し、画面に表示

```js
useEffect(() => {
  socket.on("log", (data) => {
    setLogs(prev => [...prev, data]);
  });
  return () => socket.off("log");
}, []);
```

---

## ✅ 必要なツールとライブラリ

| 種類 | ツール / ライブラリ | 用途 |
|------|----------------------|------|
| シリアル通信 | `pyserial` | 組込みログの読み取り |
| MQTT通信 | `paho-mqtt`（Python）<br>`mqtt`（Node.js） | ログの送受信 |
| Web中継 | `socket.io`, `socket.io-client` | リアルタイム通信 |
| 表示 | `React` | ブラウザでログ表示 |
| ブローカー | `mosquitto` | MQTTの中継役（ローカルでOK） |

---

## ✅ ポートの役割

| ポート番号 | 用途 |
|------------|------|
| `1883` | MQTTブローカー（Mosquitto） |
| `3000` | Node.js（Socket.IO）＋React表示 |

---

## ✅ メリット

- C++側はシンプルなシリアル出力のみ
- MQTTでデバイスとWebをゆるくつなぐ
- WebはSocket.IOで即時反応

---

# 🛠 PythonとC++を組み合わせたリアルタイムログシステム（簡易設計）

## ✅ 目的

組込み機器からのシリアルログを Python で MQTT 送信しつつ、  
C++ 側で別のリアルタイム処理を **並列で**実行する構成を実現する。

---

## ✅ 構成概要

```
┌─────────────┐
│ 組込み機器  │
│  (USB UART) │
└────┬────────┘
     ↓
┌──────────────┐
│ Pythonスクリプト │
│ (PySerial + MQTT) │
└────┬──────────┘
     ↓ publish("device/log")
📡 MQTTブローカー（Mosquitto）
     ↓ subscribe("device/log")
┌──────────────┐
│ Node.js + Socket.IO │───→ React（ブラウザ表示）
└──────────────┘

同時に...

┌──────────────┐
│ C++ロジック実行 │ ← MQTTとは別処理
└──────────────┘
```

---

## ✅ 実行の流れ

1. C++ の `main()` 内で `std::thread` を使って `.py` を非同期実行
2. Python スクリプトはシリアルログを受信 → MQTT に publish
3. Node.js で MQTT を受信 → WebSocket でブラウザにプッシュ
4. C++ 側はリアルタイム処理（状態監視・ログ・制御など）を継続

---

## ✅ C++からPythonを非同期で起動するコード例

```cpp
#include <thread>
#include <cstdlib>
#include <iostream>
#include <chrono>

void runPython() {
    system("python serial_to_mqtt.py");
}

int main() {
    std::thread pyThread(runPython); // Pythonをバックグラウンド起動

    // メイン処理（リアルタイムループ）
    for (int i = 0; i < 10; ++i) {
        std::cout << "[C++] Processing cycle " << i << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    pyThread.join(); // Pythonが終了したら待つ（必要なら省略OK）
    return 0;
}
```

---

## ✅ ポイントと補足

| 項目 | 内容 |
|------|------|
| 🔁 非同期実行 | Pythonスクリプトは `.py` が終了するまで独立して動き続ける |
| 🧪 テストしやすさ | MQTTメッセージは `mosquitto_sub` で確認可能 |
| 🔒 安全設計 | `KeyboardInterrupt` や `try/finally` をPython側に実装済みで中断可 |

---

## ✅ 今後の拡張候補

- MQTTだけでなく、Python→Node.js間でファイルやIPCで共有も可能
- C++からもMQTTに送信（双方向通信）を入れて状態制御へ発展
- Reactにフィルター・タイムライン・CSVダウンロード機能追加





