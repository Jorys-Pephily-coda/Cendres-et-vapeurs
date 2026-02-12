const API_URL = 'http://localhost:8000/api/contact/send/';

export const sendContactMessage = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi du message');
    }

    return response.json();
};
