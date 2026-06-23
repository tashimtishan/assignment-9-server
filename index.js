const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT
const cors = require("cors");
app.use(cors());

const uri = process.env.MONGODB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("DocAppoint");
    const doctorsCollection = db.collection("doctors");
    const bookingCollection = db.collection("bookings");

    app.get("/doctors", async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.json(result);
    })

    app.get("/doctors/:id", async (req, res) => {
      const { id } = req.params;
      const result = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result)
    })


    app.get("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const result = await bookingCollection.find({ userId: id }).toArray();
      res.json(result);
    });

    app.patch("/bookings/:id", async (req,res)=>{
      const {id}= req.params
      const updateData = req.body
      const result = await bookingCollection.updateOne( { _id: new ObjectId(id) },
        { $set: updateData })
        res.json(result)
    })
    app.delete("/bookings/:id", async (req, res) => {
    const { id } = req.params;
    const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
});

    app.get("/bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.json(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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