import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TaskDashBoard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const PRIORITY_CONFIG = {
  HIGH:   { badge: "badge-high" },
  MEDIUM: { badge: "badge-medium" },
  LOW:    { badge: "badge-low" },
};

const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
const API = import.meta.env.VITE_API_URL;

export default function TaskDashboard() {
  const navigate = useNavigate();

  const [tasks,       setTasks]       = useState([]);
  const [newTask,     setNewTask]     = useState({ name: "", created: null });
  const [activeFilter,setActiveFilter]= useState("ALL");
  const [adding,      setAdding]      = useState(false);
  const [user,        setUser]        = useState(null);
  const [showMenu,    setShowMenu]    = useState(false);
  const [editTask,    setEditTask]    = useState(null);
  const [showEdit,    setShowEdit]    = useState(false);
  const [openMenu,    setOpenMenu]    = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  /* ── helpers ── */
  const formatDate = (iso) => {
    if (!iso) return "No due date";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  /* ── fetch ── */
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API}/taskmanager/tasks/getTasks`, {
        headers: { Authorization: token, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTasks(data.map(item => ({
        id:       item.id,
        name:     item.task,
        priority: item.priority,
        created:  item.duedatetime,
        done:     item.done,
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    setUser(storedUser);
    const token = localStorage.getItem("token");
    setToken(token);
    fetchTasks();
  }, []);

  /* ── add ── */
  const addTask = async () => {
    const token = localStorage.getItem("token");
    if (!token)          { toast.error("Please login to add tasks!"); return; }
    if (!newTask.name)   { toast.error("Please enter a task name!");  return; }
    if (!newTask.created){ toast.error("Please select due date/time!"); return; }
    if (new Date(newTask.created) < new Date()) {
      toast.error("Due date/time cannot be in the past!"); return;
    }

    setAdding(true);
    try {
      const res = await fetch(`${API}/taskmanager/tasks/add`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify({
          task:        newTask.name,
          duedatetime: new Date(newTask.created).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Add failed");
      toast.success("Task added successfully!");
      setNewTask({ name: "", created: null });
      await fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add task!");
    } finally {
      setAdding(false);
    }
  };

  /* ── delete ── */
  const deleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API}/taskmanager/tasks/deleteTask/${taskId}`,
        { method: "DELETE", headers: { Authorization: token } }
      );
      if (!res.ok) throw new Error("Delete failed");
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task!");
    }
  };

  /* ── update ── */
  const updateTask = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API}/taskmanager/tasks/edit/${editTask.id}`,
        {
          method: "PUT",
          headers: { Authorization: token, "Content-Type": "application/json" },
          body: JSON.stringify({
            newTask:        editTask.name,
            newDuedatetime: new Date(editTask.created).toISOString(),
            newPriority:    editTask.priority.toUpperCase(),
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      setShowEdit(false);
      await fetchTasks();
      toast.success("Task updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task!");
    }
  };

  /* ── toggle done ── */
  const toggleTask = async (taskId, currentDone) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API}/taskmanager/tasks/toggleDone/${taskId}`,
        {
          method: "PUT",
          headers: { Authorization: token, "Content-Type": "application/json" },
          body: JSON.stringify({ done: !currentDone }),
        }
      );
      if (!res.ok) throw new Error("Toggle failed");
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, done: !currentDone } : t)
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task!");
    }
  };

  /* ── logout ── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    let list = [...tasks];
    if (activeFilter === "done") {
      list = list.filter(t => t.done === true);
    } else if (activeFilter !== "ALL") {
      list = list.filter(t => t.priority === activeFilter);
    }
    return list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, activeFilter]);

  /* ── render ── */
  return (
    <div className="app" onClick={() => { setOpenMenu(null); setShowMenu(false); }}>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Edit Modal */}
      {showEdit && editTask && (
        <div className="edit-overlay" onClick={() => setShowEdit(false)}>
          <div className="edit-box" onClick={e => e.stopPropagation()}>
            <h3>Edit Task</h3>

            <input
              value={editTask.name}
              placeholder="Task name"
              onChange={e => setEditTask({ ...editTask, name: e.target.value })}
            />

            <select
              value={editTask.priority}
              onChange={e => setEditTask({ ...editTask, priority: e.target.value })}
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <DatePicker
              selected={editTask.created ? new Date(editTask.created) : null}
              onChange={date => setEditTask({ ...editTask, created: date })}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select date & time"
              className="custom-date"
            />

            <div className="edit-actions">
              <button className="btn-primary" onClick={updateTask}>Update</button>
              <button className="btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <header className="topbar">
  <h2>TaskManager</h2>

  <div className="user-menu" onClick={e => e.stopPropagation()}>
    
    <div className="avatar" onClick={() => setShowMenu(prev => !prev)}>
      {user ? user.charAt(0).toUpperCase() : "G"}
    </div>

    {showMenu && (
      <div className="dropdown">

        {user ? (
          // ✅ Logged in UI
          <>
            <p className="dropdown-name">{user}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          // ❌ Not logged in UI
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </>
        )}

      </div>
    )}
    
  </div>
</header>

      {/* Main */}
      <main className="main">
        <h1 className="page-title">My Tasks</h1>

        {/* Add Task */}
        <div className="add-card">
          <input
            placeholder="What needs to be done?"
            value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            onKeyDown={e => e.key === "Enter" && addTask()}
          />
          <DatePicker
            selected={newTask.created ? new Date(newTask.created) : null}
            onChange={date => setNewTask({ ...newTask, created: date })}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Due date & time"
            className="custom-date"
          />
          <button className="add-btn" onClick={addTask} disabled={adding}>
            {adding ? "Adding…" : "+ Add"}
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          {["ALL", "done", ...PRIORITIES].map(f => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? "filter-active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === "done" ? "✓ Done" : f}
            </button>
          ))}
        </div>

        {/* Task Count */}
        <p className="task-count">
          {filtered.length} {filtered.length === 1 ? "task" : "tasks"}
        </p>

        {/* Task List */}
        <div className="task-list">
          {filtered.length === 0 && (
            <div className="empty-state">No tasks here yet!</div>
          )}

          {filtered.map(task => (
            <div
              key={task.id}
              className={`task-card ${task.priority.toLowerCase()} ${task.done ? "task-done" : ""}`}
              onClick={() => setOpenMenu(null)}
            >
              <div className="task-top">
                <div className="task-left">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id, task.done)}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className={`task-name ${task.done ? "done-text" : ""}`}>
                    {task.name}
                  </span>
                </div>

                {/* 3-dot menu */}
                <div
                  className="menu-wrapper"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="menu-btn"
                    onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                    aria-label="Task options"
                  >
                    ⋮
                  </button>
                  {openMenu === task.id && (
                    <div className="menu-dropdown">
                      <button onClick={() => {
                        setEditTask(task);
                        setShowEdit(true);
                        setOpenMenu(null);
                      }}>
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-opt"
                        onClick={() => {
                          deleteTask(task.id);
                          setOpenMenu(null);
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom row */}
              <div className="task-bottom">
                <span className="task-date">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="1.5" style={{marginRight: 4, verticalAlign: "middle"}}>
                    <rect x="1" y="2" width="14" height="13" rx="2"/>
                    <path d="M1 6h14M5 1v3M11 1v3"/>
                  </svg>
                  {formatDate(task.created)}
                </span>
                <span className={`badge ${PRIORITY_CONFIG[task.priority]?.badge}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

