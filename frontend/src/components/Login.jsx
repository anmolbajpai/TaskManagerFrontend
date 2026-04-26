// import { useState } from "react";
// import "../styles/login.css";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function Login() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const response = await fetch("http://localhost:8888/taskmanager/auth/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: form.email,
//         password: form.password,
//       }),
//     });

//     const data = await response.json();

//     if (data.status) {
//       console.log("Login Success:", data);
//       toast.success(data.message || "Login successful ✅");

//       // ✅ Clear form
//       setForm({
//         email: "",
//         password: "",
//       });

//       // ✅ (Optional) Store token if backend sends it
//       localStorage.setItem("token", data.details.token);
//       localStorage.setItem("user", data.details.name); 

//       toast.success("Welcome, " + data.details.name + "!");
//       // ✅ (Optional) Redirect
//       navigate("/");

//     } else {
//       console.log("Login Failed:", data);
//       toast.error(data.message || "Login failed ❌");
//     }

//   } catch (error) {
//     console.error("Error:", error);
//     toast.error("Something went wrong ❌");
//   }
// };

//   return (
//     <div className="login-container">
//       <ToastContainer position="top-right" autoClose={2000} />
//       <div className="login-card">
//         <h2>Login</h2>

//         <form onSubmit={handleSubmit}>
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
//             placeholder="Enter password"
//             value={form.password}
//             onChange={(e) =>
//               setForm({ ...form, password: e.target.value })
//             }
//             required
//           />

//           <button type="submit">Login</button>
//         </form>

//         <p>
//             Don't have an account? 
//             <Link to="/signup">Sign Up</Link>
//         </p>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import "../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8888/taskmanager/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.status) {
        toast.success(data.message || "Login successful ✅");

        localStorage.setItem("token", data.details.token);
        localStorage.setItem("user", data.details.name);

        setForm({ email: "", password: "" });

        toast.success("Welcome, " + data.details.name + " 👋");

        navigate("/");
      } else {
        toast.error(data.message || "Login failed ❌");
      }

    } catch  {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="login-card">

        {/* LEFT PANEL */}
        <div className="login-left">
          <h1>TaskManager</h1>
          <p>Welcome back! Manage your tasks efficiently 🚀</p>

          <ul>
            <li>✔ Track your work</li>
            <li>✔ Stay organized</li>
            <li>✔ Boost productivity</li>
          </ul>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
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
                placeholder="Enter password"
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p>
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>

      </div>
    </div>
  );
}