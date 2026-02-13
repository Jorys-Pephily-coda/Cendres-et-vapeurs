import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    if (user?.role !== 'ADMIN') {
        return <div>Accès refusé</div>;
    }

    return (
        <div className="page">
            <div className="panel">
                <h1>Dashboard Administrateur</h1>
                
                <h2>Gestion</h2>
                <ul className="flex-col gap-md">
                    <li><Link to="/dashboard/users">Gestion des Utilisateurs</Link></li>
                    <li><Link to="/dashboard/products">Gestion des Produits</Link></li>
                    <li><Link to="/dashboard/discount-codes">Gestion des Codes Promo</Link></li>
                    <li><Link to="/dashboard/orders">Gestion des Commandes</Link></li>
                </ul>
            </div>
        </div>
    );
}

export default Dashboard;