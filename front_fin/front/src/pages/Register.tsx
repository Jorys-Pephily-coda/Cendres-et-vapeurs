import { fetchRegister } from "../service/Auth"
import { useNavigate } from "react-router-dom"

function Register() {


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const navigate = useNavigate()
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const password_confirm = formData.get('password_confirm') as string
        fetchRegister(username, email, password, password_confirm, navigate)
    }


    return (
        <div className="register">
            <h1>Register</h1>
            <form className="register-form" onSubmit={handleSubmit}>
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