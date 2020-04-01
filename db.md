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
