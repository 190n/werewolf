Functions required
==================

## createRoom

`{ nick: string } => void`

## joinRoom

`{ nick: string, roomId: string } => void`

## leaveRoom

`() => void`

## setNickname

`{ nick: string } => void`

or throw an error?

## startGame

`{ players: string[] } => void`

error if not host. do we need to have the players here? only makes a difference if someone joins at the last minute

## configureGame

`{ cards: string[], discussionLength: number } => void`

can keep something like `temporaryCards` in database so they can see what host is doing before game starts. or maybe have it `cards` and only host can write to it, and only if game hasn't started (rules ftw)

## confirm

`() => void`

this may also just happen as a db mutation + smart rules? works for confirming viewing your card, or the result of anything else.

SHOULD PROBABLY BE A FUNCTION, there will be some spicy logic for when there is something to confirm.

MAYBE NOT? maybe keep revelations around, treat the card you start with as one, and make them proper objects so you can set a "confirmed" flag? then maybe a db-triggered function to mirror the confirmations somewhere else? or track whether you've finished your turn separately?

## peek

`{ card: string | number } => string`

look at a card. if `card` is a string then it's a uid, otherwise it's an index into the center. if you're allowed, it returns what card it was. also store that in revelations.

how does this work with the robber? might need another one for the swap+peek

how does this work with the insomniac? it's not clearly specified whether you're looking at initial or final cards. maybe split it up? `peekInitial` / `peekFinal`?

## swap

`{ card1: string | number, card2: string | number } => void`

## identify

`{ role: string } => string[]`

returns array of uids who started with that role, if allowed. also store in revelations etc.

## vote

`{ player: string | null } => void`

casts a vote for a player (uid). pass null to vote for no one / the center

## goToLobby

`() => void`

only works if you're host
