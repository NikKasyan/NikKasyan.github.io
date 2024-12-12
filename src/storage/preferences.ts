
export type Preferences = {
    theme: "light" | "dark" | "system";
} 
const PREFERENCES_STORAGE_KEY = "preferences"

export const savePreferences = (preferences: Preferences) => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}

export const loadPreferences = (): Preferences => {
    const savedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    return savedPreferences ? JSON.parse(savedPreferences) : { theme: "system" }
}


