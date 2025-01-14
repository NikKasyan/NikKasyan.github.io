import { For } from "solid-js";
import { usePreferences } from "../../theme/PreferencesContext";

export const ThemeSelector = () => {
    
    const { preferences: {theme: currentTheme}, updatePreferences} = usePreferences();

    const updateTheme = (theme: "light" | "dark" | "system") => {
        updatePreferences(preferences => {
            preferences.theme = theme;
        })
    }
    return (
        <div style={{display: "flex", "flex-direction": "row", gap: "10px"}}>
                <label style={{margin: "auto"}}>Choose Theme</label>
                <select value={currentTheme} onChange={(e) => updateTheme(e.target.value as any)}>
                    <For each={["light", "dark", "system"]}>
                        {theme => <option value={theme} selected={currentTheme === theme }>{theme}</option>}
                    </For>
                </select>
            </div>
    )
};