import { observable, computed } from 'mobx';

export type Stage = 'joining' | 'lobby' | 'cardSelection' | 'viewCard' | 'wait' | 'action' | 'disconnected';

export interface Player {
    id: string;
    nick?: string;
    isLeader: boolean;
}

export default class WerewolfState {
    @observable public stage: Stage = 'joining';
    @observable public disconnectReason: string | undefined = undefined;
    @observable public players: Player[] = [];
    @observable public gameId: string = '';
    @observable public ownId: string = '';
    @observable public playerIdsInGame: string[] = [];
    @observable public cardsInPlay: string[] = [];
    @observable public ownCard: string | undefined = undefined;
    @observable public events: ['r' | 'a', string][] = [];

    @computed public get me(): Player | undefined {
        return this.players.find(p => p.id == this.ownId);
    }

    @computed public get isLeader(): boolean {
        return this.me?.isLeader ?? false;
    }

    @computed public get ownNickname(): string | undefined {
        if (this.me) {
            return this.me.nick;
        } else {
            return undefined;
        }
    }

    @computed public get playersInGame(): Player[] {
        return this.playerIdsInGame.map(id => this.players.find(p => p.id == id) as Player);
    }

    @computed public get revelations(): string[] {
        return this.events.filter(e => e[0] == 'r').map(e => e[1]);
    }

    @computed public get ownActions(): string[] {
        return this.events.filter(e => e[0] == 'a').map(e => e[1]);
    }
}

export interface StoreProps {
    store: WerewolfState;
}
