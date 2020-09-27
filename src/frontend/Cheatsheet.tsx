import React from 'react';
import styled from 'styled-components';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useLocation } from 'react-router-dom';

import { ExternalLink } from './ui';

const CheatsheetContainerOuter = styled.aside<{ visible: boolean }>`
    @media (min-width: 1200px) {
        width: 33vw;
        padding-left: 1rem;
        margin-right: 1rem;
        position: relative;
    }

    @media not (min-width: 1200px) {
        position: absolute;
        right: ${props => props.visible ? '0' : 'calc(-100vw + 3rem)'};
        background-color: ${props => props.theme.colors.bg};
        width: calc(100vw - 4rem);
        padding-left: 1rem;
        transition: 250ms right;
    }

    @media (not (min-width: 1200px)) and (prefers-reduced-motion: reduce) {
        transition: none;
    }

    height: calc(100vh - 5rem);
    flex-shrink: 0;
`;

const CheatsheetContainerInner = styled.div`
    height: 100%;
    overflow: auto;
`;

const CheatsheetToggle = styled.button`
    border: none;
    background-color: transparent;
    position: absolute;
    right: calc(100% - 4.5rem);
    top: calc(50% - 0.5rem);
    color: ${props => props.theme.colors.fg};
    font-size: 1em;
    padding: 0;
    width: 10rem;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
    transform: rotate(-90deg);
    cursor: pointer;

    @media not (min-width: 1200px) {
        right: calc(100% - 4.5rem);
    }
`;

export interface CheatsheetProps {
    visible: boolean;
    setVisible: (newVisibility: boolean) => void;
}

const CheatsheetTextWrapper = styled.article`
    h3 {
        margin-bottom: -1rem;
    }
`;

export interface CheatsheetTextProps {
    setVisible?: (newVisibility: boolean) => void;
}

export const CheatsheetText = ({ setVisible }: CheatsheetTextProps) => {
    const location = useLocation();

    return (
        <CheatsheetTextWrapper>
            <h1>Cheatsheet</h1>
            {location.pathname != '/cheatsheet' && (
                <ExternalLink
                    href="/cheatsheet"
                    onClick={() => setVisible && setVisible(false)}
                >
                    View standalone
                </ExternalLink>
            )}
            <section>
                <p>
                    Roles are listed using the order of their turns in the physical game. In the
                    online version, most people complete their actions at the same time, but the
                    game behaves as if turn order were preserved (for instance, the Seer sees what
                    cards people had initially, and the Robber switches cards before the
                    Troublemaker.
                </p>
            </section>
            <section>
                <h2>Roles</h2>
                <section>
                    <h3>Werewolves</h3>
                    <p>
                        The Werewolves wake up and see who each other are. If there is only one
                        Werewolf, they choose one card in the center to look at, which they could
                        use as an alibi.
                    </p>
                </section>
                <section>
                    <h3>Minion</h3>
                    <p>
                        The Minion wakes up and sees who the Werewolves (if any) are. They win if
                        the Werewolves survive, even if the Minion is executed.
                    </p>
                </section>
                <section>
                    <h3>Masons</h3>
                    <p>
                        The Masons wake up and see who each other are. Unlike the Werewolves, they
                        are on the same team as the villagers.
                    </p>
                </section>
                <section>
                    <h3>Seer</h3>
                    <p>
                        The Seer looks at either one other player's card, or two of the cards in the
                        center.
                    </p>
                </section>
                <section>
                    <h3>Robber</h3>
                    <p>
                        The Robber switches their own card with someone else's and looks at their
                        new card.
                    </p>
                </section>
                <section>
                    <h3>Troublemaker</h3>
                    <p>
                        The Troublemaker switches two other players' cards without looking at either
                        one.
                    </p>
                </section>
                <section>
                    <h3>Drunk</h3>
                    <p>
                        The Drunk switches their own card with one of the cards in the center. This
                        game using a modified Drunk who can see the card that they took from the
                        center.
                    </p>
                </section>
                <section>
                    <h3>Insomniac</h3>
                    <p>
                        The Insomniac wakes up at the end and looks at their own card.
                    </p>
                </section>
                <section>
                    <h3>Tanner</h3>
                    <p>
                        The Tanner does not wake up during the night. They win if they are executed.
                    </p>
                </section>
                <section>
                    <h3>Hunter</h3>
                    <p>
                        The Hunter does not wake up during the night. At the end of the game, if
                        they are executed, whomever they voted for is also executed.
                    </p>
                </section>
                <section>
                    <h3>Villager</h3>
                    <p>
                        Villagers are innocent and do nothing.
                    </p>
                </section>
            </section>
            <section>
                <h2>Teams and win conditions</h2>
                <p>
                    Win conditions are based on the card that each player has at the end of the
                    game. For instance, consider a player who starts with the Tanner card but
                    whose card is switched with a Werewolf card without their knowledge. If they
                    still think they are the Tanner, and convince the other players to execute
                    them, they will lose as they are now a Werewolf and their goal is to avoid
                    being executed.
                </p>
                <section>
                    <h3>Werewolves</h3>
                    <p>
                        The Werewolf team consists of any Werewolves and the Minion, if present.
                        Usually, their goal is to ensure that no one with a Werewolf card is
                        executed. If so, they win. Note that the Minion can be executed and
                        still win as long as no Werewolves were executed. The only exception is
                        when no one has a Werewolf card at the end. In this case, the Minion has
                        to avoid being killed to win.
                    </p>
                </section>
                <section>
                    <h3>Tanner</h3>
                    <p>
                        The Tanner is on their own team. The Tanner wins if they are executed.
                        This condition overrules all others; for instance, if the Tanner is
                        executed, no Werewolves can win, even if all Werewolves survived.
                    </p>
                </section>
                <section>
                    <h3>Villagers</h3>
                    <p>
                        The Villager team consists of players with any card except the Werewolf,
                        Minion, or Tanner. They win as long as:
                    </p>
                    <ul>
                        <li>they did not execute a Tanner</li>
                        <li>if there is a Werewolf: at least one Werewolf was executed</li>
                        <li>
                            if there is a Minion but no Werewolves: the Minion was executed
                        </li>
                        <li>
                            if there are neither Werewolves nor a Minion: no one was
                            executed
                        </li>
                    </ul>
                </section>
            </section>
        </CheatsheetTextWrapper>
    );
};

export default function Cheatsheet({ visible, setVisible }: CheatsheetProps) {
    return (
        <CheatsheetContainerOuter visible={visible}>
            <CheatsheetContainerInner>
                <CheatsheetToggle
                    onClick={() => setVisible(!visible)}
                    title={`${visible ? 'Hide' : 'Show'} cheatsheet`}
                >
                    {visible ? <MdExpandMore /> : <MdExpandLess />}
                    &nbsp;Cheatsheet&nbsp;
                    {visible ? <MdExpandMore /> : <MdExpandLess />}
                </CheatsheetToggle>
                <CheatsheetText setVisible={setVisible} />
            </CheatsheetContainerInner>
        </CheatsheetContainerOuter>
    );
}
