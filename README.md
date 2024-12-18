# smashchats

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
     npx expo start
     npx expo run:ios
    ```

## DB

### DB architecture

> [!NOTE]  
> Public fields (prefixed with a `+`) and private fields (prefixed with a `-`) are not from a code point of view. Private fields are local information (i.e. not exposed to the outside world) or information that is not relevant to the network (generated locally). Public fields is data coming from the network / SmashPeer / SmashNeighbourhoodAdmin.

```mermaid
classDiagram

    class TrustRelation {
        +String __did_id__
        +Date created_at
        +String name
    }

    class Contact {
        +String __did_id__
        +String did_ik
        +String did_ek
        +String did_signature
        +SmashEndpoint[] did_endpoints

        -Boolean isSelf
        -String name
        -String notes

        +Record<string, number>? scores

        +String? meta_title
        +String? meta_description
        +String? meta_avatar
    }

    Contact "1" -- "0..1" TrustRelation

    class Messages {
        +Number timestamp
        +**String~SHA256~** sha256
        +**MessageType** type
        +String data
        +**String~SHA256~**? after
        +**String~SHA256~**? replyTo

        -Contact from
        -Contact to
        -TimeDate createdAt
        +TimeDate? dateDelivered
        +TimeDate? dateRead
    }
    Messages "0..*" <|--|> "2" Contact : from/to

    class MessageType
    <<enumeration>> MessageType
    MessageType : org.improto.message.text
    MessageType : org.improto.message.media
    MessageType : org.improto.message.audio
    MessageType : org.improto.message.location

    MessageType : org.improto.message.metadata.reaction
    MessageType : org.improto.message.metadata.delivered
    MessageType : org.improto.message.metadata.read

    MessageType : org.improto.profile.metadata.is_online
    MessageType : org.improto.profile.metadata.is_typing


    MessageType : com.smashchats.profile.public
    MessageType : com.smashchats.profile.restricted
    MessageType : com.smashchats.neighbourhood.join
    MessageType : com.smashchats.neighbourhood.profiles
    MessageType : com.smashchats.action.smash
    MessageType : com.smashchats.action.pass


    MessageType : com.**snapchat**.message.red -- (only for SnapChat)
    MessageType : com.**snapchat**.message.purple -- (only for SnapChat)
    MessageType : com.**snapchat**.profile.metadata.is_peeking -- (only for SnapChat)
    MessageType : com.**snapchat**.profile.metadata.is_reading -- (only for SnapChat)
```

### DB development

Currently, the DB is developed using [Drizzle Studio](https://github.com/drizzle-team/drizzle-studio).

```bash
npx expo start
# shift + m
# choose `Open **expo-drizzle-studio-plugin**`
```

Or visit `http://<your-ip>:8081/_expo/plugins/expo-drizzle-studio-plugin`

After modifying the schema, you need to run `npx drizzle-kit generate` before running the app again.

## Releasing 

Follow this guide: https://docs.expo.dev/guides/local-app-production

### Releasing for Android

```bash
rm ./android/app/build/outputs/bundle/release/app-release.aab
cd android
./gradlew app:bundleRelease
cd -
open ./android/app/build/outputs/bundle/release/
```

This will have created `app-release.aab` in `android/app/build/outputs/bundle/release/` directory.

- [Create a new alpha/internal release](https://play.google.com/console/u/0/developers/9150193425219657230/app/4976355900096563201/tracks/4701103354613619379/create)

### Releasing for iOS

Open Xcode:

```bash
xed ios
```

- Select the target "SmashChats" and click on the play button.
- Menubar: Product > Archive
- Select "SmashChats" and click on "Distribute App"

### Fastlane

Follow [this guide](https://thecodingmachine.github.io/react-native-boilerplate/docs/BetaBuild/#installing-fastlane).

Prerequisites:

```bash
brew install ruby
sudo gem install fastlane -NV
```

## Building for production

https://docs.expo.dev/guides/local-app-production/

## Troubleshooting

```bash
adb -d logcat --pid=`adb -d shell pidof -s com.unstaticlabs.smashchats`
```
