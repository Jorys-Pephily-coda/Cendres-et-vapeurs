import { redirect } from "react-router"
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

function Login() {

    const navigate = useNavigate()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string
        fetchLogin(username, password)

    }

    

    return (
        <div className="login">
            <h1>Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login