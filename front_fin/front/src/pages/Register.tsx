import { fetchRegister } from "../service/Auth"
import { useNavigate } from "react-router-dom"

function Register() {

    const navigate = useNavigate()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const password_confirm = formData.get('password_confirm') as string
        fetchRegister(username, email, password, password_confirm, navigate)
    }


    return (
        <div className="page flex-center">
            <div className="panel form-container">
                <h1>Register</h1>
                <form className="register-form flex-col gap-md" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                    <label htmlFor="password_confirm">Confirm Password:</label>
                    <input type="password" id="password_confirm" name="password_confirm" required placeholder="Confirm Password" />
                    <button type="submit" className="btn-copper">Register</button>
                </form>
            </div>
        </div>
    )
}

export default Register