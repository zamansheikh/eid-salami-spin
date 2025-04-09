"use client"

import type React from "react"

import { useState } from "react"
import { saveResult } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface UserFormProps {
  prize: number
}

export default function UserForm({ prize }: UserFormProps) {
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim()) {
      saveResult(name, prize)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-center border border-emerald-200 animate-fadeIn flex flex-col items-center">
        <CheckCircle className="mb-2 text-emerald-500" size={28} />
        <p className="font-medium">Thank you for participating!</p>
        <p className="text-sm text-emerald-600 mt-1">Your prize has been recorded.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 w-full max-w-[300px] animate-fadeIn">
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
          Enter your name to claim your prize:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-md transition-all transform hover:scale-105 active:scale-95"
      >
        Claim Prize
      </button>
    </form>
  )
}
