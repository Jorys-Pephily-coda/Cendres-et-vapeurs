import { useNavigate } from 'react-router-dom'
import { fetchLogin } from "../service/Auth"
import { useAuth } from '../context/AuthContext'

function Login() {
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string
        fetchLogin(username, password, navigate, setUser)
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