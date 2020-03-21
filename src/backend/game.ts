export async function assignCards(
    playerIds: string[],
    cards: string[],
    assign: (playerId: string, card: string) => Promise<void>,
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
}

export function getInitialRevealedInformation(
    playerId: string,
    assignedCards: { [id: string]: string },
): string {
    const thisCard = assignedCards[playerId];

    if (thisCard == 'werewolf' || thisCard == 'mason') {
        return Object.keys(assignedCards).filter(id => id != playerId && assignedCards[id] == thisCard).join(',');
    } else {
        return '';
    }
}
