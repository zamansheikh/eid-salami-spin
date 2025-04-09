import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Cookie functions
export function setCookie(name: string, value: string, days: number) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = `${name}=`
  const ca = document.cookie.split(";")

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }

  return null
}

export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}

// Result interface
export interface Result {
  name: string
  prize: number
  timestamp: Date | number
}

// MongoDB functions
export async function saveResultToMongoDB(name: string, prize: number): Promise<boolean> {
  try {
    const response = await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, prize }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error saving result to MongoDB:", error)
    return false
  }
}

export async function getResultsFromMongoDB(): Promise<Result[]> {
  try {
    const response = await fetch("/api/results")
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching results from MongoDB:", error)
    return []
  }
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error authenticating admin:", error)
    return false
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const saveResult = async (name: string, prize: number) => {
  console.log(`Saving result: name=${name}, prize=${prize}`)
  // Placeholder function.  The real implementation would likely
  // involve an API call to persist the data.
  return true
}
