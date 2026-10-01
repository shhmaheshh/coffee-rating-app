import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // ==========================================
  // Get all cafes
  // ==========================================

  useEffect(() => {
    fetchCafes();
  }, []);


  const fetchCafes = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:5000/cafes"
      );

      setCafes(response.data);

    } catch (error) {

      console.error(error);

      setError("Unable to load cafes.");

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // Get cafe details
  // ==========================================

  const fetchCafeDetails = async (cafeId) => {

    try {

      setMenuLoading(true);
      setError("");
      setAnalytics(null);

      const response = await axios.get(
        `http://127.0.0.1:5000/cafes/${cafeId}`
      );

      setSelectedCafe(response.data);

    } catch (error) {

      console.error(error);

      setError("Unable to load cafe menu.");

    } finally {

      setMenuLoading(false);

    }
  };


  // ==========================================
  // Get item details
  // ==========================================

  const fetchItemDetails = async (itemId) => {

    try {

      setItemLoading(true);
      setError("");
      setMessage("");
      setAnalytics(null);

      const response = await axios.get(
        `http://127.0.0.1:5000/items/${itemId}`
      );

      setSelectedItem(response.data);

      // Get ratings for this item
      fetchRatings(itemId);

    } catch (error) {

      console.error(error);

      setError("Unable to load item.");

    } finally {

      setItemLoading(false);

    }
  };


  // ==========================================
  // Get ratings
  // ==========================================

  const fetchRatings = async (itemId) => {

    try {

      setRatingsLoading(true);

      const response = await axios.get(
        `http://127.0.0.1:5000/items/${itemId}/ratings`
      );

      setRatings(response.data);

    } catch (error) {

      console.error(error);

      setError("Unable to load reviews.");

    } finally {

      setRatingsLoading(false);

    }
  };


  // ==========================================
  // Submit rating
  // ==========================================

  const submitRating = async () => {

    if (userRating === 0) {

      setError("Please select a rating.");

      return;
    }

    try {

      setError("");
      setMessage("");

      const response = await axios.post(
        `http://127.0.0.1:5000/items/${selectedItem.id}/ratings`,
        {
          rating: userRating,
          review: review
        }
      );

      // Update the rating shown on the page
      setSelectedItem({
        ...selectedItem,
        rating: response.data.average_rating
      });

      setMessage("Rating submitted successfully!");

      // Clear form
      setUserRating(0);
      setReview("");

      // Get updated reviews
      fetchRatings(selectedItem.id);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.error ||
        "Unable to submit rating."
      );

    }
  };


  // ==========================================
  // Get analytics
  // ==========================================

  const fetchAnalytics = async () => {

    try {

      setAnalyticsLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:5000/analytics"
      );

      setAnalytics(response.data);

      // Clear other pages
      setSelectedCafe(null);
      setSelectedItem(null);
      setRatings([]);

    } catch (error) {

      console.error(error);

      setError("Unable to load analytics.");

    } finally {

      setAnalyticsLoading(false);

    }
  };


  // ==========================================
  // Back to cafes
  // ==========================================

  const goBackToCafes = () => {

    setSelectedCafe(null);
    setSelectedItem(null);
    setRatings([]);
    setAnalytics(null);
    setUserRating(0);
    setReview("");
    setMessage("");
    setError("");

  };


  // ==========================================
  // Back to menu
  // ==========================================

  const goBackToMenu = () => {

    setSelectedItem(null);
    setRatings([]);
    setUserRating(0);
    setReview("");
    setMessage("");
    setError("");

  };


  // ==========================================
  // Loading
  // ==========================================

  if (loading) {

    return (
      <div className="container">
        <h2>Loading cafes...</h2>
      </div>
    );

  }


  // ==========================================
  // Analytics Dashboard
  // ==========================================

  if (analytics) {

    return (

      <div className="container">

        <div className="analytics-dashboard">

          {/* Dashboard Header */}

          <div className="analytics-header">

            <div>
              <h1>📊 Analytics Dashboard</h1>
              <p>
                Cafe, menu and rating insights
              </p>
            </div>

            <button
              className="back-btn"
              onClick={goBackToCafes}
            >
              ← Back to Cafes
            </button>

          </div>


          {analyticsLoading ? (

            <h2>Loading analytics...</h2>

          ) : (

            <>

              {/* ==================================
                  SUMMARY CARDS
              ================================== */}

              <div className="analytics-cards">

                <div className="analytics-card">

                  <h3>Total Cafes</h3>

                  <p>
                    {analytics.total_cafes}
                  </p>

                </div>


                <div className="analytics-card">

                  <h3>Total Items</h3>

                  <p>
                    {analytics.total_items}
                  </p>

                </div>


                <div className="analytics-card">

                  <h3>Total Reviews</h3>

                  <p>
                    {analytics.total_reviews}
                  </p>

                </div>


                <div className="analytics-card">

                  <h3>Best Item</h3>

                  <p>
                    {analytics.best_item?.name}
                  </p>

                  <span>
                    ⭐ {analytics.best_item?.rating}
                  </span>

                </div>

              </div>


              {/* ==================================
                  BEST CAFE + BEST COFFEE
              ================================== */}

              <div className="analytics-highlight">

                {/* Best Cafe */}

                <div className="highlight-card">

                  <h2>🏆 Best Cafe</h2>

                  {analytics.best_cafe ? (

                    <>
                      <h3>
                        {analytics.best_cafe.name}
                      </h3>

                      <p>
                        📍 {analytics.best_cafe.location}
                      </p>

                      <strong>
                        ⭐ {analytics.best_cafe.average_rating}
                      </strong>
                    </>

                  ) : (

                    <p>No cafe data available.</p>

                  )}

                </div>


                {/* Best Coffee */}

                <div className="highlight-card">

                  <h2>☕ Best Coffee</h2>

                  {analytics.best_coffee ? (

                    <>
                      <h3>
                        {analytics.best_coffee.name}
                      </h3>

                      <p>
                        Category:{" "}
                        {analytics.best_coffee.category}
                      </p>

                      <strong>
                        ⭐ {analytics.best_coffee.rating}
                      </strong>
                    </>

                  ) : (

                    <p>No coffee data available.</p>

                  )}

                </div>

              </div>


              {/* ==================================
                  CAFE PERFORMANCE
              ================================== */}

              <div className="analytics-section">

                <h2>☕ Cafe Performance</h2>

                {analytics.cafe_ratings.map((cafe) => (

                  <div
                    className="performance-row"
                    key={cafe.name}
                  >

                    <div>

                      <strong>
                        {cafe.name}
                      </strong>

                      <small>
                        📍 {cafe.location}
                      </small>

                    </div>

                    <div className="performance-rating">

                      ⭐ {cafe.average_rating}

                    </div>

                  </div>

                ))}

              </div>


              {/* ==================================
                  CATEGORY PERFORMANCE
              ================================== */}

              <div className="analytics-section">

                <h2>📈 Category Performance</h2>

                {analytics.category_ratings.map(
                  (category) => (

                    <div
                      className="performance-row"
                      key={category.category}
                    >

                      <div>

                        <strong>
                          {category.category}
                        </strong>

                        <small>
                          {category.item_count} items
                        </small>

                      </div>

                      <div className="performance-rating">

                        ⭐ {category.average_rating}

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* ==================================
                  RATING DISTRIBUTION
              ================================== */}

              <div className="analytics-section">

                <h2>⭐ Rating Distribution</h2>

                {analytics.rating_distribution.map(
                  (item) => {

                    const percentage =
                      analytics.total_reviews > 0
                        ? (
                            item.count /
                            analytics.total_reviews
                          ) * 100
                        : 0;

                    return (

                      <div
                        className="rating-distribution-row"
                        key={item.rating}
                      >

                        <span>
                          {item.rating} ⭐
                        </span>


                        <div className="rating-bar-container">

                          <div
                            className="rating-bar"
                            style={{
                              width: `${percentage}%`
                            }}
                          />

                        </div>


                        <strong>
                          {item.count}
                        </strong>

                      </div>

                    );

                  }
                )}

              </div>

            </>

          )}

        </div>

      </div>

    );

  }


  // ==========================================
  // Cafe list
  // ==========================================

  if (!selectedCafe) {

    return (

      <div className="container">

        <header className="header">

          <h1>☕ Cafe Explorer</h1>

          <p>
            Discover cafes, food and coffee
          </p>

        </header>


        {/* Analytics Button */}

        <button
          className="analytics-btn"
          onClick={fetchAnalytics}
        >
          📊 Analytics Dashboard
        </button>


        {error && (

          <p className="error-message">
            {error}
          </p>

        )}


        <div className="cafe-grid">

          {cafes.map((cafe) => (

            <div
              className="cafe-card"
              key={cafe.id}
            >

              <div className="cafe-image">
                ☕
              </div>


              <div className="cafe-info">

                <h2>
                  {cafe.name}
                </h2>

                <p>
                  📍 {cafe.location}
                </p>


                <button
                  className="view-btn"
                  onClick={() =>
                    fetchCafeDetails(cafe.id)
                  }
                >
                  View Menu →
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    );

  }


  // ==========================================
  // Cafe menu loading
  // ==========================================

  if (menuLoading) {

    return (

      <div className="container">

        <button
          className="back-btn"
          onClick={goBackToCafes}
        >
          ← Back
        </button>

        <h2>Loading menu...</h2>

      </div>

    );

  }


  // ==========================================
  // Item loading
  // ==========================================

  if (itemLoading) {

    return (

      <div className="container">

        <button
          className="back-btn"
          onClick={goBackToMenu}
        >
          ← Back
        </button>

        <h2>Loading item...</h2>

      </div>

    );

  }


  // ==========================================
  // Individual item page
  // ==========================================

  if (selectedItem) {

    return (

      <div className="container">

        <button
          className="back-btn"
          onClick={goBackToMenu}
        >
          ← Back to Menu
        </button>


        <div className="item-page">

          <div className="item-details-card">

            <div className="item-icon">

              {selectedItem.category === "Coffee"
                ? "☕"
                : "🍴"}

            </div>


            <h2>
              {selectedItem.name}
            </h2>


            <p className="item-category">
              {selectedItem.category}
            </p>


            <p>
              {selectedItem.description}
            </p>


            <div className="item-rating">
              ⭐ {selectedItem.rating}
            </div>


            <p>
              Available at{" "}
              <strong>
                {selectedCafe.cafe.name}
              </strong>
            </p>

          </div>


          {/* ==================================
              Rating Form
          ================================== */}

          <div className="rating-section">

            <h2>Rate this item</h2>


            <div className="star-rating">

              {[1, 2, 3, 4, 5].map((star) => (

                <button
                  key={star}
                  className={
                    star <= userRating
                      ? "star active"
                      : "star"
                  }
                  onClick={() =>
                    setUserRating(star)
                  }
                >
                  ★
                </button>

              ))}

            </div>


            <textarea
              placeholder="Write a review..."
              value={review}
              onChange={(e) =>
                setReview(e.target.value)
              }
            />


            <button
              className="submit-rating-btn"
              onClick={submitRating}
            >
              Submit Review
            </button>


            {message && (

              <p className="success-message">
                {message}
              </p>

            )}


            {error && (

              <p className="error-message">
                {error}
              </p>

            )}

          </div>


          {/* ==================================
              Reviews
          ================================== */}

          <div className="reviews-section">

            <h2>Reviews</h2>


            {ratingsLoading ? (

              <p>Loading reviews...</p>

            ) : ratings.length === 0 ? (

              <p>
                No reviews yet. Be the first to
                review this item!
              </p>

            ) : (

              ratings.map((rating) => (

                <div
                  className="review-card"
                  key={rating.id}
                >

                  <div className="review-rating">

                    {"⭐".repeat(
                      Math.round(rating.rating)
                    )}

                  </div>


                  <p>
                    {rating.review}
                  </p>


                  <small>
                    {rating.created_at}
                  </small>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    );

  }


  // ==========================================
  // Cafe menu
  // ==========================================

  return (

    <div className="container">

      <button
        className="back-btn"
        onClick={goBackToCafes}
      >
        ← Back to Cafes
      </button>


      <div className="cafe-details-header">

        <h1>
          {selectedCafe.cafe.name}
        </h1>

        <p>
          📍 {selectedCafe.cafe.location}
        </p>

      </div>


      <div className="menu-grid">

        {selectedCafe.items.map((item) => (

          <div
            className="menu-card"
            key={item.id}
          >

            <div className="menu-icon">

              {item.category === "Coffee"
                ? "☕"
                : "🍴"}

            </div>


            <div className="menu-info">

              <h3>
                {item.name}
              </h3>

              <p>
                {item.description}
              </p>

              <span>
                {item.category}
              </span>

              <div>
                ⭐ {item.rating}
              </div>


              <button
                className="details-btn"
                onClick={() =>
                  fetchItemDetails(item.id)
                }
              >
                View Details →
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default App;
