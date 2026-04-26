import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TaskDashboard from "./components/TaskDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;