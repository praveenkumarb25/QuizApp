import { useEffect, useState } from "react";
import Quiz from "./components/quix";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.title = "Quiz App"; // ✅ Set the title in the browser tab

    // ✅ Disable right-click
    const disableRightClick = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    document.body.classList.toggle("dark"); // Apply dark class to body
  };

  return (
    <div>
      <h1>React Quiz App</h1>
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
      <Quiz theme={theme} /> {/* Pass theme to Quiz component */}
    </div>
  );
}

export default App;
