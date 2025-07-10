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