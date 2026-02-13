import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { fetchCommerce, addToCart, voteProduct, searchProducts } from "../service/Commerce"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid, faCoins } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import loadingSound from '../assets/sounds/peak.mp3'
import '../styles/Commerce.css'
import { Link } from "react-router-dom"

function Commerce() {
    const { user } = useAuth()
    const [commerceData, setCommerceData] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const enterFullscreen = () => {
        const elem = document.documentElement
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log('Fullscreen failed:', err))
        }
    }
    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.log('Exit fullscreen failed:', err))
        }
    }

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

    const playLoadingSound = () => {
        const audio = new Audio(loadingSound)
        audio.volume = 1.0
        console.log('Tentative de lecture du son...')
        audio.play()
            .then(() => console.log('Son joué avec succès'))
            .catch(error => console.log('Audio play failed:', error))
    }

    const handleVote = async (productId: number) => {
        const result = await voteProduct(productId)
        if (result) {
            await refreshData()
        }
    }

    const refreshData = async () => {
        setLoading(true)
        enterFullscreen()
        playLoadingSound()
        const data = await fetchCommerce()
        if (data) {
            setCommerceData(data)
            setLoading(false)
            exitFullscreen()
        }
    }

    useEffect(() => {
        const getCommerceData = async () => {
            enterFullscreen()
            playLoadingSound()
            const data = await fetchCommerce()
            if (data) {
                setCommerceData(data)
                setLoading(false)
            }
            else{
                console.error('No commerce data received')
            }
            exitFullscreen()
        }
        getCommerceData()
        console.log('Commerce data:', commerceData)
    }, [])

    if (loading) {

        return <div className="loading">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj8Pqb3cB2ZoMdBhbYPlXoIjm9iYy6xmPATQ&s" alt="Loading" className="loading-image" />
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
                                <p>Price: ${product.current_price}</p>
                                <p>Stock: {product.stock}</p>
                                
                                {user && (<input 
                                    type="number" 
                                    min="1" 
                                    max={product.stock} 
                                    defaultValue="1" 
                                    className="quantity-input"
                                />)}
                                {user && (
                                    <button className="panier" onClick={() => addToCart(product.id, 1)}>Ajouter au panier</button>
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