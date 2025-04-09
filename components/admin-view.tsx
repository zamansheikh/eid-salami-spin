"use client"

import { useState, useEffect } from "react"
import { getResultsFromMongoDB, type Result } from "@/lib/utils"
import { FileText, User, Award, Calendar, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function AdminView() {
  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getResultsFromMongoDB()
      setResults(data)
    } catch (err) {
      console.error("Error fetching results:", err)
      setError("Failed to load results. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()

    // Set up an interval to refresh results every 30 seconds
    const intervalId = setInterval(fetchResults, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const formatDate = (dateString: Date | number) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="text-emerald-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Results</h2>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 mb-4">{error}</div>}

      {isLoading && results.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin mb-4">
            <RefreshCw size={32} className="text-emerald-500" />
          </div>
          <p className="text-gray-500">Loading results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No results yet.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    <div className="flex items-center space-x-1">
                      <User size={16} />
                      <span>Name</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    <div className="flex items-center space-x-1">
                      <Award size={16} />
                      <span>Prize</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>Date</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-amber-50 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700">{result.name || "Unknown"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          result.prize >= 10
                            ? "text-amber-600"
                            : result.prize >= 5
                              ? "text-emerald-600"
                              : "text-gray-700"
                        }`}
                      >
                        {result.prize} TK
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(result.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
