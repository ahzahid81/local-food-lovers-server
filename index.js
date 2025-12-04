const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- 1. CONFIGURATION ---
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://foodie-circle.web.app",
        // Add your production frontend URL here once deployed
        process.env.CLIENT_URL 
    ].filter(Boolean), // This removes undefined values if env is missing
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// --- 2. MONGODB CONNECTION ---
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Helper function to get DB connection safely
async function getCollection(collectionName) {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    return client.db(process.env.DB_NAME).collection(collectionName);
}

// --- 3. ROUTES (Defined at top level) ---

// Test route
app.get("/", (req, res) => {
    res.send("Local Food Lovers API is running");
});

// Get top-rated reviews (Featured)
app.get("/reviews/top", async (req, res) => {
    try {
        const reviewsCollection = await getCollection("reviews");
        const result = await reviewsCollection
            .find()
            .sort({ rating: -1, createdAt: -1 })
            .limit(6)
            .toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to get top reviews", error: error.message });
    }
});

// Get all reviews (with search)
app.get("/reviews", async (req, res) => {
    try {
        const reviewsCollection = await getCollection("reviews");
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

        const result = await reviewsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to get reviews", error: error.message });
    }
});

// Get single review by id
app.get("/reviews/:id", async (req, res) => {
    try {
        const reviewsCollection = await getCollection("reviews");
        const id = req.params.id;
        
        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID format" });
        }

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
        const reviewsCollection = await getCollection("reviews");
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }
        const query = { userEmail: email };
        const result = await reviewsCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to get my reviews", error: error.message });
    }
});

// Add a review (POST)
app.post("/reviews", async (req, res) => {
    try {
        const reviewsCollection = await getCollection("reviews");
        const review = req.body;
        // Basic validation could be added here
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to add review", error: error.message });
    }
});

// Delete review
app.delete("/reviews/:id", async (req, res) => {
    try {
        const reviewsCollection = await getCollection("reviews");
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID format" });
        }
        const filter = { _id: new ObjectId(id) };
        const result = await reviewsCollection.deleteOne(filter);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to delete review", error: error.message });
    }
});

// Add to favorites
app.post("/favorites", async (req, res) => {
    try {
        const favoritesCollection = await getCollection("favorites");
        const fav = req.body;
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

// Get favorites
app.get("/favorites", async (req, res) => {
    try {
        const favoritesCollection = await getCollection("favorites");
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }
        const query = { userEmail: email };
        const result = await favoritesCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to get favorites", error: error.message });
    }
});

// Delete favorite
app.delete("/favorites/:id", async (req, res) => {
    try {
        const favoritesCollection = await getCollection("favorites");
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID format" });
        }
        const filter = { _id: new ObjectId(id) };
        const result = await favoritesCollection.deleteOne(filter);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to remove favorite", error: error.message });
    }
});

// --- 4. START SERVER ---
// Only listen if not running in Vercel (Vercel handles this automatically)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;