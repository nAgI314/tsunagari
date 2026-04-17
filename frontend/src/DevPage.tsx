import { type FormEvent, useEffect, useState } from "react";
import {
  createDevUser,
  deleteDevUser,
  listDevUsers,
  type DevUser,
  updateDevUser,
} from "./api";

type DraftMap = Record<string, { email: string; name: string }>;

const toDraftMap = (users: DevUser[]): DraftMap =>
  Object.fromEntries(users.map((user) => [user.id, { email: user.email, name: user.name ?? "" }]));

function DevPage() {
  const [users, setUsers] = useState<DevUser[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [googleId, setGoogleId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listDevUsers();
      setUsers(response.users);
      setDrafts(toDraftMap(response.users));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await createDevUser({
        googleId: googleId.trim(),
        email: email.trim(),
        name: name.trim() ? name.trim() : undefined,
      });
      setGoogleId("");
      setEmail("");
      setName("");
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user.");
    }
  };

  const onSave = async (userId: string) => {
    const draft = drafts[userId];
    if (!draft) return;
    setError(null);
    try {
      await updateDevUser(userId, {
        email: draft.email.trim(),
        name: draft.name.trim() ? draft.name.trim() : null,
      });
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user.");
    }
  };

  const onDelete = async (userId: string) => {
    setError(null);
    try {
      await deleteDevUser(userId);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user.");
    }
  };

  return (
    <main className="container">
      <h1>開発用 DB 操作 (/dev)</h1>
      <form className="form" onSubmit={onCreate}>
        <label>
          Google ID
          <input value={googleId} onChange={(e) => setGoogleId(e.target.value)} />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Name (optional)
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button type="submit" disabled={!googleId.trim() || !email.trim()}>
          User を追加
        </button>
      </form>

      <h2>Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && users.length === 0 && <p>ユーザーがありません。</p>}

      {users.map((user) => (
        <section key={user.id} className="dev-user-card">
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Google ID:</strong> {user.googleId}
          </p>
          <label>
            Email
            <input
              value={drafts[user.id]?.email ?? ""}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [user.id]: { ...(prev[user.id] ?? { email: "", name: "" }), email: e.target.value },
                }))
              }
            />
          </label>
          <label>
            Name
            <input
              value={drafts[user.id]?.name ?? ""}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [user.id]: { ...(prev[user.id] ?? { email: "", name: "" }), name: e.target.value },
                }))
              }
            />
          </label>
          <div className="dev-user-actions">
            <button type="button" onClick={() => void onSave(user.id)}>
              保存
            </button>
            <button type="button" className="danger" onClick={() => void onDelete(user.id)}>
              削除
            </button>
          </div>
        </section>
      ))}
    </main>
  );
}

export default DevPage;
