# TODOs

## Pending

- [~] Contact notes
  - [ ] dynamically generate filters
  - [ ] use filters to search in notes & user bio.{title, description}
- [ ] drafts
- [ ] implement https://medium.com/@linjunghsuan/implementing-a-collapsible-header-with-react-native-tab-view-24f15a685e07
- [ ] save "active" contact --> display as purple
- [ ] fix chat list ordering (see with xsbfh for algorithm?)
- [ ] DID set (when contact sends profile) vs DID patch (when resolving? & when nab sends profiles)
- [ ] touchableOpacity
- [ ] animations?
- [ ] delete contacts / discussions
- [ ] delete own avatar
- [ ] mark as unread
- [ ] filters based on notes
- [ ] hide screen on connecting and show connecting status
- [ ] copy telegram's fluidity (get inspiration from their animations)
- [ ] multiple-people discussions (groups)
- [ ] multiple identities
- [ ] send media messages
  - [ ] media organizer à la stash
- [ ] mark messages as received / read (depends on library)
- [ ] bio max 140chars
- [ ] replace routing? https://github.com/expo/router/issues/723
- [ ] fastlane android bump version
- [ ] fastlane android upload
- [ ] follow https://www.runway.team/blog/how-to-set-up-a-ci-cd-pipeline-for-your-ios-app-fastlane-github-actions
  - [ ] fastlane ios
  - [ ] fastlane ios bump version
- [ ] profile scroll
  - [ ] implement gesture handler on tabs & user bio so that we can scroll to the top
  - [ ] fix padding tabs hidden behind tabbar & header

## Done

- [x] replace SQLite view with query
- [x] scroll on android in ChatList doesn't work
- [~] On load, saved filters should be selected
  - [~] On load, selected filters should filter the chat list
- [x] don't save "profile" messages
- [x] show all discovered profiles in chat list
- [x] show discovered profiles as (some text TBD) so that we can identify them
- [x] mark messages as read
- [x] don't save user "self" in db
- [x] flash when navigating
- [x] disable wizard
- [x] qr code for DID
- [x] prod & dev always join and discover
