"use client"

import { useState, useEffect } from "react"
import SpinWheel from "@/components/spin-wheel"
import AdminLoginModal from "@/components/admin-login-modal"
import AdminView from "@/components/admin-view"
import Footer from "@/components/footer"
import { hasCookie, setCookie, saveResultToMongoDB } from "@/lib/utils"
import { Moon, Star, Gift } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function Home() {
  const [prize, setPrize] = useState<number | null>(null)
  const [hasSpun, setHasSpun] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [userName, setUserName] = useState("")
  const [showNameForm, setShowNameForm] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Check if user has already spun
    const spinStatus = hasCookie("hasSpun")
    setHasSpun(spinStatus)
  }, [])

  const handleSpin = () => {
    if (hasSpun || isSpinning) return
    setShowNameForm(true)
  }

  const startSpinning = async () => {
    if (hasSpun || isSpinning || !userName.trim() || isSaving) return

    // Store the name in a local variable to ensure it's captured correctly
    const currentUserName = userName.trim()

    setShowNameForm(false)
    setIsSpinning(true)

    // After 1 second, determine prize and update state
    setTimeout(() => {
      const randomValue = Math.random()
      let selectedPrize

      // 0.001% chance for 100 TK
      if (randomValue < 0.00001) {
        selectedPrize = 100
      } else {
        // Distribute other prizes evenly
        const otherPrizes = [1, 2, 5, 7, 10]
        const randomIndex = Math.floor(Math.random() * otherPrizes.length)
        selectedPrize = otherPrizes[randomIndex]
      }

      setPrize(selectedPrize)
      setHasSpun(true)
      setCookie("hasSpun", "true", 365) // Set cookie for 1 year

      // Wait for the wheel to finish spinning before showing congratulations
      setTimeout(async () => {
        setIsSpinning(false)
        setShowCongrats(true)

        // Save the result to MongoDB
        setIsSaving(true)
        try {
          const success = await saveResultToMongoDB(currentUserName, selectedPrize)
          if (!success) {
            toast({
              title: "Error",
              description: "Failed to save your result. Please try again.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error saving result:", error)
          toast({
            title: "Error",
            description: "Failed to save your result. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsSaving(false)
        }
      }, 2000)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 relative overflow-hidden flex flex-col">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-emerald-200 opacity-30 transform rotate-12">
        <Moon size={60} />
      </div>
      <div className="absolute bottom-20 right-10 text-amber-200 opacity-30 transform -rotate-12">
        <Moon size={80} />
      </div>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-amber-300 opacity-20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
          }}
        >
          <Star size={10 + Math.random() * 20} />
        </div>
      ))}

      {/* Admin login button - repositioned for mobile */}
      <button
        onClick={() => setShowAdminModal(true)}
        className="fixed bottom-4 right-4 z-20 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-md"
      >
        Admin Login
      </button>

      {/* Admin login modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLogin={() => {
          setIsAdmin(true)
          setShowAdminModal(false)
        }}
      />

      <div className="flex-grow">
        <div className="max-w-[600px] mx-auto pt-8 pb-16 px-4 flex flex-col items-center relative z-0">
          {/* Eid Mubarak Banner */}
          <div className="w-full mb-8 text-center">
            <div className="inline-block bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-transparent bg-clip-text">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 font-arabic">Eid Mubarak</h1>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              <Moon size={20} className="text-amber-500" />
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-700">Eid Salami Spin Wheel</h2>
          </div>

          {/* Card container */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-amber-100">
            <div className="flex flex-col items-center">
              <SpinWheel isSpinning={isSpinning} prize={prize} />

              {!showNameForm && !isSpinning && !showCongrats && !hasSpun && (
                <button
                  onClick={handleSpin}
                  className="mt-8 px-8 py-3 rounded-full text-white font-bold transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-md"
                >
                  Spin the Wheel
                </button>
              )}

              {hasSpun && !showNameForm && !isSpinning && !showCongrats && (
                <div className="mt-8 text-xl font-bold text-center text-gray-500">You already spun!</div>
              )}

              {showNameForm && (
                <div className="mt-6 w-full max-w-[300px] animate-fadeIn">
                  <div className="mb-4">
                    <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                      Enter your name to spin the wheel:
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <button
                    onClick={startSpinning}
                    disabled={!userName.trim() || isSaving}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 ${
                      !userName.trim() || isSaving
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-md"
                    }`}
                  >
                    {isSaving ? "Saving..." : "Start Spinning"}
                  </button>
                </div>
              )}

              {isSpinning && (
                <div className="mt-8 text-xl font-bold text-center text-emerald-700 animate-pulse">Spinning...</div>
              )}

              {showCongrats && prize !== null && (
                <div className="mt-6 flex flex-col items-center animate-fadeIn">
                  <div className="flex items-center justify-center mb-2">
                    <Gift className="text-amber-500 mr-2" size={24} />
                    <span className="text-amber-500 font-bold">Eid Salami</span>
                  </div>
                  <div className="text-center bg-amber-50 px-6 py-4 rounded-lg border border-amber-200 w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-emerald-700 mb-2">
                      Congratulations, {userName}!
                    </h3>
                    <p className="text-lg md:text-xl">
                      You win <span className="font-bold text-amber-600">{prize} TK</span> Eid Salami
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin view */}
          {isAdmin && (
            <div className="w-full mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-amber-100 animate-fadeIn">
              <AdminView />
            </div>
          )}
        </div>
      </div>

      {/* Footer with developer credits */}
      <Footer />
    </main>
  )
}
