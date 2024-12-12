import { createSignal } from "solid-js";
import { createDefaultLevel, downloadEditorLevel, parseLevel, resetEditorLevel } from "../storage";
import { useLevelContext } from "./context/LevelContext";
import { SavedLevel } from "../types/SavedLevel";
import { A } from "@solidjs/router";
import "./LevelEditorActions.css";

export const LevelEditorActions = () => {
    const { level, updateLevel} = useLevelContext()

    let [fileInput, setFileInput] = createSignal<HTMLInputElement | null>(null);
    return (
        <div class="level-editor-actions">
            <button onClick={() => (resetEditorLevel(), updateLevel(createDefaultLevel()))}>Clear Level</button>
            <button onClick={() => downloadEditorLevel(level)}>Export Level</button>
            <button onClick={() => fileInput()?.click()}>Import Level</button>
            <input style={{ display: "none" }} ref={setFileInput} type="file" id="fileInput" accept=".json" onChange={(e) => {
                const file = e.target.files?.[0]
               importLevel(file).then(level=> (resetEditorLevel(), updateLevel(createDefaultLevel()), level)).then(level => updateLevel(level))
            }} />
            <A href="/editor"><button>User List</button></A>
        </div>
    )
};


const importLevel = async (file?: File): Promise<SavedLevel> => {
    return new Promise<SavedLevel>((resolve, reject) => {
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target?.result
    
                if (typeof text === "string") {
                    try {
                        const level = parseLevel(text);
                        resolve(level)
                    } catch (e) {
                        alert("Invalid file")
                        reject(e)
                    }
                }
            }
            reader.readAsText(file)

    }})
}
