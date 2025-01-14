import { Component, Index } from "solid-js";
import { useLevelContext } from "./context/LevelContext";
import "./Decisions.css";
export const Decisions: Component = () => {
	const levelContext = useLevelContext()
	return (
		<div class="decisions">
			<h2>Decisions</h2>
			<button onClick={() => levelContext.updateLevel(l => l.decisions.push(""))}>Add Decision</button>
			<div class="decisions-list">
				<Index each={levelContext.level.decisions}>
					{(decision, index) => (
						<div class="decision">
							<div class="text-editor">
								<h3>Decision {index + 1}</h3>
								<textarea value={decision()} onInput={(e) => {
									levelContext.updateLevel(l => {
										l.decisions[index] = e.target.value
									})
								}} />
								<button onClick={()=> {
									levelContext.updateLevel(l => {
										l.decisions.splice(index, 1)
									})
								}}>&times;</button>
							</div>
						</div>
					)}
				</Index>
			</div>
			
		</div>
	)
}

