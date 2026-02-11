import { fetch2FA } from "../service/Auth"
import { useNavigate } from "react-router-dom"

function A2f() {

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const navigate = useNavigate()
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const code = formData.get('code') as string
        fetch2FA(username, code, navigate)
    }
    return (
        <div className="a2f">
            <h1>2FA</h1>
            <form className="a2f-form" onSubmit={handleSubmit}>
                <label htmlFor="code">Code de vérification :</label>
                <input type="text" id="code" name="code" required />
                <button type="submit">Vérifier</button>
            </form>
        </div>
    )
}

export default A2f