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

// string means player ID
// number means index into the center
// last item is order; lower numbers are evaluated first
// first item is the player who did it
// robber = 0
// troublemaker = 1
// drunk = 2
export type Swap = [string, string | number, string | number, number];

export type CardAssignments = { [id: string]: string };
export type Center = [string, string, string];

export function executeSwaps(
    assignedCards: CardAssignments,
    center: Center,
    swaps: Swap[]
): [CardAssignments, Center] {
    console.log('=== executeSwaps ===');

    const movedCards = { ...assignedCards },
        newCenter = [...center] as Center;

    const sortedSwaps = [...swaps].sort((s1, s2) => s1[3] - s2[3]);
    for (const [_, card1, card2] of sortedSwaps) {
        const orig1 = (typeof card1 == 'string' ? movedCards[card1] : newCenter[card1]),
            orig2 = (typeof card2 == 'string' ? movedCards[card2] : newCenter[card2]);

        console.log(`switching ${card1} (${orig1}) with ${card2} (${orig2})`);

        if (typeof card1 == 'string') {
            movedCards[card1] = orig2;
        } else {
            newCenter[card1] = orig2;
        }

        if (typeof card2 == 'string') {
            movedCards[card2] = orig1;
        } else {
            newCenter[card2] = orig1;
        }
    }

    console.log('=== end of executeSwaps ===');
    return [movedCards, newCenter];
}

// doppelganger will require a list of the center as well, to handle doppelganger drunk
export function getInitialRevelation(
    playerId: string,
    assignedCards: CardAssignments,
    swaps: Swap[],
): string | undefined {
    const theirCard = assignedCards[playerId];

    if (theirCard == 'werewolf' || theirCard == 'mason') {
        return Object.keys(assignedCards).filter(id => id != playerId && assignedCards[id] == theirCard).join(',');
    } else if (theirCard == 'minion') {
        return Object.keys(assignedCards).filter(id => assignedCards[id] == 'werewolf').join(',');
    } else if (theirCard == 'insomniac') {
        if (swaps.length == 0 || !swaps.some(s => s[1] == playerId || s[2] == playerId)) {
            // card didn't move
            return theirCard;
        } else {
            // will go into another method
            const [movedCards] = executeSwaps(assignedCards, ['error', 'error', 'error'], swaps.filter(([_, c1, c2]) => (
                typeof c1 == 'string' && typeof c2 == 'string'
            )));
            return movedCards[playerId];
        }
    } else {
        return undefined;
    }
}

export function isActionLegal(
    playerId: string,
    assignedCards: CardAssignments,
    action: string,
    previousActions: string[],
): boolean {
    const theirCard = assignedCards[playerId];

    if (theirCard == 'doppelganger') {
        // must be the id of a different player, or confirming what they saw
        if (previousActions.length == 0) {
            return action != playerId && assignedCards.hasOwnProperty(action);
        } else {
            return action == '';
        }
    } else if (theirCard == 'werewolf') {
        if (previousActions.length == 0 && Object.keys(assignedCards).filter(id => assignedCards[id] == 'werewolf').length == 1) {
            // they are the only werewolf, so they can choose a card in the middle, or confirm what they saw
            return action.length == 1 && '012'.includes(action) || action == '';
        } else {
            // other werewolves are present, so no action can be taken
            return action == '';
        }
    } else if (theirCard == 'seer') {
        if (previousActions.length == 0) {
            if (action.includes(',')) {
                // trying to look at two cards? must both be in center
                const cards = action.split(',');
                return cards.length == 2 && cards[0] != cards[1] && cards.every(c => (c.length == 1 && '012'.includes(c)));
            } else {
                // trying to look at one card? must be the id of a different player
                return action != playerId && assignedCards.hasOwnProperty(action);
            }
        } else {
            // confirming what they have seen
            return action == '';
        }
    } else if (theirCard == 'robber') {
        // must be the id of a different player, or confirming what they took
        if (previousActions.length == 0) {
            return action != playerId && assignedCards.hasOwnProperty(action);
        } else {
            return action == '';
        }
    } else if (theirCard == 'troublemaker') {
        // must both be ids of different, distinct players
        if (previousActions.length == 0) {
            const players = action.split(',');
            return players.length == 2 && players[0] != players[1] && players.every(p => (p != playerId && assignedCards.hasOwnProperty(p)));
        } else {
            // troublemaker doesn't need to confirm, as they don't learn anything new after performing their action
            return false;
        }
    } else if (theirCard == 'drunk') {
        // must be a card in the center, or confirming what they took
        if (previousActions.length == 0) {
            return action.length == 1 && '012'.includes(action);
        } else {
            return action == '';
        }
    } else {
        // cannot take an action
        return action == '';
    }
}

// returned a string: action was ok; send that information to the player
// returned a bool: action was ok or not (depending on what the bool was); no new information for player
// if it returns true, that also means that player's turn is over
export type ActionResult = [
    string | boolean,
    Swap[],
];

