import "./Home.css";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();
  
  console.log('User dans Home:', user);

  return (
    <div className="home">
      <fieldset className="figma-border">
        <legend className="">Home</legend>
        <h1>Bienvenue {user?.username || user?.email || user?.name || 'Utilisateur'}</h1>
      </fieldset>
    </div>
  );
}

export default Home;
