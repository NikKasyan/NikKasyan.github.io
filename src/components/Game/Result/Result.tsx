import * as d3 from "d3";
import { Component, createEffect, createSignal, For, Match, onMount, Signal, Switch } from "solid-js";
import { usePreferences } from "../../../theme/PreferencesContext";
import { SavedGameState } from "../../../types/SavedGameState";
import { getSystemTheme } from "../../../util/systemTheme";
import { SURVEY_INTERVAL, TIME_INCREMENT, useGameStateManager } from "../phone/GameStateContext";
import { Graph } from "./Graph";
import "./Result.css";
import { unwrap } from "solid-js/store";

enum ResultState {
	BACKGROUND = "Background",
	DECISIONS = "Decisions",
	GRAPH = "Graph"
}

interface DecisionProps {
	decisions: SavedGameState["surveyDecisions"]
	questions: SavedGameState["level"]["decisions"]
}

interface BackgroundProps {
	background: string
}

interface ButtonProps {
	state: ResultState
	stateSignal: Signal<ResultState>
}


export const Result: Component = () => {

	const state = createSignal(ResultState.DECISIONS);
	const gameStateManager = useGameStateManager();

	return (
		<div class="result">
			<h1>Result</h1>
			<div class="button-group">
				<Button state={ResultState.BACKGROUND} stateSignal={state} />
				<Button state={ResultState.DECISIONS} stateSignal={state} />
				<Button state={ResultState.GRAPH} stateSignal={state} />
			</div>
			<Switch>
				<Match when={state[0]() === ResultState.DECISIONS}>
					<Decisions decisions={gameStateManager.gameState.surveyDecisions} questions={gameStateManager.gameState.level.decisions} />
				</Match>
				<Match when={state[0]() === ResultState.GRAPH}>
					<Graph level={gameStateManager.level} />
				</Match>
				<Match when={state[0]() === ResultState.BACKGROUND}>
					<Background background={gameStateManager.gameState.level.background} />
				</Match>
			</Switch>
		</div>
	)

}

const Button: Component<ButtonProps> = (props) => {
	return (
		<button
			class={props.stateSignal[0]() === props.state ? "active-button" : ""}
			onClick={() => props.stateSignal[1](props.state)}>{props.state}
		</button>
	)
}


const Decisions: Component<DecisionProps> = (props) => {
	if (props.decisions.length === 0) {
		return <div>No decisions made</div>
	}
	const gameStateManager = useGameStateManager();
	const [currentDecision, setCurrentDecision] = createSignal(0)

	const newWidth = window.innerWidth;

	const margin = { top: 10, right: 30, bottom: 30, left: 50 };
	let width = 730 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
	if (newWidth < 800) {
		width = 300 - margin.left - margin.right
		height = 300 - margin.top - margin.bottom
	}

	let theme = usePreferences().preferences.theme
	if (theme === "system") {
		theme = getSystemTheme()
	}
	const color = theme === "dark" ? "#ddd" : "#333"
	onMount(() => {

		const svg = d3.select("#decisions")
			.attr("width", width + margin.left + margin.right + 140)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				`translate(${margin.left + 100},${margin.top})`);

		svg.append("g")
			.attr("transform", `translate(0, ${height})`)
			.attr("class", "myXaxis")

		svg.append("g").attr("class", "myYaxis")
	})
	createEffect(() => {
		const d = props.decisions.map((d, i) => ({ decision: d[currentDecision()] + 1, time: i + 1 }))
		updateGraph(d, { width, height }, margin, color)
	})
	const chunkedDiscoveredUsers: number[][] = []
	for (let i = 0; i < gameStateManager.gameState.clickedUsers.length; i += SURVEY_INTERVAL / TIME_INCREMENT) {
		const chunk = gameStateManager.gameState.clickedUsers.slice(i, i + SURVEY_INTERVAL / TIME_INCREMENT)

		chunkedDiscoveredUsers.push([...new Set(chunk)])
	}
	return (
		<div class="decisions">
			<select value={currentDecision()} onChange={(e) => setCurrentDecision(parseInt(e.currentTarget.value))}>
				<For each={props.questions}>
					{(question, index) => (
						<option value={index()}>{question}</option>
					)}
				</For>
			</select>
			<svg id="decisions" />
			<div class="discovered-profiles">
				<h1>Discovered Profiles</h1>
				<For each={chunkedDiscoveredUsers}>
					{(filteredUsers, index) => (
						<DiscoveredUsers users={filteredUsers} index={index()} />
					)}
				</For>
			</div>
		</div>
	)
}

interface DiscoveredUsersProps {
	users: number[]
	index: number
}

const DiscoveredUsers: Component<DiscoveredUsersProps> = (props) => {
	const gameStateManager = useGameStateManager();
	return (
		<details open>
			<summary class="discovered-profiles-summary">
				Discovered before {props.index + 1}. decision
			</summary>
			<div class="discovered-profiles-list">
				<For each={props.users}>
					{(userId) => (
						<div class="discovered-profile">
							<img src={gameStateManager.getUser(userId).profilePicture} />
							<span>{gameStateManager.getUser(userId).name}</span>
						</div>
					)}
				</For>
			</div>
		</details>)
}

	type Margin = {
		top: number
		right: number
		bottom: number
		left: number
	}
	type Size = {
		width: number
		height: number
	}
	type Decision = {
		decision: number
		time: number
	}

	const updateGraph = (decisions: Decision[], size: Size, margin: Margin, color: string) => {
		const svg = d3.select("#decisions")
		const xTicks = Array(decisions.length).fill(0).map((_, i) => i + 1)
		const time = xTicks.length
		const newWidth = window.innerWidth;
		let dec = "decision"
		const isSmall = newWidth < 800
		if (isSmall) {
			dec = "d..."
		}

		const x = d3.scaleLinear().range([0, size.width]);
		const xAxis = d3.axisBottom(x).scale(x).tickValues(xTicks).tickFormat(d => `${d}. ${dec}`);
		const y = d3.scaleLinear().range([size.height, 0]);
		const yAxis = d3.axisLeft(y).scale(y).tickValues([1, 2, 3, 4, 5]).tickFormat(d => {
			switch (d) {
				case 1:
					return `Str${isSmall ? "." : "ongly"} Disagree`
				case 2:
					return "Disagree"
				case 3:
					return "Neutral"
				case 4:
					return "Agree"
				case 5:
					return `Str${isSmall ? "." : "ongly"} Agree`
				default:
					return ""
			}
		});

		x.domain([1, time])
		y.domain([1, 5])
		svg.selectAll(".myXaxis").transition().duration(3000).call(xAxis as any)
		svg.selectAll(".myYaxis").transition().duration(3000).call(yAxis as any)
		const u = svg.selectAll(".lineTest").data<Decision[]>([decisions], d => (d as Decision).time)
		u.enter()
			.append("path")
			.attr("class", "lineTest")
			.merge(u as any)
			.transition()
			.duration(3000)
			.attr("d", d3.line<Decision>().x(d => x(d.time) + margin.left + 100).y(d => y(d.decision) + margin.top))
			.attr("fill", "none")
			.attr("stroke", color)
			.attr("stroke-width", 8.5)
	}
	const Background: Component<BackgroundProps> = (props) => {
		return (
			<div class="background">
				{props.background}
			</div>
		)
	}