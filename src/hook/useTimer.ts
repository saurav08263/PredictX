import {
  useEffect,
  useState,
} from "react"

export function useTimer(
  endTime: number
) {
  const getTime = () =>
    Math.max(
      0,
      Math.floor(
        (endTime - Date.now()) /
          1000
      )
    )

  const [
    remaining,
    setRemaining,
  ] = useState(getTime())

  useEffect(() => {
    const timer =
      setInterval(() => {
        setRemaining(getTime())
      }, 100)

    return () =>
      clearInterval(timer)
  }, [endTime])

  return remaining
}