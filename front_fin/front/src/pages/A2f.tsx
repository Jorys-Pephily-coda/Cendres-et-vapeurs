import { fetch2FA } from "../service/Auth"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

function A2f() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setUser } = useAuth()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    
    const username = location.state?.username
    
    if (!username) {
        navigate('/login')
        return null
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setLoading(true)
        
        const formData = new FormData(event.currentTarget)
        const code = formData.get('code') as string
        
        try {
            await fetch2FA(username, code, navigate, setError, setUser)
        } catch (err) {
            setError('Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="a2f">
            <h1>Vérification 2FA</h1>
            <p>Un code a été envoyé à votre email</p>
            <p>Utilisateur: <strong>{username}</strong></p>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '10px', padding: '10px', border: '1px solid red' }}>
                    {error}
                </div>
            )}
            
            <form className="a2f-form" onSubmit={handleSubmit}>
                <label htmlFor="code">Code de vérification :</label>
                <input 
                    type="text" 
                    id="code" 
                    name="code" 
                    required 
                    placeholder="Entrez le code à 6 chiffres"
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Vérification...' : 'Vérifier'}
                </button>
            </form>
        </div>
    )
}

export default A2f