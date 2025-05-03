# How to use with a DevContainer

1. Build and Launch the DevContainer image (VSCode > Reopen in DevContainer)

## Using a real Android device over WiFi

1. From the host, [download the platform tools](https://developer.android.com/tools/releases/platform-tools#downloads) and connect to the device

1.a. `./adb kill-server && adb start-server`
1.b. `./adb devices -l`
1.c. make sure the device shows up

2. From the host, restart the device's adb in network mode

```sh
adb tcpip 5555
```

3. From your Android device, identify your device's IP address

4. From the devcontainer, connect to the device over WiFi

```sh
adb connect <device-IP>:5555
adb devices -l
```

5. From the devcontainer, build and run the app

```sh
npm run android
npm start
```

## Using an emulated device

> TODO

See doc at https://hub.docker.com/r/thyrlian/android-sdk-vnc.
