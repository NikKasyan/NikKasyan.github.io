import { Component, JSX } from "solid-js";
import { usePreferences } from "../../theme/PreferencesContext";
import { getSystemTheme } from "../../util/systemTheme";


interface ThumbsIconProps {
    style?: JSX.CSSProperties;
}

const ThumbsIcon: Component<ThumbsIconProps> = ({ style }) => {
    const { preferences: { theme } } = usePreferences();
    let currentTheme = theme
    if (currentTheme === "system") {
        currentTheme = getSystemTheme()
    }
    return (<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={style}>

        <g id="Complete">

            <g id="thumbs-up">

                <path d="M7.3,11.4,10.1,3a.6.6,0,0,1,.8-.3l1,.5a2.6,2.6,0,0,1,1.4,2.3V9.4h6.4a2,2,0,0,1,1.9,2.5l-2,8a2,2,0,0,1-1.9,1.5H4.3a2,2,0,0,1-2-2v-6a2,2,0,0,1,2-2h3v10" fill="none" style={{
                    filter: currentTheme === "dark" ? "invert(1)" : "invert(0)",
                }} stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />

            </g>

        </g>

    </svg>)
}

export const ThumbsUpIcon = ThumbsIcon;

export const ThumbsDownIcon: Component<ThumbsIconProps> = ({ style }) => {
    return <ThumbsIcon style={{ ...style, transform: "scaleY(-1)" }} />
}