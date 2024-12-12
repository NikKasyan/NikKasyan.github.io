import { A } from "@solidjs/router"
import { LoadLevel } from "./LoadLevel"
import "./MainMenu.css"
import { ThemeSelector } from "./ThemeSelector"
export const MainMenu = () => {
    
    return (
        <div class="main-menu">
            <h1>Main Menu</h1>
            <div class="links">

                <A href="/phone">Play</A>
                <p>
                    The intended experience is to play the default level first before creating your own levels
                </p>
                <LoadLevel />
                <A href="/editor">Create Level</A>
            </div>
            <ThemeSelector />
        </div>
    )
}