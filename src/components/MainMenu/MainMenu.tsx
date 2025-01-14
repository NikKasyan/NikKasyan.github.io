import { useNavigate } from "@solidjs/router"
import { hasSavedGameState, resetGameState } from "../../storage"
import { LoadLevel } from "./LoadLevel"
import "./MainMenu.css"
import { ThemeSelector } from "./ThemeSelector"
export const MainMenu = () => {
    const navigate = useNavigate();
    const navigateToPhone = () => {
        navigate("/phone")
    }
    return (
        <div class="main-menu">
            <h1>Main Menu</h1>
            <div class="links">

                <button onClick={navigateToPhone} disabled={!hasSavedGameState()}>Continue</button>
                <button onClick={() => (resetGameState(), navigateToPhone())}>Start new</button>
                <p>
                    Pop the Bubble is a game about social media and opinion-forming.
                </p>
                <p>
                    The intended experience is to play the default level first before creating your own levels.
                </p>
                <LoadLevel />
                <button onClick={() => navigate("/editor")}>Create Level</button>
            </div>
            <ThemeSelector />
        </div>
    )
}