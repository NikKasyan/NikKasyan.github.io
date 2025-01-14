import { checkLevel, SavedLevel } from "../types/SavedLevel"
import { createRandomAvatar } from "../util/imageGenerator"

const LEVEL_STORAGE_KEY = "editor"

export const createDefaultLevel = (): SavedLevel => {
	return { background: "", intro: "", users: [], decisions: [] }
}

export const resetEditorLevel = () => {
	localStorage.removeItem(LEVEL_STORAGE_KEY)
	localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(createDefaultLevel()))
}

export const saveEditorLevel = (level: SavedLevel) => {
	localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(level))
}

export const loadEditorLevel = () => {
	const savedLevel = localStorage.getItem(LEVEL_STORAGE_KEY)
	const parsedLevel = savedLevel ? JSON.parse(savedLevel) : createDefaultLevel()
	if (parsedLevel.intro === undefined) {
		parsedLevel.intro = ""
	}
	if (parsedLevel.decisions === undefined) {
		parsedLevel.decisions = []
	}
	fillMissingProfilePictures(parsedLevel)
	return parsedLevel
}

const fillMissingProfilePictures = (level: SavedLevel) => {
	for (const user of level.users) {
		if (!user.profilePicture) {
			user.profilePicture = createRandomAvatar()
		}
		user.verified ||= false
		for (const post of user.posts) {
			if (post.timestamp === undefined) {
				post.timestamp = Date.now()
			}
		}
	}
}

export const downloadEditorLevel = (savedLevel: SavedLevel, levelName: string = "level.json") => {
	const json = JSON.stringify(savedLevel, null, 2)
	const blob = new Blob([json], { type: "application/json" })
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = levelName
	a.click()
	URL.revokeObjectURL(url)
}

export const parseLevel = (text: string): SavedLevel => {
	const level = JSON.parse(text)
	level.intro = level.intro || ""
	level.decisions = level.decisions || []
	checkLevel(level)
	return level;
}