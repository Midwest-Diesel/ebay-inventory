import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { Layout } from "./Layout";
import { FormEvent, useState } from "react";
import Error from "./Error";
import { Button, Input } from "@midwest-diesel/mwd-ui";
import { getUser, loginUser } from "@/scripts/services/userService";


export default function Login() {
  const [, setUserData] = useAtom<User>(userAtom);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState(import.meta.env.VITE_PUBLIC_PASSWORD || '');
  const [loginBtnVisible, setLoginBtnVisible] = useState(true);
  const [error, setError] = useState('');

  const handleGetUser = async () => {
    const res = await getUser();
    (setUserData as any)(res);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const error = await loginUser({ username, password });
    setError(error);
    if (error) return;
    localStorage.setItem('username', username);
    setLoginBtnVisible(false);
    await handleGetUser();
    location.reload();
  };


  return (
    <Layout>
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <Input
            label="Username"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
            data-testid="username"
            required
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            data-testid="password"
            required
          />
          { loginBtnVisible && <Button type="submit" variant={['fit', 'center']} data-testid="login-btn">Submit</Button> }
        </form>
        <Error msg={error} />
      </div>
    </Layout>
  );
}
