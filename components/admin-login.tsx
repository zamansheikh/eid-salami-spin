"use client"

import type React from "react"

import { useState } from "react"

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check hardcoded credentials
    if (username === "zaman" && password === "Zaman@321!") {
      onLogin()
      setError("")
    } else {
      setError("Incorrect username or password!")
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1 font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full max-w-[300px] p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-[300px] p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {error && <div className="text-red-600 font-medium">{error}</div>}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  )
}
