type CreateCheckoutSessionResponse = {
    id: string;
    url: string;
};

export async function createStripeCheckoutSession(params: {
    orderId: number;
    successUrl: string;
    cancelUrl: string;
}): Promise<CreateCheckoutSessionResponse> {
    const response = await fetch('http://localhost:8000/api/stripe/create-checkout-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            order_id: params.orderId,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = (errorData && (errorData.error || errorData.detail)) || `Erreur Stripe (${response.status})`;
        throw new Error(message);
    }

    const data = (await response.json()) as Partial<CreateCheckoutSessionResponse>;
    if (!data.url || typeof data.url !== 'string') {
        throw new Error("Réponse Stripe invalide: 'url' manquant");
    }

    return {
        id: String(data.id ?? ''),
        url: data.url,
    };
}
