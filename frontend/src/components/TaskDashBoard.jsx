import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TaskDashBoard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const PRIORITIES = [ "HIGH", "MEDIUM", "LOW"];

const PRIORITY_CONFIG = {
  HIGH: { label: "HIGH", dot: "orange", badge: "badge-high" },
  MEDIUM: { label: "MEDIUM", dot: "blue", badge: "badge-medium" },
  LOW: { label: "LOW", dot: "green", badge: "badge-low" },
};

const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
const API = import.meta.env.VITE_API_URL;

export default function TaskDashboard() {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: "", priority: "medium" });
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [editTask, setEditTask] = useState(null); // current editing task
const [showEdit, setShowEdit] = useState(false);


  const deleteTask = async (taskId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API}/taskmanager/tasks/deleteTask/${taskId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": token
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success("Task deleted successfully!");

  } catch (error) {
    console.error("Delete Error:", error);
    toast.error("Failed to delete task!");
  }
};

  const fetchTasks = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API}/taskmanager/tasks/getTasks`, {
      method: "GET",
      headers: {
        "Authorization": token, 
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    console.log("API DATA:", data);

  
    const formattedTasks = data.map(item => ({
      id: item.id,
      name: item.task,
      priority: item.priority, 
      created: item.duedatetime, 
      done: item.done
    }));

    setTasks(formattedTasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

  useEffect(() =>{
    
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);
    const token = localStorage.getItem("token");
    setToken(token);
    fetchTasks();
  },[]);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

const filtered = useMemo(() => {
  let list = [...tasks];

  if (activeFilter === "done") {
    list = list.filter(t => t.done === true);
  } 
  else if (activeFilter !== "ALL") {
    list = list.filter(t => t.priority === activeFilter);
  }

  return list.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}, [tasks, activeFilter]);

const addTask = async () => {
  const token = localStorage.getItem("token");

  setAdding(true);
  if(!token){
    toast.error("Please login to add tasks!");
    setAdding(false);
    return;
  }
  
  if(!newTask.name ){
    toast.error("Please enter task ");
    setAdding(false);
    return;
  }
  if(newTask.created && new Date(newTask.created) < new Date()){
    toast.error("Due date/time cannot be in the past!");
    setAdding(false);
    return;
  }
  if(!newTask.created){
    toast.error("Please select due date/time!");
    setAdding(false);
    return;
  }


  try {
    const response = await fetch(`${API}/taskmanager/tasks/add`, {
      method: "POST",
      headers: {
        "Authorization": token, 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        task: newTask.name,
        duedatetime:new Date(newTask.created).toISOString()
      })
    });

  
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }
    toast.success("Task added successfully!");

  } catch (error) {
    console.error("API Error:", error);
    toast.error("Failed to add task!");
  }
  setNewTask({ name: "", priority: "medium", created: "" });
  setAdding(false);
  await fetchTasks();
};

const updateTask = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API}/taskmanager/tasks/edit/${editTask.id}`,
      {
        method: "PUT",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newTask: editTask.name,
          newDuedatetime: new Date(editTask.created).toISOString(),
          newPriority: editTask.priority.toUpperCase() // 👈 IMPORTANT
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Update failed");
    }

    setShowEdit(false);
    await fetchTasks(); // refresh UI
    toast.success("Task updated successfully!");

  } catch (error) {
    console.error("Update Error:", error);
    toast.error("Failed to update task!");
  }
};

const toggleTask = async (taskId, currentDone) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API}/taskmanager/tasks/toggleDone/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          done: !currentDone 
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to toggle task");
    }

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, done: !currentDone }
          : task
      )
    );

  } catch (error) {
    console.error("Toggle Error:", error);
    toast.error("Failed to toggle task!");
  }
};

return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={2000} />

      {showEdit && (
        <div className="edit-modal"
        onClick={() => setShowEdit(false)}>
          <div className="edit-box"
          onClick={(e) => e.stopPropagation()}>
            <h3>Edit Task</h3>

            <input
              value={editTask.name}
              onChange={e =>
                setEditTask({ ...editTask, name: e.target.value })
              }
            />

            <select
              value={editTask.priority}
              onChange={e =>
                setEditTask({ ...editTask, priority: e.target.value })
              }
            >
              {PRIORITIES.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <DatePicker
              // selected={editTask.created ? new Date(editTask.created).toLocaleString("en-IN"): null}  
              selected={editTask.created ? new Date(editTask.created).toISOString() : null}
              onChange={(date) =>
                setEditTask({ ...editTask, created: date })
              }
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select date & time"
              className="custom-date"
            />

            <button onClick={updateTask}>Update</button>
            <button onClick={() => setShowEdit(false)}>Cancel</button>
          </div>
        </div>
      )}

      <header className="topbar">
        <h2>TaskManager</h2>

        <div className="right-section">
          <span className="username">
            {token ? user : "Guest"}
          </span>

          {token ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login/Signup</button>
            </>
          )}
        </div>
      </header>

      <main className="main">
        <h1>My Tasks</h1>

        {/* Add Task */}
        <div className="add-card">
          <input
            placeholder="Task name"
            value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
          />
              <DatePicker
                selected={newTask.created ? new Date(newTask.created).toISOString(): null}  
                onChange={(date) =>
                  setNewTask({ ...newTask, created: date })
                }
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Select date & time"
                className="custom-date"
              />

          <button onClick={addTask} disabled={adding}>
            {adding ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          {["ALL","done", ...PRIORITIES].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="task-list">
          {filtered.map(task => (
            <div key={task.id} 
            className={`task-card ${task.done ? "task-done" : ""}`}>
            {/* className="task-card"> */}

              {/* ✅ CHECKBOX */}
              <input
                type="checkbox"
                checked={task.done === true}
                onChange={() => toggleTask(task.id, task.done)}
              />
              <div className={`dot ${task.priority}`} />
              <div className="task-info">
                <p className={task.done ? "completed" : ""}>{task.name}</p>
                <span>{new Date(task.created).toLocaleString("en-IN")}</span>
              </div>
              <span className={`badge ${PRIORITY_CONFIG[task.priority].badge}`}>
                {task.priority}
              </span>
              <button
                className="edit-btn"
                onClick={() => {
                  setEditTask(task);
                  setShowEdit(true);
                }}
              >
                ✏️
              </button>
              {/* 🔥 DELETE BUTTON */}
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
