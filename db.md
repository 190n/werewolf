What does the database currently look like?
===========================================

- `gameKeys`
    - Hash mapping a game ID to the player ID of that game's leader.
- `games:{gameId}:players`
    - Set of player IDs, including leader. **All players that exist in that game.**
- `games:{gameId}:connected`
    - Set of player IDs, possibly including leader. **All players that are currently connected to that game.**
- `games:{gameId}:nicks`
    - Hash mapping player IDs to nicknames.
- `games:{gameId}:playersInGame`
    - Set of player IDs that were in the game when leader clicked Start
- `games:{gameId}:stage`
    - `lobby`, `cardSelection`, `viewCard`, `turns`, `discussion`, `voting`, or `results`.
- `games:{gameId}:cardsInPlay`
    - list of all cards in the game (incl. center)
- `games:{gameId}:assignedCards`
    - hash mapping player ID to card
- `games:{gameId}:center`
    - list of cards in the center
- `games:{gameId}:haveConfirmed`
    - set of player IDs that have confirmed viewing their card
- `games:{gameId}:events`
    - list of events in the game, in order of occurence. event format:  
        `{type}:{playerID}:{data}`
    - type is `r` (revelation) or `a` (action). data may be an empty string.
- `games:{gameId}:completedTurns`
    - set of player IDs that have completed their turn
- `games:{gameId}:swaps`
    - list of swaps that will occur in the game. format:  
        `{playerId}:{card1}:{card2}:{order}`  
        `playerId` is the player who moved the cards. card1 and card2 are either a single digit (0, 1, 2; index into center) or a player ID. `order` is a number. swaps are evaluated in ascending order based on `order`.
- `games:{gameId}:waiting`
    - set of player IDs that can't take action yet (e.g. insomniac)
- `games:{gameId}:config:discussionLength`
    - length of the discussion, in seconds
- `discussionEndTimes`
    - hash mapping game ID to UNIX timestamp (in seconds) when that game's discussion will end
- `games:{gameId}:votes`
    - hash mapping player ID to ID of who they voted for
- `games:{gameId}:results`
    - JSON representation of whatever getResults() returns
- `expirationTimes`
    - hash mapping game ID to UNIX timestamp (in seconds) when that game will be destroyed
- `forcedWaits`
    - hash of players that are being forced to wait (e.g. insomniac, so they can't learn about cards that were dealt. key is `{gameId}:{playerId}` and value is a UNIX timestamp in seconds. players added to this are also added to `games:{gameId}:waiting`.

Realtime DB structure
=====================

- rooms
    - {roomId} (accessible to anyone in the room)
        - host: `string` (UID of the host)
        - stage: `string` (lobby, configuration, reveal, turns, discussion, voting, results)
        - gameConfiguration
            - cardsInPlay: `string[]` (cards that were selected)
            - discussionLength: `number` (seconds)
        - capacity: `number` (max number of players)
        - players
            - {uid}
                - nick: `string` (their nickname)
                - inGame: `bool` (whether they were in the game when the host clicked start)
- playerData
    - {uid} (accessible to that player)
        - room: `string` (ID of the room they have joined)
- gameData (private)
    - {roomId}
        - assignedCards
            - {uid}: `string` (that player's initial card)
- events
    - {id} (random, chronological via .push())
        - playerId: `string`
        - roomId: `string`
        - type: `string` `<action|revelation>/<subtype>`
            - action/
                - peek: view initial card of one or more players/center positions
                - swap: swap two cards with no confirmation
                - rob: swap a card with your own and view the one you took
            - revelation/
                - initialCard: your initial card
                - playerRoles: which role certain players have (e.g. who are the werewolves?)
                - finalCard: your final card
        - argument: type depends on action
            - peek: `(string|number)[]`: which cards you're looking at
            - swap: `[string|number, string|number]`: the two cards you're swapping
            - rob: `string|number`: the card you're switching with your own
        - result: present for certain actions
            - for peek: `{ [string|number]: string }`: mapping of player or center position to card
            - for rob: `string`: the card you took
        - revelation: present for revelations. type depends on which type of revelation it was
            - for initialCard: `string`: your initial card
            - for playerRoles: `{ [string]: string }`: mapping of uids to cards
            - for finalCard: `string`: your final card
        - confirmed: `bool`: actions without results are immediately confirmed
