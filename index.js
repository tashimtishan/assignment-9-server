const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT
const cors = require("cors");
app.use(cors());

const uri = process.env.MONGODB_URI;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// this is the main function
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("DocAppoint");
    const doctorsCollection = db.collection("doctors");
    const bookingCollection = db.collection("bookings");


    app.get("/doctors", async (req, res) => {
    try {
        const result = await doctorsCollection.find().toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});
      app.get("/doctors/specialty/:specialty", async (req, res) => {
    const { specialty } = req.params;
    const result = await doctorsCollection.find({ specialty: specialty }).toArray();
    res.json(result);
});

    app.get("/doctors/:id", async (req, res) => {
      const { id } = req.params;
      const result = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result)
    })

     app.post("/auth/token", (req, res) => {
            const { userId, name, email } = req.body;
            if (!userId) return res.status(400).json({ message: "userId required" });
            const token = jwt.sign(
                { userId, name, email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
            res.json({ token });
        });



    app.get("/bookings/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await bookingCollection.find({ userId: id }).toArray();
      res.json(result);
    });
    app.post("/bookings", verifyToken, async (req, res) => {
    const bookingData = req.body;
    const result = await bookingCollection.insertOne(bookingData);
    res.json(result);
});

    app.patch("/bookings/:id", verifyToken, async (req,res)=>{
      const {id}= req.params
      const updateData = req.body
      const result = await bookingCollection.updateOne( { _id: new ObjectId(id) },
        { $set: updateData })
        res.json(result)
    })
    app.delete("/bookings/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
});

    app.get("/bookings", verifyToken, async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.json(result || [])
    })

  



app.get("/stats", async (req, res) => {
    try {
        const totalDoctors = await doctorsCollection.countDocuments();
        const totalBookings = await bookingCollection.countDocuments();
        res.json({ totalDoctors, totalBookings });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("server is running just okay!!!!")
})

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`)
})