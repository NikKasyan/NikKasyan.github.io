import { useNavigate } from "@solidjs/router";
import { Component, createSignal } from "solid-js";
import { parseLevel, resetGameState, saveGameState } from "../../storage";
import { createDefaultGameState } from "../../types/SavedGameState";

export const LoadLevel: Component = () => {
    let [element, setElement] = createSignal<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const openFileExplorer = () => {
        const input = element();
        if (input === null) {
            return;
        }
        input.click();
    }
    return (
        <>
            <button onClick={() => openFileExplorer()} >Load custom level</button>
            <input type="file" style={{ display: "none" }} ref={setElement} onInput={(e) => (loadLevel(e).then(() => navigate("/phone")))} />
        </>
    )
}

const loadLevel = async (e: InputEvent & { target: HTMLInputElement }) => {
	return new Promise((resolve, reject) => {
		const files = e.target.files;
		if (files === null) {
			return;
		}
		const file = files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			try{
				const content = e.target?.result;
				if (typeof content !== "string") {
					return;
				}
				const level = parseLevel(content);
				resetGameState()
				const gameState = createDefaultGameState(level)
				saveGameState(gameState)
				resolve(gameState)
			}catch(e){
				alert("Invalid file")
				reject(e)
			}
			
		}
		reader.readAsText(file);
	})
   

} 
