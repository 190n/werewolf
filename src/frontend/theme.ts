const lightTheme = {
    colors: {
        fg: '#212121',
        bg: 'white',
        lightText: 'white',
        darkText: '#212121',
        primary: '#311b92',
        gray: '#bdbdbd',
        danger: '#b71c1c',
        warning: '#fbc02d',
        lastSeconds: '#e65100',
        link: '#0277bd',
        cards: {
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
        }
    },

    fonts: {
        body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        heading: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
};

const darkTheme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        fg: '#eee',
        bg: '#181818',
        gray: '#757575',
        primary: '#512da8',
        link: '#4fc3f7',
        cards: {
            ...lightTheme.colors.cards,
            werewolf: '#424242',
        }
    },
};

export default { light: lightTheme, dark: darkTheme };
