"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import axios from "axios"

export default function Home() {
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const handleSearch = async () => {
    try {
      const response = await axios.post("/api/search", { query })
      setResult(response.data.result)
      setError("")
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred")
      setResult("")
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Startup Network Finder</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
        >
          Sign out
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button onClick={handleSearch} className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700">
        Search
      </button>
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <p>{result}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

