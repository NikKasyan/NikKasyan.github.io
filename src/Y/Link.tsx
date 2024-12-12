import { A } from "@solidjs/router";
import { ComponentProps, ParentComponent } from "solid-js";
import { useGameStateManagerContext } from "../phone/GameStateContext";

type LinkProps = ComponentProps<typeof A>

export const Link: ParentComponent<LinkProps> = (props) => {

    const gameStateManager = useGameStateManagerContext()

    return (
        <A href={props.href} onClick={() => gameStateManager.updateGameState((state) => state.phone.timeInMinutes += 5)}>
            {props.children}
        </A>
    )
}