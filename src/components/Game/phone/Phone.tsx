import { Component, JSX, Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { getSavedGameState } from "../../../storage";
import { SavedGameState, State } from "../../../types/SavedGameState";
import { Intro } from "../Intro/Introx";
import { Result } from "../Result/Result";
import { Survey } from "../Survey/Survey";
import { YApp } from "../Y/YApp";
import { Display } from "./Display";
import { GameStateManagerContextProvider } from "./GameStateContext";
import "./Phone.css";
import { StatusBar } from "./StatusBar";
interface DisplayProps {
	width?: string;
	height?: string;
}

export const Phone: Component<DisplayProps> = ({ width, height }) => {
	const style: JSX.CSSProperties = {
		width: width ? width : "100%",
		height: height ? height : "100%",
		"max-width": "800px",
		"border-radius": "10px",
		"flex-grow": "1",
	}
	const [gameState, setGameState] = createStore<SavedGameState>(getSavedGameState())
	const state = () => gameState.state

	return (
		<GameStateManagerContextProvider gameState={gameState} setGameState={setGameState}>
			<div class="game">
				<Switch>
					<Match when={state() === State.INTRO}>
						<Intro />
					</Match>
					<Match when={state() === State.GAME}>
						<main id="phone" style={style}>
							<StatusBar />
							<Display>
								<YApp />
							</Display>
						</main>
					</Match>
					<Match when={state() === State.SURVEY}>
						<Survey nextState={State.GAME} />
					</Match>
					<Match when={state() === State.DECISION}>
						<Survey nextState={State.RESULT} />
					</Match>
					<Match when={state() === State.RESULT}>
						<Result />
					</Match>


				</Switch>
			</div>
		</GameStateManagerContextProvider>
	)
}