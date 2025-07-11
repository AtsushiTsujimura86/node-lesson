# C++ → Node.js → React → ブラウザ でログを出力

## C++ → Node.jsの部分、HTTP.ver
### curlコマンドを使った方法
curlコマンドを使って、HTTPのPOSTリクエストを行う。  
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


### 
```

```
<br>
<br>
