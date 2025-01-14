import { A, useLocation } from "@solidjs/router";
import { ComponentProps, ParentComponent } from "solid-js";
import { useGameStateManager } from "../phone/GameStateContext";
import "./Link.css";
type LinkProps = ComponentProps<typeof A>



export const Link: ParentComponent<LinkProps> = (props) => {

    const gameStateManager = useGameStateManager()
    const currentLocation = useLocation()

    return (
        <A href={props.href} class="link" onClick={() => {
            if(props.href === currentLocation.pathname) return
			const nextUser = props.href.split("/").pop()
			const nextUserId = parseInt(nextUser!)
			if(Number.isNaN(nextUserId)) return
			gameStateManager.increaseTime()
			gameStateManager.addVisitedUser(nextUserId)

        }}>
            {props.children}
        </A>
    )
}