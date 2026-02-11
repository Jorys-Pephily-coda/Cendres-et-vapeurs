import { redirect } from "react-router"
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

function Login() {

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string
        fetchLogin(username, password)
    }

    const fetchLogin = async (username: string, password: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.requires_2fa) {
                    navigate('/a2f')
                } else {
                    navigate('/dashboard', { state: { user: data.username } })
                }
                console.log('Login successful:', data)
            } else {
                console.error('Login failed:', response.statusText)
            }
        } catch (error) {
            console.error('Error during login:', error)
        }
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