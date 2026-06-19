import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [coffees, setCoffees] = useState([]);

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/coffees"
      );

      setCoffees(response.data);
    } catch (error) {
      console.error("Error fetching coffees:", error);
    }
  };

  const voteCoffee = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:5000/vote/${id}`
      );

      fetchCoffees();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const coffeeImages = {
    "Ethiopian Yirgacheffe":
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    "Sumatra Mandheling":
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    "Cold Brew Nitro":
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c",
    "Vanilla Latte":
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
  };

  return (
    <div className="container">
      <div className="header">
        <h1>☕ THE GREAT COFFEE</h1>
        <p>Rating App</p>
      </div>

      {[...coffees]
        .sort((a, b) => b.votes - a.votes)
        .map((coffee, index) => (
          <div
            className="coffee-card"
            key={coffee.id}
          >
            <div className="coffee-left">
              <img
                src={
                  coffeeImages[coffee.name] ||
                  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
                }
                alt={coffee.name}
                className="coffee-image"
              />

              <div>
                <h3>
                  #{index + 1} {coffee.name}
                </h3>

                <p
                  style={{
                    color: "#666",
                    margin: "5px 0",
                  }}
                >
                  {coffee.description}
                </p>

                <strong>
                  Votes: {coffee.votes}
                </strong>
              </div>
            </div>

            <button
              className="vote-btn"
              onClick={() =>
                voteCoffee(coffee.id)
              }
            >
              +
            </button>
          </div>
        ))}
    </div>
  );
}

export default App;