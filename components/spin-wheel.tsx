"use client"

import { useRef, useEffect } from "react"

interface SpinWheelProps {
  isSpinning: boolean
  prize: number | null
}

export default function SpinWheel({ isSpinning, prize }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wheelSize = typeof window !== "undefined" && window.innerWidth < 480 ? 240 : 320

  // Define segments and colors - using festive Eid colors
  const segments = [
    { value: 1, color: "#10B981" }, // Emerald
    { value: 2, color: "#F59E0B" }, // Amber
    { value: 5, color: "#047857" }, // Emerald Dark
    { value: 7, color: "#B45309" }, // Amber Dark
    { value: 10, color: "#34D399" }, // Emerald Light
    { value: 100, color: "#FCD34D" }, // Amber Light
  ]

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = wheelSize
    canvas.height = wheelSize

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2 - 10

    // Draw outer decorative ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI)
    ctx.strokeStyle = "#F59E0B"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw segments
    const segmentAngle = (2 * Math.PI) / segments.length

    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle
      const endAngle = (index + 1) * segmentAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = segment.color
      ctx.fill()

      // Add decorative pattern to segments
      ctx.save()
      ctx.globalAlpha = 0.1
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius * 0.8, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = "#FFF"
      ctx.fill()
      ctx.restore()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "white"
      ctx.font = "bold 20px Arial"
      ctx.fillText(`${segment.value} TK`, radius - 25, 5)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = "#F59E0B"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()

    // Draw pointer
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 10)
    ctx.lineTo(centerX - 15, centerY - radius + 15)
    ctx.lineTo(centerX + 15, centerY - radius + 15)
    ctx.closePath()
    ctx.fillStyle = "#047857"
    ctx.fill()
  }, [wheelSize, segments])

  // Animation effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animationId: number
    let rotation = 0
    let speed = 0
    const acceleration = 0.3
    const maxSpeed = 20
    const deceleration = 0.98

    if (isSpinning) {
      // Acceleration phase
      const animate = () => {
        // Accelerate until reaching max speed
        if (speed < maxSpeed) {
          speed += acceleration
        }

        rotation += speed
        canvas.style.transform = `rotate(${rotation}deg)`
        animationId = requestAnimationFrame(animate)
      }

      animationId = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(animationId)
      }
    } else if (prize !== null) {
      // Find the index of the prize in the segments array
      const prizeIndex = segments.findIndex((segment) => segment.value === prize)

      if (prizeIndex !== -1) {
        // Calculate the angle for this prize segment
        const segmentAngle = 360 / segments.length

        // Calculate the target rotation
        // We need to adjust this so the pointer points to the middle of the segment
        // The wheel rotates clockwise, but the segments are defined counter-clockwise
        // So we need to invert the index
        const invertedIndex = segments.length - prizeIndex

        // Calculate the target angle (middle of the segment)
        // Add extra rotations (1080 = 3 full spins) for a more dramatic effect
        // Add half a segment to point to the middle of the segment
        const targetRotation = 1080 + invertedIndex * segmentAngle - segmentAngle / 2

        // Start with a high speed
        speed = maxSpeed

        const animate = () => {
          // Apply deceleration
          speed *= deceleration

          // Add the current speed to rotation
          rotation += speed

          // If we're close to the target and speed is very low, snap to target
          if (Math.abs(targetRotation - rotation) < 5 && speed < 0.2) {
            rotation = targetRotation
            canvas.style.transform = `rotate(${rotation}deg)`
            return
          }

          canvas.style.transform = `rotate(${rotation}deg)`

          // Continue animation until speed is very low
          if (speed > 0.1) {
            animationId = requestAnimationFrame(animate)
          }
        }

        animationId = requestAnimationFrame(animate)

        return () => {
          cancelAnimationFrame(animationId)
        }
      }
    }
  }, [isSpinning, prize, segments])

  return (
    <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
      <canvas
        ref={canvasRef}
        className="transition-transform duration-300 ease-in-out"
        style={{ width: wheelSize, height: wheelSize }}
      />
      {/* Decorative elements around the wheel */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border-4 border-dashed border-amber-200 opacity-30 animate-spin-slow"></div>
      </div>
    </div>
  )
}
