# TODOs

## Pending

- [ ] Contact notes
- [ ] drafts
- [ ] save "active" contact --> display as purple
- [ ] replace SQLite view with query
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

## Done

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
