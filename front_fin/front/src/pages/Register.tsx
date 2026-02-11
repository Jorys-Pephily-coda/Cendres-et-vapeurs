function Register() {
    return (
        <div className="register">
            <h1>Register</h1>
            <form className="register-form">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required />
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <label htmlFor="password_confirm">Confirm Password:</label>
                <input type="password" id="password_confirm" name="password_confirm" required placeholder="Confirm Password" />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Register