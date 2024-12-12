/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import {Main} from './Main.tsx'

const root = document.getElementById('root')

render(() => <Main />, root!)
