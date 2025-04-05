# TODOs

## Icebox

-   [ ] fix black flash between camera and media preview
-   [ ] replace routing? https://github.com/expo/router/issues/723
-   [ ] animations?
-   [ ] copy telegram's fluidity (get inspiration from their animations)
-   [ ] multiple-people discussions (groups)
-   [ ] multiple identities
-   [ ] fastlane android bump version
-   [ ] fastlane android upload
-   [ ] follow https://www.runway.team/blog/how-to-set-up-a-ci-cd-pipeline-for-your-ios-app-fastlane-github-actions
    -   [ ] fastlane ios
    -   [ ] fastlane ios bump version

## Pending

-   [ ] fix chat list ordering (see with @xsbfh for algorithm?)
-   [ ] bio max 140chars
-   [ ] replace Pressable with TouchableHighlight where needed
-   [ ] DID set (when contact sends profile) vs DID patch (when resolving? & when nab sends profiles)
-   [ ] delete own avatar
-   [ ] mark as unread
-   [ ] hide screen on connecting and show connecting status
-   [ ] fetch badges from somewhere(?)
-   [ ] add unit preferences to settings screen
-   [ ] add interests somewhere(?)
-   [ ] decouple image sending feature into 1/ render 2/ send
-   [ ] remove data from media_emb (since we store it in its own table)
-   [ ] bug: onMessageReceive, current code removes previous displayed messages
-   [ ] sending/receiving image doesn't display correctly; need to reopen discussion

## In progress

-   [~] correct join
    -   [~] remove sme from join action
    -   [~] generate prekey
    -   [~] join sme
-   [~] cache images on device
-   [~] send media messages
    -   [ ] media organizer à la stash
-   [~] drawing feature on camera w/ Skia
    -   [ ] allow user to change drawing colors
    -   [~] videos on ios are sideways
    -   [ ] merge drawing and media before sending
    -   [ ] this is SLOOOOW pls fix
    -   [ ] drawing path is sharp at the end of the path, make rounded
    -   [x] add an "undo" button to the camera
    -   [x] add text on a horizontal line on top of image
-   [~] Profile screen
    -   [x] fix transparency behind tab bar
    -   [ ] fix scrollIndicatorInsets for first tab
    -   [ ] fix transparency behind header
    -   [ ] fix buggy-ness
    -   [~] implement gesture handler on tabs & user bio so that we can scroll to the top
-   [~] delete contacts / discussions
    -   [x] selection mode
    -   [x] exit selection mode
    -   [x] delete button
    -   [ ] confirmation modal(?)
    -   [ ] when enabling selection mode, ChatItem content should move animatedly away from the selection marker

## Done

-   [x] Contact notes
    -   [x] dynamically generate filters
    -   [x] use filters to search in notes & user bio.{title, description}
    -   [x] handle LOTS of emojis (allow for scrolling)
    -   [x] duplicate emojis should be collapsed into one badge
    -   [x] adding note to a contact
    -   [x] remove integers 0-9 from filters, unless it is emojis (i.e. 1 vs 1️⃣)
    -   [x] refresh filters when notes change
-   [x] fix collapsed header on profile screen
-   [x] bug latest message id in discussion apparently only looks for Text ??
-   [x] (UI) add badges to profile
-   [x] save "active" contact --> display as purple ; active here is like "dirty" in an angular form
-   [x] drafts (in-memory)
-   [x] (BUG) lastMessageId not correctly initialized
-   [x] mark messages as received / read
-   [x] profile scroll / collapsible header
    -   [x] fix padding tabs hidden behind tabbar & header
    -   [x] dismiss keyboard when scrolling header down
    -   [x] on expand, keyboard should be dismissed
    -   [x] invert scroll for first tab
    -   [x] fix scrollIndicatorInsets for first tab
-   [x] add system message for "unread messages"
-   [x] implement https://medium.com/@linjunghsuan/implementing-a-collapsible-header-with-react-native-tab-view-24f15a685e07
-   [x] replace SQLite view with query
-   [x] scroll on android in ChatList doesn't work
-   [~] On load, saved filters should be selected
    -   [~] On load, selected filters should filter the chat list
-   [x] don't save "profile" messages
-   [x] show all discovered profiles in chat list
-   [x] show discovered profiles as (some text TBD) so that we can identify them
-   [x] mark messages as read
-   [x] don't save user "self" in db
-   [x] flash when navigating
-   [x] disable wizard
-   [x] qr code for DID
-   [x] prod & dev always join and discover
