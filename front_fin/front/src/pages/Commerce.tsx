import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { fetchCommerce, addToCart, voteProduct, searchProducts } from "../service/Commerce"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid, faCoins } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import '../styles/Commerce.css'
import { Link } from "react-router-dom"

function Commerce() {
    const { user } = useAuth()
    const [commerceData, setCommerceData] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")


    const handleSearch = async () => {
        if (searchQuery.trim() === "") {
            const data = await fetchCommerce()
            if (data) {
                setCommerceData(data)
            }
            return
        }
        const data = await searchProducts(searchQuery)
        if (data) {
            setCommerceData(data)
        }
    }



    const handleVote = async (productId: number) => {
        const result = await voteProduct(productId)
        if (result) {
            await refreshData()
        }
    }

    const refreshData = async () => {
        setLoading(true)
        const data = await fetchCommerce()
        if (data) {
            setCommerceData(data)
            setLoading(false)
        }
    }

    useEffect(() => {
        const getCommerceData = async () => {
            const data = await fetchCommerce()
            if (data) {
                setCommerceData(data)
                setLoading(false)
            }
            else{
                console.error('No commerce data received')
            }
        }
        getCommerceData()
        console.log('Commerce data:', commerceData)
    }, [])

    if (loading) {

        return <div className="loading">
            <img src="https://img.freepik.com/vecteurs-libre/illustration-icone-doodle-engrenage_53876-5596.jpg?semt=ais_hybrid&w=740&q=80https://cdn-icons-png.flaticon.com/512/73/73989.png" alt="Loading" className="loading-image" />
        </div>
    }
    

    return (
        <div className="commerce">
            <div className="top">
                <div className="text">
                    <h1>Bienvenue dans la forge des nains</h1>
                    <p>Fait toi plaisir petit humain mais eh faut que ton porte monnaie tienne gamin</p>
                </div>
            </div>
            <div className="search">
                <input type="text" placeholder="Rechercher un produit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                <button className="search-btn" onClick={handleSearch}>Rechercher</button>
            </div>
            <div className="shop">
                {commerceData.count > 0 ? (
                        commerceData.results.map((product: any) => (
                            <div className="product-card" key={product.id}>
                                <div className="card-top">
                                    <div className="bourse-product-btn">
                                        <Link to={`/bourse/${product.id}`} className="bourse-product-link">
                                            <FontAwesomeIcon icon={faCoins} className="coin-icon" />
                                        </Link>
                                    </div>
                                    <div className="product-name">
                                        <h3>{product.name}</h3>
                                    </div>
                                    {user && (
                                        <button 
                                            className="like-btn" 
                                            onClick={() => handleVote(product.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={product.has_voted ? faHeartSolid : faHeartRegular} 
                                                className={product.has_voted ? 'heart-filled' : 'heart-empty'}
                                            />
                                        </button>
                                    )}
                                </div>
                                <img src={product.image} alt="on est pauvre on a pas mis l'image" className="product-image" />
                                <p>{product.description}</p>
                                <p>Prix: {product.current_price} ₼</p>
                                <p>Stock: {product.stock}</p>
                                <p>Vote : {product.vote_count}</p>
                                
                                {user && product.is_active && product.stock > 0 && (<input 
                                    type="number" 
                                    min="1" 
                                    max={product.stock} 
                                    defaultValue="1" 
                                    className="quantity-input"
                                />)}
                                {user && (
                                    !product.is_active ? (
                                        <div className="product-disabled">Produit désactivé</div>
                                    ) : product.stock === 0 ? (
                                        <button className="panier" disabled>Rupture de stock</button>
                                    ) : (
                                        <button className="panier" onClick={() => addToCart(product.id, 1)}>Ajouter au panier</button>
                                    )
                                )}
                            </div>
                        ))
                    ) : (
                    <p>Ya pas de panneau</p>
                )}
            </div>
        </div>
    )
}

export default Commerce