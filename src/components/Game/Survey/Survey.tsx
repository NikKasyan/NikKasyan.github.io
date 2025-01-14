import { Component, For, Show } from "solid-js"
import { State, SurveyDecision as SurveyDecisionType } from "../../../types/SavedGameState"
import { useGameStateManager } from "../phone/GameStateContext"
import "./Survey.css"
import { createStore, produce } from "solid-js/store"


export const Survey: Component<{ nextState: State }> = (props) => {
	const gameState = useGameStateManager();
	const [surveyDecisions, setSurveyDecisions] = createStore<(SurveyDecisionType | -1)[]>(Array(gameState.gameState.level.decisions.length).fill(-1))

	return (
		<div id="survey">
			<h1><Show when={props.nextState === State.RESULT}>Final </Show>Survey</h1>
			<div class="survey-content">
				<p>Based on every post you read what are your decisions?</p>
				<Show when={props.nextState === State.RESULT}>
					<p><em>This is your final decision!</em></p>
				</Show>
				<For each={gameState.gameState.level.decisions}>
					{(decision, index) => (
						<SurveyDecision nextState={props.nextState} decision={decision} onAnswer={(answer) => {
							setSurveyDecisions(produce((surveyDecisions) => {
								surveyDecisions[index()] = answer
							}))
						}} />)
					}
				</For>
				<div>
					<button onClick={() => {
						gameState.updateGameState((g) => {
							if (surveyDecisions.includes(-1)) return
							g.surveyDecisions.push(surveyDecisions as SurveyDecisionType[])
							g.state = props.nextState;
						})
					}} disabled={surveyDecisions.includes(-1)}>Submit</button>
				</div>
			</div>
		</div>
	)
}

const SurveyAnswers = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
interface SurveyDecisionProps {
	decision: string
	nextState: State
	onAnswer: (answer: number) => void
}

const SurveyDecision: Component<SurveyDecisionProps> = (props) => {
	return (
		<div class="survey-decision">
			<p>{props.decision}</p>
			<div class="survey-answers">
				<For each={SurveyAnswers}>
					{(answer, index) => (
						<Show when={props.nextState !== State.RESULT || (index() === 0 || index() === 4)}>
							<label>
								<input type="radio" name={props.decision} value={answer} onInput={() => {
									props.onAnswer(index())
								}} />
								{answer}
							</label>
						</Show>
					)}
				</For>
			</div>
		</div>
	)
}