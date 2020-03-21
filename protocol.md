Werewolf game protocol
======================

Connection flow
---------------

**Everyone who connects provides a game ID _and_ player ID.**

### Leader:
1. Leader makes `POST` request to `/games`, receives a `gameId` and `playerId`.
2. Leader opens WebSocket connection to `/connect?gameId={gameId}&playerId={playerId}`. Connection is used to assign nickname and handle the rest of the game.

### Players:
1. Player makes `GET` request to `/games/{gameId}/join`, receives a `playerId` if code was valid.
2. Player opens WebSocket connection to `/connect?gameId={gameId}&playerId={playerId}`.
3. Player starts receiving informtaion about the game (current players, whether it's started, etc.) over that connection. Player also receives an ID.
4. Player chooses a nickname over the socket connection. Server acknowledges.
5. Game continues...

What if someone leaves?
-----------------------

