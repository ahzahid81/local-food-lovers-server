const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
}));
app.use(express.json());

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

        app.get("/", (req, res) => {
            res.send("Local Food Lovers API is running")
        });

        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connected successfully");

        app.listen(port, () => {
            console.log(`Local Food Lovers API running on port ${port}`);
        });
    }catch(error){
        console.error("Failed to connect MongoDB:", error);
    }
}

run().catch(console.dir);
