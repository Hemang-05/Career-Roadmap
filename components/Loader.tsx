'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

const Loader = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const angleRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const illustrations = container.querySelectorAll('.career-illustration')
    const totalItems = illustrations.length

    function mapRange(value: number, in_min: number, in_max: number, out_min: number, out_max: number) {
      return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    }

    const animate = () => {
      const radius = 220

      illustrations.forEach((illustration, index) => {
        const offset = (Math.PI * 2 / totalItems) * index
        const x = Math.cos(angleRef.current + offset) * radius
        const z = Math.sin(angleRef.current + offset) * radius
        const scale = mapRange(z, -radius, radius, 0.6, 1.2)
        const opacity = mapRange(z, -radius, radius, 0.7, 1)
        const zIndex = Math.floor(mapRange(z, -radius, radius, 1, 10))
        const el = illustration as HTMLElement
        el.style.transform = `translateX(${x}px) scale(${scale})`
        el.style.opacity = opacity.toString()
        el.style.zIndex = zIndex.toString()
      })

      angleRef.current += 0.005
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="relative w-60 h-60" ref={containerRef}>
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="career-illustration absolute transition-transform will-change-transform transform scale-75"
            style={{
              transformOrigin: 'center center',
              willChange: 'transform, opacity',
            }}
          >
            <Image
              src={`/${index + 1}.png`} // Uses the same image names
              alt={`career-${index + 1}`}
              width={index === 0 ? 150 : 180}
              height={index === 0 ? 150 : 200}
              className="object-contain"
              loading="eager"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loader
