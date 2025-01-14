import { ParentComponent } from "solid-js";

import "./Display.css"

export const Display: ParentComponent = (props) => {
    return (
        <div id="display">
            {props.children}
        </div>
    )
}

