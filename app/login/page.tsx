import { login, signup } from './actions';
import './LoginPage.css';

export default function LoginPage() {
  return (
    <div className="login-container">
      <form className="login-form">
        <h2>Login or Signup</h2>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
        </div>
        <div className="button-group">
          <button onClick={login}>Log in</button>
          <button onClick={signup}>Sign up</button>
        </div>
      </form>
    </div>
  );
}
