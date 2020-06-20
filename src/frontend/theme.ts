import { theme } from '@chakra-ui/core';

const customTheme = {
    ...theme,
    fonts: {
        body: 'Inter',
        heading: 'Space Grotesk',
        mono: 'monospace',
    },
    colors: {
        ...theme.colors,
        doppelganger: '#00a0c0',
        werewolf: '#000',
        minion: '#603000',
        mason: '#805080',
        seer: '#80c000',
        robber: '#800000',
        troublemaker: '#006000',
        drunk: '#c08000',
        insomniac: '#8080ff',
        tanner: '#ff6000',
        hunter: '#808000',
        villager: '#8000c0',
    },
};

console.log(customTheme);

export default customTheme;