export function performAction(
    playerId: string,
    assignedCards: CardAssignments,
    center: Center,
    action: string,
    previousActions: string[]
): ActionResult {
    if (!isActionLegal(playerId, assignedCards, action, previousActions)) {
        return [false, []];
    }

    const theirCard = assignedCards[playerId];

    if (theirCard == 'werewolf' && action != '') {
        // looking in center
        return [center[parseInt(action)], []];
    } else if (theirCard == 'seer' && action != '') {
        if (action.includes(',')) {
            // two in center
            const [card1, card2] = action.split(',');
            return [`${center[parseInt(card1)]},${center[parseInt(card2)]}`, []];
        } else {
            // one other player's card
            return [assignedCards[action], []];
        }
    } else if (theirCard == 'robber' && action != '') {
        // reveal the card they took
        return [assignedCards[action], [[playerId, playerId, action, 0]]];
    } else if (theirCard == 'troublemaker') {
        // swap 'em
        const [card1, card2] = action.split(',');
        return [true, [[playerId, card1, card2, 1]]];
    } else if (theirCard == 'drunk' && action != '') {
        // TODO: support configuring whether modified drunk is used
        // reveal the card they took
        return [center[parseInt(action)], [[playerId, playerId, parseInt(action), 2]]];
    }

    return [true, []];
}

export const dependencies: { [card: string]: string[] | undefined } = {
    werewolf: ['doppelganger'],
    minion: ['doppelganger'],
    mason: ['doppelganger'],
    seer: ['doppelganger'],
    robber: ['doppelganger'],
    drunk: ['doppelganger'],
    insomniac: ['robber', 'troublemaker', 'doppelganger'],
};

export function canTakeAction(
    playerId: string,
    assignedCards: CardAssignments,
    completedTurns: string[],
): boolean {
    const theirCard = assignedCards[playerId],
        deps: string[] | undefined = dependencies[theirCard];

    if (deps instanceof Array) {
        return deps.every(d => {
            const playerAndCard = Object.entries(assignedCards).find(([p, c]) => c == d);

            if (playerAndCard) {
                return completedTurns.includes(playerAndCard[0]);
            } else {
                return true;
            }
        });
    } else {
        return true;
    }
}

export function isTurnImmediatelyComplete(card: string): boolean {
    if (card == 'tanner' || card == 'hunter' || card == 'villager') {
        return true;
    } else {
        return false;
    }
}

export function getResults(
    assignedCards: CardAssignments,
    center: Center,
    swaps: Swap[],
    votes: { [id: string]: string }
): {
    winners: string[],
    winningTeam: string,
    executed: string[],
    finalCards: CardAssignments,
    finalCenter: Center,
} {
    // determine who is executed
    // filter out players who voted for the center
    const playersVotedFor = Object.values(votes).filter(vote => vote != ''),
        // 1. find unique values in playersVotedFor
        // 2. count occurrences of each one
        voteCounts: [string, number][] = [...new Set(playersVotedFor)].map(p => (
            [p, playersVotedFor.reduce((n, val) => val == p ? n + 1 : n, 0)]
        )),
        maxVotes = Math.max.apply(null, voteCounts.map(([p, c]) => c)),
        executed = voteCounts.filter(([p, c]) => c == maxVotes).map(([p, c]) => p),
        [finalCards, finalCenter] = executeSwaps(assignedCards, center, swaps);

    let winningTeam: string,
        winners: string[] = [];

    // handle the hunter
    for (const [player, card] of Object.entries(finalCards)) {
        if (card == 'hunter') {
            if (executed.includes(player) && votes[player]) {
                executed.push(votes[player]);
            }
        }
    }

    // did the tanner win?
    if (executed.some(p => finalCards[p] == 'tanner')) {
        console.log('case 1');
        winners = [Object.keys(finalCards).find(p => finalCards[p] == 'tanner') as string];
        winningTeam = 'tanner';

    // did anyone wake up as a werewolf?
    } else if (Object.values(finalCards).includes('werewolf')) {
        console.log('case 2');
        const werewolves = Object.keys(finalCards).filter(p => finalCards[p] == 'werewolf');

        // were any werewolves killed?
        if (werewolves.some(p => executed.includes(p))) {
            // all werewolves and minions lose
            // villagers win
            winners = Object.keys(finalCards).filter(p => !(['werewolf', 'minion', 'tanner'].includes(finalCards[p])));
            winningTeam = 'villagers';
        } else {
            // all werewolves and minions win
            // villagers lose
            winners = Object.keys(finalCards).filter(p => ['werewolf', 'minion'].includes(finalCards[p]));
            winningTeam = 'werewolves';
        }

    // did anyone wake up as the minion?
    } else if (Object.values(finalCards).includes('minion')) {
        console.log('case 3');
        // minion wins as long as they survived (and the tanner wasn't executed, but that scenario
        // has been checked by this point)
        const minion = Object.keys(finalCards).find(p => finalCards[p] == 'minion') as string;
        if (executed.includes(minion)) {
            winners = Object.keys(finalCards).filter(p => !(['werewolf', 'minion', 'tanner'].includes(finalCards[p])));
            winningTeam = 'villagers';
        } else {
            winners = [minion];
            winningTeam = 'werewolves';
        }
    } else {
        console.log('case 4');
        // tanner wasn't killed
        // no werewolves
        // no minion
        // current logic: villagers win as long as they didn't kill anyone
        if (executed.length == 0) {
            winners = Object.keys(finalCards).filter(p => finalCards[p] != 'tanner');
            winningTeam = 'villagers';
        } else {
            winningTeam = 'nobody'; // oof
        }
    }

    return { winners, winningTeam, executed, finalCards, finalCenter };
}

export function mayWait(card: string): boolean {
    return card == 'insomniac';
}
