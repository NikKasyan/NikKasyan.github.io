import { createContext, onCleanup, ParentComponent, useContext } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { loadPreferences, Preferences, savePreferences } from "../storage";
import { getSystemTheme } from "../util/systemTheme";

type PreferencesContextType = {
    preferences: Preferences;
    updatePreferences: (updateFn: (preferences: Preferences) => unknown) => void;
}

export const PreferencesContextProvider: ParentComponent = (props) => {

    const [preferences, setPreferences] = createStore<Preferences>(loadPreferences());
    const preferencesContext = createPreferencesContext(preferences, setPreferences);

    updateTheme(preferences.theme);
    const onSystemChange = (e: MediaQueryListEvent) => {
        if (preferences.theme === "system") {
            if (e.matches) {
                preferencesContext.updatePreferences((pref) => pref.theme = "dark")
            } else {
                preferencesContext.updatePreferences((pref) => pref.theme = "light")
            }
        }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onSystemChange);
    onCleanup(() => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onSystemChange);
    })
    
    return (
        <PreferencesContext.Provider value={preferencesContext}>
            {props.children}
        </PreferencesContext.Provider>
    )
}

const createPreferencesContext = (preferences: Preferences, setPreferences: SetStoreFunction<Preferences>): PreferencesContextType => {
    const updatePreferences = (updateFn: (preferences: Preferences) => unknown) => {
        setPreferences(produce((pref) => {
            const themeBefore = pref.theme;
            updateFn(pref);
            savePreferences(pref);
            if (themeBefore !== pref.theme) {
                updateTheme(pref.theme);
            }
            return pref;
        }));
    }
    if(preferences.theme === "system") {
        preferences.theme = getSystemTheme();
    }
    return {
        preferences,
        updatePreferences
    }
}

const updateTheme = (theme: "light" | "dark" | "system") => {
    if(theme === "system") {
        theme = getSystemTheme();
    }
    document.documentElement.setAttribute("data-theme", theme);
}



const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error("UserContext not found")
    }
    return context;
}