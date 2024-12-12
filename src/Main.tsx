import { Route, Router } from "@solidjs/router";
import { LevelEditor } from "./LevelEditor/LevelEditor";
import { MainMenu } from "./MainMenu/MainMenu";
import { Phone as PhoneComponent } from "./phone/Phone";
import { PreferencesContextProvider } from "./theme/PreferencesContext";

export function Main() {
  return (
    <PreferencesContextProvider>
      <Routes />
    </PreferencesContextProvider>
  )
}

const Phone = () => {

  return (
    <PhoneComponent width={800} height={1400} />
  )
}

const Routes = () => {
  return (
    <Router>
      <Route path="/" component={MainMenu} />
      <Route path="/phone" component={Phone} />
      <Route path="/phone/users/:id" component={Phone} />

      <Route path="/editor" component={LevelEditor} />
      <Route path="/editor/:id" component={LevelEditor} />
      
    </Router>
  )
}


