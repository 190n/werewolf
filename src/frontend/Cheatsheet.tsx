import React from 'react';
import styled from 'styled-components';

export const CheatsheetContainer = styled.aside`
    @media (min-width: 1200px) {
        width: 33vw;
        height: calc(100vh - 5rem);
    }

    overflow: auto;
    flex-shrink: 0;
`;

export default function Cheatsheet() {
    return (
        <CheatsheetContainer>
            <h1>Cheatsheet</h1>
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
            </section>
        </CheatsheetContainer>
    );
}
