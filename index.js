// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: [process.env.CLIENT_URL],
        credentials: true,
    })
);
app.use(express.json());

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        const db = client.db(process.env.DB_NAME);

        const reviewsCollection = db.collection("reviews");
        const favoritesCollection = db.collection("favorites");

        // Test route
        app.get("/", (req, res) => {
            res.send("Local Food Lovers API is running");
        });

        /* ==========================
           REVIEWS ROUTES (CRUD)
           ========================== */

        // Add a review (POST)
        app.post("/reviews", async (req, res) => {
            try {
                const review = req.body;
                // Should contain: foodName, foodImage, restaurantName, location, rating, reviewText, reviewerName, userEmail, createdAt
                const result = await reviewsCollection.insertOne(review);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to add review", error: error.message });
            }
        });

        // Get all reviews (with optional search)
        app.get("/reviews", async (req, res) => {
            try {
                const search = req.query.search || "";
                let query = {};

                if (search) {
                    query = {
                        foodName: {
                            $regex: search,
                            $options: "i",
                        },
                    };
                }

                const cursor = reviewsCollection
                    .find(query)
                    .sort({ createdAt: -1 });

                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to get reviews", error: error.message });
            }
        });

        // Get top-rated reviews (for homepage featured)
        app.get("/reviews/top", async (req, res) => {
            try {
                const cursor = reviewsCollection
                    .find()
                    .sort({ rating: -1, createdAt: -1 })
                    .limit(6);

                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to get top reviews", error: error.message });
            }
        });

        // Get single review by id
        app.get("/reviews/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const review = await reviewsCollection.findOne(query);

                if (!review) {
                    return res.status(404).send({ message: "Review not found" });
                }

                res.send(review);
            } catch (error) {
                res.status(500).send({ message: "Failed to get review", error: error.message });
            }
        });

        // Get my reviews (by userEmail)
        app.get("/my-reviews", async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "Email is required" });
                }

                const query = { userEmail: email };
                const cursor = reviewsCollection
                    .find(query)
                    .sort({ createdAt: -1 });

                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to get my reviews", error: error.message });
            }
        });

        // Update review (PUT)

        app.get("/reviews/:id", async (req, res) => {
            try {
                const id = req.params.id;

                let query;

                if (ObjectId.isValid(id)) {
                    query = { _id: new ObjectId(id) };
                } else {
                    query = { _id: id };
                }

                const review = await reviewsCollection.findOne(query);

                if (!review) {
                    return res.status(404).send({ message: "Review not found" });
                }

                res.send(review);
            } catch (error) {
                console.error("Error in GET /reviews/:id:", error);
                res
                    .status(500)
                    .send({ message: "Failed to get review", error: error.message });
            }
        });


        // Delete review
        app.delete("/reviews/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const result = await reviewsCollection.deleteOne(filter);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to delete review", error: error.message });
            }
        });

        /* ==========================
           FAVORITES ROUTES
           ========================== */

        // Add to favorites
        app.post("/favorites", async (req, res) => {
            try {
                const fav = req.body;
                // Should contain: reviewId, foodName, foodImage, restaurantName, location, rating, userEmail, createdAt

                // Optional: prevent duplicates (same user + same review)
                const exists = await favoritesCollection.findOne({
                    reviewId: fav.reviewId,
                    userEmail: fav.userEmail,
                });

                if (exists) {
                    return res.status(400).send({ message: "Already in favorites" });
                }

                const result = await favoritesCollection.insertOne(fav);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to add favorite", error: error.message });
            }
        });

        // Get favorites by user email
        app.get("/favorites", async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "Email is required" });
                }

                const query = { userEmail: email };
                const cursor = favoritesCollection
                    .find(query)
                    .sort({ createdAt: -1 });

                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to get favorites", error: error.message });
            }
        });

        // Remove favorite (optional)
        app.delete("/favorites/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const result = await favoritesCollection.deleteOne(filter);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to remove favorite", error: error.message });
            }
        });

        // Connect to MongoDB once
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connected successfully");

        app.listen(port, () => {
            console.log(`Local Food Lovers API running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to connect MongoDB:", error);
    }
}

run().catch(console.dir);
