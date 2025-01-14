import { A, Route, Router } from "@solidjs/router";
import { LevelEditor } from "./components/LevelEditor/LevelEditor";
import { MainMenu } from "./components/MainMenu/MainMenu";
import { Phone as PhoneComponent } from "./components/Game/phone/Phone";
import { PreferencesContextProvider } from "./theme/PreferencesContext";
import { ParentComponent } from "solid-js";
import "./Main.css"
export function Main() {
	return (
		<PreferencesContextProvider>
			<Routes />
		</PreferencesContextProvider>
	)
}

const App: ParentComponent = (props) => {
	return (<>
		<nav>
			<A href="/">MainMenu</A>
			<A href="/phone">Phone</A>
			<A href="/editor">Editor</A>
		</nav>
		{props.children}
	</>)
}
const Phone = () => {

	return (
		<PhoneComponent width={"100%"} />
	)
}

const Routes = () => {
	return (
		<Router root={App}>
			<Route path="/" component={MainMenu} />
			<Route path="/phone" component={Phone} />
			<Route path="/phone/users/:id" component={Phone} />

			<Route path="/editor" component={LevelEditor} />
			<Route path="/editor/:id" component={LevelEditor} />

		</Router>
	)
}


