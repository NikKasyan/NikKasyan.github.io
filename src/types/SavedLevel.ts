import { SavedUser } from "./SavedUser";

export interface SavedLevel {
    background: string;
    users: SavedUser[];
}

export const checkLevel = (level: unknown): level is SavedLevel => {
    if (!isObject(level)) {
        throw new Error("Invalid file")
    }

    if (typeof level.background !== "string") {
        throw new Error("Invalid file")
    }

    if (!hasKey(level, "users")) {
        throw new Error("Invalid file")
    }

    const users = level.users
    if (!Array.isArray(users)) {
        throw new Error("Invalid file")
    }

    for (const user of users) {
        if (typeof user !== "object" || user === null) {
            throw new Error("Invalid file")
        }
        if (typeof user.id !== "number") {
            throw new Error("Invalid file")
        }
        if (typeof user.name !== "string") {
            throw new Error("Invalid file")
        }
        if (typeof user.bio !== "string") {
            throw new Error("Invalid file")
        }
        if (!Array.isArray(user.posts)) {
            throw new Error("Invalid file")
        }
        for (const post of user.posts) {
            if (typeof post !== "object" || post === null) {
                throw new Error("Invalid file")
            }
            if (typeof post.id !== "number") {
                throw new Error("Invalid file")
            }
            if (typeof post.content !== "string") {
                throw new Error("Invalid file")
            }
            if (typeof post.posterId !== "number") {
                throw new Error("Invalid file")
            }
            if (post.replyToId !== undefined && typeof post.replyToId !== "number") {
                throw new Error("Invalid file")
            }
        }
    }
    return true
}

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null
}

const hasKey = <T extends Record<string, unknown>>(obj: T, key: keyof any): key is keyof T => {
    return key in obj
}