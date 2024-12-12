
export const getSystemTheme = () => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return darkModeMediaQuery.matches ? "dark" : "light";
}