# Classes:

### Controllers
- **SearchController**
- **RequestController**
- **QueueController**
- **VoteController**
- **RuleController**
- **GenreController**
- **ReportController**
### Services
- **SearchService**
- **RequestService**
- **QueueService**
- **TrackService**
- **VoteService**
- **RuleService**
- **GenreService**
- **ReportService**
- **NotificationService**
- **RealtimeService**
### Models
- **UserModel**
- **QueueModel**
- **TrackModel**
- **VoteModel**
- **RuleModel**
- **GenreModel**
- **HistoryModel**
### Adapters
- **SpotifyAPIAdapter**
- **SpotifyPlaybackAdapter**

# Initiations:

### Customer:
- [Customer searches for a track](#customer-searches-for-a-track)
- [Customer requests a track](#customer-requests-a-track)
- [Customer votes on a track](#customer-votes-on-a-track)
- [Customer or admin loads the queue](#customer-or-admin-loads-the-queue)
- [Customer or admin views the rules](#customer-or-admin-views-the-rules)
### Admin
- [Admin removes a track from the queue (only tracks that are NOT in now playing)](#admin-removes-a-track-from-the-queue-only-tracks-that-are-not-in-now-playing)
- [Admin pauses the now playing track](#admin-pauses-the-now-playing-track)
- [Admin plays the now playing track](#admin-plays-the-now-playing-track)
- [Admin skips the now playing track](#admin-skips-the-now-playing-track)
- [Admin changes the rules](#admin-changes-the-rules)
- [Admin searches list of available genres to whitelist or blacklist](#admin-searches-list-of-available-genres-to-whitelist-or-blacklist)
- [Admin requests a report](#admin-requests-a-report)
- [Admin turns on the Jukebox system at the beginning of the day](#admin-turns-on-the-jukebox-system-at-the-beginning-of-the-day)
### Automatic
- [Track in now playing ends](#track-in-now-playing-ends)
- [Queue refreshes the now playing track’s progress periodically](#queue-refreshes-the-now-playing-tracks-progress-periodically)

# States to maintain or update:

- Queue table
- Votes table
- Tracks table
- History table
- Users table
- Rules table
- Client views (send updates via websocket)
- Notifications
- Default playlist (remade every morning on system startup)
- Spotify queue on SDK, which is on the admin’s frontend (only keep now playing track)
   - **Note:** I really tried to make it so that the queue in Spotify maintains the now playing track and the next track so the next track can buffer before being played, but the queue control from the Spotify playback SDK only allows for ‘remove entire queue including now playing’ and ‘add item to end of queue’. This is too restrictive and makes vote skipping and admin removal from the queue way too complicated, so it’s just not worth it. Just request to play the track as it moves into now playing in the Jukebox queue.

# Process flows:


### Customer searches for a track
1. Customer enters a search term
2. View sends the search term to **SearchController**
3. **SearchController** parses and validates the search term
4. **SearchController** sends the search term to **SearchService**
5. **SearchService** runs any business logic (none currently known)
6. **SearchService** sends the search term to **SpotifyAPIAdapter**
7. **SpotifyAPIAdapter** requests search results from Spotify
8. Spotify sends search results to **SpotifyAPIAdapter**
9. **SpotifyAPIAdapter** cleans the search results
10. **SpotifyAPIAdapter** sends the search results to **SearchService**
11. **SearchService** runs any business logic (none currently known)
12. **SearchService** sends the search results to **SearchController**
13. **SearchController** performs any final formatting of the search results
14. **SearchController** sends the search results to View

### Customer requests a track
1. Customer selects a track from the search results, clicks “Request This Track”
2. View sends the track’s spotify id to **RequestController**
3. **RequestController** extracts and validates the data from the request
4. **RequestController** sends the id to **RequestService**
5. **RequestService** requests the full metadata from **SpotifyAPIAdapter**
6. **SpotifyAPIAdapter** fetches the track’s metadata from Spotify
7. **SpotifyAPIAdapter** returns the track’s metadata to **RequestService**
8. **RequestService** requests all rules from **RuleModel**
9. **RuleModel** retrieves all rules from Rules table
10. **RuleModel** sends all rules to **RequestService**
11. **RequestService** runs the requested track against the rules
12. If the requested track does NOT pass the rules:
- **RequestService** sends the rule that was broken to **NotificationService**
- **NotificationService** prepares a notification specifying the rule broken
- **NotificationService** sends the notification to View
- Process ends here
13. **RequestService** extracts the rule that specifies the time between each request
14. **RequestService** requests the user’s timestamp of last request from **UserModel**
15. **UserModel** retrieves the user’s timestamp of last request from Users table
16. **UserModel** sends the user’s timestamp of last request to **RequestService**
17. **RequestService** checks the user’s timestamp of last request against the current time and the rule that specifies the time between each request
18. If the time since the user’s last request is too short:
- **RequestService** sends the “Too many requests” rule along with the time until next request can be made to **NotificationService**
- **NotificationService** prepares a notification specifying the “Too many requests” message and the time until next request can be made
- **NotificationService** sends the notification to View
- Process ends here
19. **RequestService** requests a track with the matching spotify track id of the request from **QueueModel**
20. **QueueModel** retrieves the track from the Queue table (or retrieves nothing if it doesn’t exist)
21. **QueueModel** sends the results to **RequestService**
22. If **RequestService** receives a track from the **QueueModel**:
- **RequestService** sends the “Track already in queue” rule to **NotificationService**
- **NotificationService** prepares a notification specifying the “Track already in queue” rule
- **NotificationService** sends the notification to View
- Process ends here
23. **RequestService** sends the track’s metadata to **TrackService**
24. **TrackService** performs any business logic on the metadata (none currently known)
25. **TrackService** sends the metadata to **TrackModel**
26. **TrackModel** stores or overwrites the metadata in Tracks table
27. **TrackModel** sends the success of the operation to **RequestService**
28. **RequestService** sends the track request to **QueueService**
29. **QueueService** sends the request data to **QueueModel**
30. **QueueModel** stores the request data in Queue table
31. **QueueModel** returns the success of the operation to **QueueService**
32. **QueueService** sends the new queue item’s data to **RealtimeService**
33. **QueueService** also returns the success to **RequestService**
34. **RequestService** tells **UserModel** to update the user’s last request time
35. **RealtimeService** sends an update to all client devices listening to the “queueItemAdded” event along with the added queue item’s data
36. **QueueService** sends a successful append message to **RequestService**
37. **RequestService** sends a successful request message to **NotificationService**
38. **NotificationService** prepares a successful request notification
39. **NotificationService** sends the notification to the client View

### Customer votes on a track
1. Customer clicks the upvote or downvote button on a track in the queue
2. View sends vote data to **VoteController**
3. **VoteController** extracts and validates the data from the vote
4. **VoteController** sends the vote data to **VoteService**
5. **VoteService** performs any business logic (none currently known)
6. **VoteService** sends the vote data to **VoteModel**
7. **VoteModel** stores the vote data in Votes table, checking if the user has already voted on that queue item, and if so, then simply updates the vote direction on the same vote item
8. **VoteModel** sends the success of the operation, as well as whether the vote has been inserted, switched, or unchanged, to **VoteService**
9. **VoteService** requests the data for the specific queue item from **QueueModel**
10. **QueueModel** retrieves the data for the specific queue item from Queue table
11. **QueueModel** sends the data for the specific queue item to **VoteService**
12. **VoteService** extracts the votes for the queue item and adds the current vote to them
13. **VoteService** requests the rule for votes from **RuleModel**
14. **RuleModel** retrieves the rule for votes from Rules table
15. **RuleModel** sends the rule for votes to **VoteService**
16. **VoteService** checks the vote count against the rule for votes and decides whether or not to mark the queue item as will be skipped
17. **VoteService** sends the new vote counts and bool for will be skipped to **QueueService**
18. **QueueService** sends the new vote count and bool for will be skipped to **QueueModel**
19. **QueueModel** stores the updated queue item data in Queue table
20. **QueueModel** returns the success of the operation to **QueueService**
21. **QueueService** sends new vote totals along with the relevant queue item’s id and whether or not it changed to will be skipped to **RealtimeService**
22. **RealtimeService** sends an update to all client devices listening to the “votesChanged” event along with the new vote totals for the queue item and whether or not it changed to will be skipped

### Customer or admin loads the queue
1. Client’s View sends queue view request to **QueueController**
2. **QueueController** parses and validates request
3. **QueueController** sends request to **QueueService**
4. **QueueService** performs any business logic on request (none currently known)
5. **QueueService** requests all queue data from **QueueModel**
6. **QueueModel** retrieves all queue data from Queue table
7. **QueueModel** sends all queue data to **QueueService**
8. **QueueService** extracts all queue ids from the queue data
9. **QueueService** sends the list of queue ids and the id of the user requesting the queue to **VoteService**
10. **VoteService** requests the user’s votes for those queue items from **VoteModel**
11. **VoteModel** retrieves all votes from that user for those queue items from the Votes table
12. **VoteModel** sends the retrieved votes to **VoteService**
13. **VoteService** sends the user’s vote type for each queue item (true, false, does not provide unvoted items) to **QueueService**
14. **QueueService** merges the vote data into the queue data so each queue item includes the requesting user’s vote type
15. **QueueService** sends the combined queue and user’s vote data to **QueueController**
16. **QueueController** formats the response
17. **QueueController** sends the response to the client’s View
18. View renders the queue and grays out any vote buttons corresponding to the user’s previous votes as well as grays out vote buttons for queue items requested by the viewing user

### Customer or admin views the rules
1. Client’s View sends view rules request to **RuleController**
2. **RuleController** parses and validates request
3. **RuleController** sends request to **RuleService**
4. **RuleService** performs any business logic (none currently known)
5. **RuleService** requests all rules from **RuleModel**
6. **RuleModel** retrieves all rules from Rules table
7. **RuleModel** sends all rules to **RuleService**
8. **RuleService** performs any business logic on all rules (none currently known)
9. **RuleService** sends all rules to **RuleController**
10. **RuleController** formats the rules
11. **RuleController** sends the rules to client’s View

### Admin removes a track from the queue (only tracks that are NOT in now playing)
1. Admin selects a track in the queue, clicks remove, then clicks confirm
2. View sends request with queue item’s id to remove to **QueueController**
3. **QueueController** parses and validates request
4. **QueueController** sends request to **QueueService**
5. **QueueService** performs any business logic (none currently known)
6. **QueueService** sends request for removal of queue item and shifting of positions to **QueueModel**
7. **QueueModel** executes transaction on Queue table
8. **QueueModel** sends success result to **QueueService**
9. **QueueService** concurrently sends the change to the queue to **RealtimeService**
- **RealtimeService** sends an update to all client devices listening to the “queueChanged” event
10. **QueueService** concurrently sends the id of the user who requested the removed queue item to **NotificationService**
- **NotificationService** prepares a notification for “your request was removed by admin”
- **NotificationService** sends the notification to the user’s device

### Admin pauses the now playing track
1. Admin clicks the pause button
2. Frontend tells SDK to pause track
3. SDK emits a “player_state_changed” event
4. Frontend listens for this event and sends it to **SpotifyPlaybackAdapter**
5. **SpotifyPlaybackAdapter** sends the request to **QueueService**
6. **QueueService** performs any business logic (none currently known)
7. **QueueService** sends playback duration and pause command to **RealtimeService**
8. **RealtimeService** sends an update with playback duration to all client devices listening for the “pause” event

### Admin plays the now playing track
1. Admin clicks the play button
2. Frontend tells SDK to play track
3. SDK emits a “player_state_changed” event
4. Frontend listens for this event and sends it to **SpotifyPlaybackAdapter**
5. **SpotifyPlaybackAdapter** sends the request to **QueueService**
6. **QueueService** performs any business logic (none currently known)
7. **QueueService** sends playback duration and play command to **RealtimeService**
8. **RealtimeService** sends an update with playback duration to all client devices listening for the “play” event

### Admin skips the now playing track
1. Admin clicks the skip button
2. View sends request with queue item’s id to **QueueController**
3. **QueueController** parses and validates the request
4. **QueueController** sends request to **QueueService**
5. **QueueService** sends advance queue request to **QueueModel**
6. **QueueModel** performs queue advance on Queue table
7. **QueueModel** returns the next queue item on now playing (not skipping) to **QueueService**
8. **QueueService** concurrently sends next track on now playing to **SpotifyPlaybackAdapter**
- **SpotifyPlaybackAdapter** sends play request to **RealtimeService**
- **RealtimeService** emits event containing track to play to admin device’s frontend listening for “newTrack” event
- Frontend sends request to SDK to play the new track
9. **QueueService** concurrently sends next queue item on now playing to **RealtimeService**
- **RealtimeService** sends an update with the next queue item on now playing to all client devices listening to the “advanceQueue” event
10. **QueueService** concurrently sends the id of the user who requested the queue item that was skipped to **NotificationService**
11. **NotificationService** prepares a notification for “your request was skipped by the admin”
12. **NotificationService** sends the notification to the user’s device

### Admin changes the rules
1. Admin has the rule view open and makes changes on the forms and submits the changes
2. View sends the changed rules to **RuleController**
3. **RuleController** parses and validates the request
4. **RuleController** sends the changed rules to **RuleService**
5. **RuleService** performs any business logic (none currently known)
6. **RuleService** sends the changed rules to **RuleModel**
7. **RuleModel** updates Rule table
8. **RuleModel** sends operation’s success to **RuleService**
9. **RuleService** returns success to **RuleController**
10. **RuleController** returns success to View

### Admin searches list of available genres to whitelist or blacklist
1. Admin has either ‘whitelist’ or ‘blacklist’ selected (not both) and types a search term into the search bar under the selected option and hits enter
2. View sends term to **GenreController**
3. **GenreController** parses and validates the request and formats the term
4. **GenreController** sends the request to **GenreService**
5. **GenreService** performs any business logic (none currently known)
6. **GenreService** requests a search of the term to **GenreModel**
7. **GenreModel** retrieves the relevant genres from Genres table
8. **GenreModel** sends the relevant genres to **GenreService**
9. **GenreService** performs any business logic (none currently known)
10. **GenreService** sends the relevant genres to **GenreController**
11. **GenreController** formats the genre list
12. **GenreController** sends the genre list to the client’s View

### Admin requests a report
1. Admin selects a report from the reports page and clicks “generate report”
2. View sends request to **ReportController**
3. **ReportController** parses and validates request
4. **ReportController** sends request to **ReportService**
5. **ReportService** uses report type and any filters/inputs to decide what information is needed
6. **ReportService** sends request for data to **HistoryModel**
7. **HistoryModel** retrieves data from History table
8. **HistoryModel** sends data to **ReportService**
9. **ReportService** aggregates data and reformats it into requested report data
10. **ReportService** sends the report data to **ReportController**
11. **ReportController** performs any final formatting
12. **ReportController** sends the report data to the client’s View

### Admin turns on the Jukebox system at the beginning of the day
1. Admin opens the website for the jukebox system, logs in, and clicks ‘start jukebox system’.
2. Admin’s frontend sends request to **QueueController**
3. **QueueController** parses and validates request
4. **QueueController** sends request to **QueueService**
5. **QueueService** performs any business logic (none currently known)
6. **QueueService** concurrently sends a request to empty the queue to **QueueModel**
- **QueueModel** deletes all entries in Queue table
7. **QueueService** concurrently sends a request to empty the votes to **VoteModel**
- **VoteModel** deletes all entries in Votes table
8. **QueueService** concurrently sends a request default playlist data to **HistoryModel**
- **HistoryModel** retrieves the top 100 requested tracks from History table
- **HistoryModel** sends the top 100 requested tracks to **QueueService**
- **QueueService** sends the top 100 requested tracks list to **SpotifyAPIAdapter**
- **SpotifyAPIAdapter** sends a playlist creation request of the top 100 tracks to Spotify
- **SpotifyAPIAdapter** returns the playlist’s URI to **QueueService**
9. **QueueService** sends a request to play default playlist to **RealtimeService**
10. **RealtimeService** emits ‘play default playlist’ event
11. Admin’s frontend, which is listening for this event, catches it
12. Admin’s frontend sends a request to SDK to play default playlist
13. SDK emits a ‘player_state_changed’ event
14. Admin’s frontend, which is listening for this event, catches it
15. Admin’s frontend sends a request with the song that is playing to **SpotifyPlaybackAdapter**
16. **SpotifyPlaybackAdapter** sends the track that will play to **QueueService**
17. **QueueService** sends the next queue item that will play to **RealtimeService**
18. **RealtimeService** sends an “advanceQueue” update with the queue item to advance to to client devices

### Track in now playing ends
1. SDK emits event “player_state_changed” saying the track ended
2. Admin frontend, which is listening for this event, checks if the track was playing from the default playlist, and sends the information to **SpotifyPlaybackAdapter**
3. **SpotifyPlaybackAdapter** sends event to **QueueService**
4. **QueueService** sends an advance queue request to **QueueModel**
5. **QueueModel** advances the queue items in Queue table to the next non skipping item - if items were skipped due to votes, then it also retrieves a list of users whose requests were skipped just now
6. **QueueModel** returns the next queue item that will play (or empty item if queue is empty) and potential list of users whose requests were skipped to **QueueService**
7. If next queue item that will play is empty, meaning the queue is empty:
- If default playlist was NOT previously playing:
   - **QueueService** sends ‘play default playlist’ request to **SpotifyPlaybackAdapter**
   - **SpotifyPlaybackAdapter** sends ‘play default playlist’ request to **RealtimeService**
   - **RealtimeService** emits ‘play default playlist’ event
   - Admin’s frontend is listening for this event and catches it
   - Admin’s frontend sends ‘play default playlist’ request to SDK
- Admin’s frontend gets the id of the track that enters now playing from SDK
- Admin’s frontend sends the track id to **SpotifyPlaybackAdapter**
- **SpotifyPlaybackAdapter** sends track to play to **QueueService**
8. Else (queue is not empty):
- **QueueService** concurrently sends the queue item’s data to **HistoryModel**
   - **HistoryModel** records the play of the request in History table
- **QueueService** concurrently sends the next track that will play to **SpotifyPlaybackAdapter**
   - **SpotifyPlaybackAdapter** sends the next track to play to **RealtimeService**
   - **RealtimeService** emits event with the next track to play to admin client’s frontend, which is listening for the “newTrack” event
   - Admin’s frontend sends new track to play to SDK
9. **QueueService** concurrently sends the next queue item that will play to **RealtimeService**
- **RealtimeService** sends an “advanceQueue” update with the queue item to advance to to client devices
10. **QueueService** concurrently sends the list of users whose requests were skipped due to votes to **NotificationService**
- **NotificationService** prepares notifications for “your request was skipped due to votes” for each user
- **NotificationService** sends the notifications to the users affected

### Queue refreshes the now playing track’s progress periodically
1. Admin’s frontend requests the now playing track’s progress periodically on a timer from SDK
2. Admin’s frontend sends this progress to **SpotifyPlaybackAdapter**
3. **SpotifyPlaybackAdapter** sends this progress to **RealtimeService**
4. **RealtimeService** emits an “update track progress” event to client devices