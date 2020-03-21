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
    - `lobby`, `cardSelection`, or `viewCard`.
- `games:{gameId}:cardsInPlay`
    - list of all cards in the game (incl. center)
- `games:{gameId}:assignedCards`
    - hash mapping player ID to card
- `games:{gameId}:numConfirmed`
    - number of players that have confirmed viewing their card
