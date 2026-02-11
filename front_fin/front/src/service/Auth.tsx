 import { useNavigate } from 'react-router-dom'


export const fetchLogin = async (username: string, password: string) => {
    const navigate = useNavigate()

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

export const fetchRegister = async (username: string, email: string, password: string, password_confirm: string) => {
    const navigate = useNavigate()

    try {
        const response = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, password_confirm }),
        })
        
        if (response.ok) {
            const data = await response.json()
            console.log('Registration successful:', data)
            navigate('/login')
        } else {
            console.error('Registration failed:', response.statusText)
        }
    } catch (error) {
        console.error('Error during registration:', error)
    }
}


export const fetch2FA = async (username: string, code: string) => {
    const navigate = useNavigate()

    try {
        const response = await fetch('http://localhost:8000/api/auth/verify-2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, code }),
            credentials: 'include',
        })
        
        if (response.ok) {
            const data = await response.json()
            console.log('2FA verification successful:', data)
            navigate('/dashboard', { state: { user: username } })
        } else {
            console.error('2FA verification failed:', response.statusText)
        }
    } catch (error) {
        console.error('Error during 2FA verification:', error)
    }
}
    