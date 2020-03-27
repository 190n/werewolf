import { Player } from './WerewolfState';

export function getPlayersFromRevelation(r: string, players: Player[]): Player[] {
    return r.split(',').map(id => players.find(p => p.id == id)).filter(p => p !== undefined) as Player[];
}
