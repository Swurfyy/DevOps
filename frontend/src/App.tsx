import { useState, useEffect } from "react";
import axios from "axios";
import { getToken, setToken, removeToken, getUser, setUser, isAuthenticated, User } from "./auth";

// Use environment variable or default to localhost for development
// In production, this should be set to the backend URL (e.g., http://panel.eclipsemc.be:4000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "panel.eclipsemc.be" 
    ? "http://panel.eclipsemc.be:4000" 
    : "http://localhost:4000");

// Configure axios to include token in requests
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

type View = "auth" | "dashboard" | "order";
type AuthView = "login" | "register";

interface Server {
  id: string;
  name: string;
  game: string;
  ramMb: number;
  diskMb: number;
  cpuLimit: number;
  status: string;
}

export function App() {
  const [view, setView] = useState<View>(isAuthenticated() ? "dashboard" : "auth");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUserState] = useState<User | null>(getUser());
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orderForm, setOrderForm] = useState({
    name: "",
    game: "Minecraft",
    ramMb: 2048,
    diskMb: 10240,
    cpuLimit: 100,
  });

  useEffect(() => {
    if (isAuthenticated()) {
      fetchServers();
    }
  }, []);

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setUserState(res.data.user);
      setView("dashboard");
      await fetchServers();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setUserState(res.data.user);
      setView("dashboard");
      await fetchServers();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    setUserState(null);
    setView("auth");
    setServers([]);
  };

  const fetchServers = async () => {
    if (!isAuthenticated()) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.get<{ servers: Server[] }>(
        `${API_BASE_URL}/servers`
      );
      setServers(res.data.servers);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load servers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/servers/order`, {
        ...orderForm,
      });
      setView("dashboard");
      await fetchServers();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Order failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">DevOps Hosting</div>
        {view !== "auth" && (
          <nav className="nav-links">
            {user && <span className="user-email">{user.email}</span>}
            <button onClick={() => setView("dashboard")}>Dashboard</button>
            <button onClick={() => setView("order")}>New Server</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </nav>
        )}
      </header>

      <main className="content">
        {view === "auth" && (
          <section className="card card-auth">
            <div className="card-header">
              <h1>Welcome to DevOps Hosting</h1>
              <p>Galactic-grade game server hosting, powered by DevOps.</p>
            </div>
            <div className="auth-toggle">
              <button
                className={authView === "login" ? "auth-tab active" : "auth-tab"}
                onClick={() => setAuthView("login")}
              >
                Login
              </button>
              <button
                className={authView === "register" ? "auth-tab active" : "auth-tab"}
                onClick={() => setAuthView("register")}
              >
                Register
              </button>
            </div>

            <div className="auth-body">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      authView === "login" ? handleLogin() : handleRegister();
                    }
                  }}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      authView === "login" ? handleLogin() : handleRegister();
                    }
                  }}
                />
              </label>

              {authView === "login" ? (
                <button onClick={handleLogin} disabled={isLoading || !email || !password}>
                  {isLoading ? (
                    <>
                      <span className="button-spinner"></span> Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              ) : (
                <button onClick={handleRegister} disabled={isLoading || !email || !password}>
                  {isLoading ? (
                    <>
                      <span className="button-spinner"></span> Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              )}

              {error && <p className="error">{error}</p>}
            </div>
          </section>
        )}

        {view === "dashboard" && (
          <section className="card">
            <h1>Your DevOps Hosting servers</h1>
            <div className="dashboard-header">
              <button onClick={fetchServers} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {isLoading && servers.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your servers...</p>
              </div>
            ) : servers.length === 0 ? (
              <div className="empty-state">
                <p>You have no servers yet. Click "New Server" to order one.</p>
              </div>
            ) : (
              <div className="server-list">
                {servers.map((s) => (
                  <div key={s.id} className="server-item">
                    <h2>{s.name}</h2>
                    <p>{s.game}</p>
                    <p>
                      {s.ramMb} MB RAM · {s.diskMb} MB disk · {s.cpuLimit}% CPU
                    </p>
                    <span className={`badge badge-${s.status}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {error && <p className="error">{error}</p>}
          </section>
        )}

        {view === "order" && (
          <section className="card">
            <h1>Order a DevOps Hosting server</h1>
            <label>
              Name
              <input
                type="text"
                value={orderForm.name}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, name: e.target.value })
                }
              />
            </label>
            <label>
              Game
              <select
                value={orderForm.game}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, game: e.target.value })
                }
              >
                <option value="Minecraft">Minecraft</option>
                <option value="CS2">CS2</option>
                <option value="Valheim">Valheim</option>
              </select>
            </label>
            <div className="grid">
              <label>
                RAM (MB)
                <input
                  type="number"
                  value={orderForm.ramMb}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      ramMb: Number(e.target.value),
                    })
                  }
                  min={512}
                />
              </label>
              <label>
                Disk (MB)
                <input
                  type="number"
                  value={orderForm.diskMb}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      diskMb: Number(e.target.value),
                    })
                  }
                  min={1024}
                />
              </label>
              <label>
                CPU (%)
                <input
                  type="number"
                  value={orderForm.cpuLimit}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      cpuLimit: Number(e.target.value),
                    })
                  }
                  min={10}
                />
              </label>
            </div>
            <button onClick={handleOrder} disabled={isLoading}>
              {isLoading ? "Provisioning..." : "Order server"}
            </button>
            <button
              className="secondary"
              onClick={() => setView("dashboard")}
            >
              Cancel
            </button>
            {error && <p className="error">{error}</p>}
          </section>
        )}
      </main>

      <footer className="footer">
        <span>DevOps Hosting – made by Zendé, Lucas, Daniel &amp; André</span>
      </footer>
    </div>
  );
}


