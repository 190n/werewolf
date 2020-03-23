export async function assignCards(
    playerIds: string[],
    cards: string[],
    assign: (playerId: string, card: string) => Promise<void>,
    assignCenter: (cards: string[]) => Promise<void>,
): Promise<void> {
    if (cards.length != playerIds.length + 3) {
        throw new Error('Wrong number of cards');
    }

    const shuffled = [...cards];

    // https://stackoverflow.com/a/6274381
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (let i = 0; i < playerIds.length; i++) {
        await assign(playerIds[i], shuffled[i]);
    }

    await assignCenter([shuffled[shuffled.length - 3], shuffled[shuffled.length - 2], shuffled[shuffled.length - 1]]);
}

export function getInitialRevelation(
    playerId: string,
    assignedCards: { [id: string]: string },
): string {
    const theirCard = assignedCards[playerId];

    if (theirCard == 'werewolf' || theirCard == 'mason') {
        return Object.keys(assignedCards).filter(id => id != playerId && assignedCards[id] == theirCard).join(',');
    } else if (theirCard == 'minion') {
        return Object.keys(assignedCards).filter(id => assignedCards[id] == 'werewolf').join(',');
    } else {
        return '';
    }
}

export function isActionLegal(
    playerId: string,
    assignedCards: { [id: string]: string },
    action: string,
): boolean {
    const theirCard = assignedCards[playerId];

    if (theirCard == 'werewolf') {
        if (Object.keys(assignedCards).filter(id => assignedCards[id] == 'werewolf').length == 1) {
            // they are the only werewolf, so they can choose a card in the middle
            return action.length == 1 && '012'.includes(action);
        } else {
            // other werewolves are present, so no action can be taken
            return action == '';
        }
    } else if (theirCard == 'seer') {
        if (action.includes(',')) {
            // trying to look at two cards? must both be in center
            const cards = action.split(',');
            return cards.length == 2 && cards[0] != cards[1] && cards.every(c => (c.length == 1 && '012'.includes(c)));
        } else {
            // trying to look at one card? must be the id of a different player
            return action != playerId && assignedCards.hasOwnProperty(action);
        }
    } else if (theirCard == 'robber') {
        // must be the id of a different player
        return action != playerId && assignedCards.hasOwnProperty(action);
    } else if (theirCard == 'troublemaker') {
        // must both be ids of different, distinct players
        const players = action.split(',');
        return players.length == 2 && players[0] != players[1] && players.every(p => (p != playerId && assignedCards.hasOwnProperty(p)));
    } else if (theirCard == 'drunk') {
        // must be a card in the center
        return action.length == 1 && '012'.includes(action);
    } else {
        // cannot take an action
        return action == '';
    }
}

export function performAction(
    playerId: string,
    assignedCards: { [id: string]: string },
    center: string[],
    action: string,
): string | boolean {
    if (!isActionLegal(playerId, assignedCards, action)) {
        return false;
    }

    const theirCard = assignedCards[playerId];

    if (theirCard == 'werewolf' && action != '') {
        // looking in center
        return center[parseInt(action)];
    } else if (theirCard == 'seer') {
        if (action.includes(',')) {
            // two in center
            const cards = action.split(',');
            return `${center[parseInt(cards[0])]},${center[parseInt(cards[1])]}`;
        }
    } else if (theirCard == 'robber') {
        // TODO: also return, in some way, a list of swaps resulting from the action
        // a swap is [string | number, string | number]
        // string = player ID, number = index into center
        // reveal the card they took
        return assignedCards[action];
    } else if (theirCard == 'troublemaker') {
        // TODO: note which cards were switched
    } else if (theirCard == 'drunk') {
        // TODO: support configuring whether modified drunk is used
        // reveal the card they took
        return center[parseInt(action)];
    }

    return true;
}
