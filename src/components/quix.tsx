import { useEffect, useState } from "react";
import axios from "axios";
import { Question } from "../type";
import Timer from "./Timer"; // Import Timer component

interface QuizProps {
  theme: string;
}

function Quiz({ theme }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizActive, setQuizActive] = useState(true);
  const [score, setScore] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  // Fetch new set of questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post<Question[]>(
        "http://localhost:5001/api/get-questions",
        {
          topic: "General Knowledge",
          difficulty: "medium",
        }
      );
      setQuestions(response.data);
      setCurrentIndex(0);
      setSelectedOption(null);
      setTimerKey((prevKey) => prevKey + 1); // Reset timer for new questions
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
    setLoading(false);
  };

  // Fetch questions when the component mounts
  useEffect(() => {
    fetchQuestions();
  }, []);

  if (!quizActive) return <h2>Quiz Ended. Your Final Score: {score}</h2>;
  if (loading) return <h2>Loading questions...</h2>;
  if (questions.length === 0) return <h2>No questions available.</h2>;

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (option === currentQuestion.answer) {
      setScore((prevScore) => prevScore + 1);
    }
    setTimeout(handleNext, 500); // Move to next question after a short delay
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setTimerKey((prevKey) => prevKey + 1); // Reset timer for next question
    } else {
      fetchQuestions(); // Get new quiz set after finishing current one
    }
  };

  const handleTimeUp = () => {
    handleNext(); // Move to the next question when time runs out
  };

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      {/* Live Score Display */}
      <div style={{ position: "absolute", top: "10px", right: "20px", fontSize: "20px", fontWeight: "bold" }}>
        Score: {score}
      </div>

      {/* Timer Component */}
      <Timer key={timerKey} duration={10} onTimeUp={handleTimeUp} />

      <h2>{currentQuestion.question}</h2>
      <ul>
        {currentQuestion.options.map((option, index) => (
          <li key={index}>
            <button
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null}
              style={{
                backgroundColor:
                  selectedOption === option
                    ? option === currentQuestion.answer
                      ? "green"
                      : "red"
                    : theme === "dark"
                    ? "#333"
                    : "white",
                color: selectedOption === option || theme === "dark" ? "white" : "black",
                cursor: selectedOption === null ? "pointer" : "not-allowed",
                padding: "10px",
                margin: "5px",
                border: "1px solid black",
              }}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={handleNext}
        disabled={selectedOption === null}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#007BFF",
          color: "white",
          cursor: selectedOption === null ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        Next
      </button>

      <button
        onClick={() => setQuizActive(false)}
        style={{
          marginTop: "20px",
          marginLeft: "10px",
          padding: "10px",
          backgroundColor: "red",
          color: "white",
          cursor: "pointer",
          border: "none",
        }}
      >
        Stop Quiz
      </button>

      {/* Refresh Quiz Button */}
      <button
        onClick={fetchQuestions}
        style={{
          marginTop: "20px",
          marginLeft: "10px",
          padding: "10px",
          backgroundColor: "orange",
          color: "white",
          cursor: "pointer",
          border: "none",
        }}
      >
        Refresh Quiz
      </button>
    </div>
  );
}

export default Quiz;
