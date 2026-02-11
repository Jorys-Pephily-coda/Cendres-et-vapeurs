import { useEffect, useState } from "react"
import { fetchCommerce } from "../service/Commerce"
import '../styles/Commerce.css'

function Commerce() {
    const [commerceData, setCommerceData] = useState<any[]>([])
    useEffect(() => {
        const getCommerceData = async () => {
            const data = await fetchCommerce()
            if (data) {
                setCommerceData(data)
            }
            else{
                console.error('No commerce data received')
            }
        }
        getCommerceData()
    }, [])
    

    return (
        <div className="commerce">
            <div className="shop">
                {commerceData.length > 0 ? (
                    <ul>
                        {commerceData.map((item, index) => (
                            <li key={index}>{item.name} - {item.description}</li>
                        ))}
                    </ul>
                    ) : (
                    <p>Ya pas de panneau</p>
                )}
            </div>
        </div>
    )
}

export default Commerce