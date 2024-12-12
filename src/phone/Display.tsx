import { ParentComponent } from "solid-js";



export const Display: ParentComponent = (props) => {
    return (
        <div id="display" style={{
            width: "100%",
            height: "calc(100% - 30px)",
            "background-color": "white",
        }}>
            {props.children}
        </div>
    )
}

