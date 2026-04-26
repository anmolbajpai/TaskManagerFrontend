// import { useState } from "react";
// import "../styles/signup.css";
// import { Link, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function Signup() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     username: "",
    
//     email: "",
//     password: "",
//   });

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (form.password.length < 5) {
//     toast.error("Password must be at least 5 characters ❌");
//     return;
//   }

//   try {
//     const response = await fetch("http://localhost:8888/taskmanager/auth/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         username: form.username,
//         email: form.email,
//         password: form.password,
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log("Signup Success:", data);
//       toast.success("Signup successful ✅");
//       setForm({
//         username: "",
//         email: "",
//         password: "",
//       });
//       navigate("/login");
//     } else {
//       console.log("Signup Failed:", data);
//       toast.error(data.message || "Signup failed ❌");
//     }
//     } catch (error) {
//         console.error("Error:", error);
//         toast.error("Something went wrong ❌");
//     }
//     };

//   return (
//     <div className="signup-container">
//       <ToastContainer position="top-right" autoClose={2000} />
//       <div className="signup-card">
//         <h2>Sign Up</h2>

//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Full Name"
//             value={form.username}
//             onChange={(e) =>
//               setForm({ ...form, username: e.target.value })
//             }
//             required
//           />

//           <input
//             type="email"
//             placeholder="Enter email"
//             value={form.email}
//             onChange={(e) =>
//               setForm({ ...form, email: e.target.value })
//             }
//             required
//           />

//           <input
//             type="password"
//             placeholder="Enter password (At least 5 characters)"
//             value={form.password}
//             onChange={(e) =>
//               setForm({ ...form, password: e.target.value })
//             }
//             required
//           />

//           <button type="submit">Create Account</button>
//         </form>

//         <p>
//           Already have an account? <Link to="/login">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import "../styles/signup.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 5) {
      toast.error("Password must be at least 5 characters ❌");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8888/taskmanager/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Signup successful ✅");
        setForm({ username: "", email: "", password: "" });
        navigate("/login");
      } else {
        toast.error(data.message || "Signup failed ❌");
      }
    } catch {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="signup-card">

        {/* LEFT PANEL */}
        <div className="signup-left">
          <h1>TaskManager</h1>
          <p>Organize your tasks. Boost your productivity 🚀</p>

          <ul>
            <li>✔ Manage daily tasks</li>
            <li>✔ Set priorities</li>
            <li>✔ Stay productive</li>
          </ul>
        </div>

        {/* RIGHT PANEL */}
        <div className="signup-right">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 5 chars)"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}