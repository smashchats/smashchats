# TODOs

## Pending

-   [ ] drafts (in-memory)
-   [ ] save "active" contact --> display as purple ; active here is like "dirty" in an angular form
-   [ ] fix chat list ordering (see with @xsbfh for algorithm?)
-   [ ] DID set (when contact sends profile) vs DID patch (when resolving? & when nab sends profiles)
-   [ ] replace Pressable with TouchableOpacity where needed
-   [ ] animations?
-   [ ] delete contacts / discussions
-   [ ] delete own avatar
-   [ ] mark as unread
-   [ ] filters based on notes
-   [ ] hide screen on connecting and show connecting status
-   [ ] copy telegram's fluidity (get inspiration from their animations)
-   [ ] multiple-people discussions (groups)
-   [ ] multiple identities
-   [ ] send media messages
    -   [ ] media organizer à la stash
-   [ ] cache images on device
-   [ ] bio max 140chars
-   [ ] replace routing? https://github.com/expo/router/issues/723
-   [ ] fastlane android bump version
-   [ ] fastlane android upload
-   [ ] follow https://www.runway.team/blog/how-to-set-up-a-ci-cd-pipeline-for-your-ios-app-fastlane-github-actions
    -   [ ] fastlane ios
    -   [ ] fastlane ios bump version

## In progress

-   [~] Profile screen
    -   [x] fix transparency behind tab bar
    -   [ ] fix scrollIndicatorInsets for first tab
    -   [ ] fix transparency behind header
    -   [ ] fix buggy-ness
    -   [~] implement gesture handler on tabs & user bio so that we can scroll to the top
-   [~] Contact notes
    -   [x] dynamically generate filters
    -   [x] use filters to search in notes & user bio.{title, description}
    -   [x] handle LOTS of emojis (allow for scrolling)
    -   [x] duplicate emojis should be collapsed into one badge
    -   [ ] adding note to a contact
    -   [ ] refresh filters when notes change

## Done

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
