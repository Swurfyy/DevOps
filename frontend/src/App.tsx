import { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type View = "login" | "dashboard" | "order";

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
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
      setView("dashboard");
      await fetchServers();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServers = async () => {
    if (!email) return;
    setError(null);
    try {
      const res = await axios.get<{ servers: Server[] }>(
        `${API_BASE_URL}/servers`,
        {
          params: { email },
        }
      );
      setServers(res.data.servers);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to load servers");
    }
  };

  const handleOrder = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/servers/order`, {
        email,
        password,
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
        {view !== "login" && (
          <nav className="nav-links">
            <button onClick={() => setView("dashboard")}>Dashboard</button>
            <button onClick={() => setView("order")}>New Server</button>
          </nav>
        )}
      </header>

      <main className="content">
        {view === "login" && (
          <section className="card">
            <h1>Welcome to DevOps Hosting</h1>
            <p>Sign up to provision game servers automatically on our DevOps-powered platform.</p>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </label>
            <button onClick={handleRegister} disabled={isLoading}>
              {isLoading ? "Creating account..." : "Continue"}
            </button>
            {error && <p className="error">{error}</p>}
          </section>
        )}

        {view === "dashboard" && (
          <section className="card">
            <h1>Your DevOps Hosting servers</h1>
            <button onClick={fetchServers}>Refresh</button>
            {servers.length === 0 && (
              <p>You have no servers yet. Click “New Server” to order one.</p>
            )}
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


