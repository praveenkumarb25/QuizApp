import { useEffect, useState } from "react";

interface TimerProps {
  duration: number; // Total time in seconds
  onTimeUp: () => void; // Callback when time runs out
}

function Timer({ duration, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration); // Reset timer when a new question appears

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeUp(); // Call the function when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [duration, onTimeUp]);

  return (
    <div style={{ fontSize: "18px", fontWeight: "bold", color: timeLeft <= 5 ? "red" : "black" }}>
      ⏳ Time Left: {timeLeft}s
    </div>
  );
}

export default Timer;
