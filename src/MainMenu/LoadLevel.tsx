import { A } from "@solidjs/router";
import { Component, createSignal } from "solid-js";

export const LoadLevel: Component = () => {
    let [element, setElement] = createSignal<HTMLInputElement | null>(null);
    const loadLevel = () => {
        const input = element();
        if (input === null) {
            return;
        }
        input.click();
    }
    return (
        <>
            <A href="#" onClick={() => loadLevel()} >Load Level</A>
            <input type="file" style={{display: "none"}} ref={setElement}/>
        </>
    )
}