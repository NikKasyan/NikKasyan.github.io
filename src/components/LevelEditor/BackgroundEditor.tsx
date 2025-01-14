import { Component } from "solid-js";
import { useLevelContext } from "./context/LevelContext"
import "./BackgroundEditor.css"
export const BackgroundEditor: Component = () => {
	const levelContext = useLevelContext()
	return (
		<div class="background-editor">
			<div class="text-editor">
				<h2>Intro</h2>
				<textarea value={levelContext.level.intro} onInput={(e) => levelContext.updateLevel(l => {
					l.intro = e.target.value;
				})} />
			</div>
			<div class="text-editor">
				<h2>Background</h2>
				<textarea value={levelContext.level.background} onInput={(e) => levelContext.updateLevel(l => {
					l.background = e.target.value;
				})} />
			</div>
		</div>)
}