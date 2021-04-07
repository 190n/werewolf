import { Player } from './WerewolfState';

export function getPlayersFromRevelation(r: string, playersById: Record<string, Player>): Player[] {
    return r.split(',').map(id => playersById[id]);
}
