const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// add middleware
app.use(cors());
app.use(express.json());

// ....................................Mongodb..................................................
// Mongodb connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.siwod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // connect to the MongoDB database name 'coffeeDB'
    const database = client.db("coffeeDB");
    // get the 'coffees' collection from the database
    const coffeeCollection = database.collection("coffees");

    // connet 'coffeeDB' with userCollection
    const userCollection = client.db("coffeeDB").collection("user");

    // Define a get Route to fetch all Coffee data from the database
    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Define a post route to handle adding new coffee
    app.post("/coffees", async (req, res) => {
      const coffee = req.body;
      console.log(coffee);
      // insert the coffee data into database
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    });

    // Define a Delete route to remvoe a user by thier ID
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete user id: ", id);
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Define a get Route to Retrive a Coffee from DataBase
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    // Define a Put route to handle update for a speicific Coffee by ID
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const coffeeInfo = req.body;
      const options = { upsert: true };

      const updateCoffeeDoc = {
        $set: {
          name: coffeeInfo.name,
          chef: coffeeInfo.chef,
          supplier: coffeeInfo.supplier,
          taste: coffeeInfo.taste,
          category: coffeeInfo.category,
          details: coffeeInfo.details,
          photoUrl: coffeeInfo.photoUrl,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updateCoffeeDoc,
        options
      );
      res.send(result);
    });

    // ---------------------------User Related Apis---------------------------------------
    // Define a get Route to fetch all 'users' data from the database
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("creating new User: ", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body?.email;
      const filter = { email };
      const updateDoc = {
        $set: {
          lastSignInTime: req?.body?.lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// .................................Mongodb End....................................................

app.get("/", (req, res) => {
  res.send("Hellow form Server Side");
});

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`);
});
