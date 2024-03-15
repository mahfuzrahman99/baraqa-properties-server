const express = require("express");
const morgan = require("morgan");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.port || 5000;

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

initializeApp({
  apiKey: "AIzaSyAeOkWIOh6OtzAZ3fpH1ZvGM55QjjKovkM",
  authDomain: "baraqa-properties-limited-llc.firebaseapp.com",
  projectId: "baraqa-properties-limited-llc",
  storageBucket: "baraqa-properties-limited-llc.appspot.com",
  messagingSenderId: "350171610805",
  appId: "1:350171610805:web:fe24fc9da087e5cda988fc",
});

const uri =
  "mongodb+srv://BARAQAPROPERTIES:UP4obkI3rpAnd5gK@cluster0.wkixfkf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    //   Create collections
    const demosCollection = client.db("BaraqaProperties").collection("demos");
    const usersCollection = client.db("BaraqaProperties").collection("users");

    // Endpoint to create a new user
    app.post("/users", async (req, res) => {
      try {
        const userItem = req.body;
        // Create user in Firebase Auth
        const userRecord = await getAuth().createUser({
          email: userItem.email,
          password: userItem.password,
          displayName: userItem.name,
          photoURL: userItem.photo,
          disabled: false,
        });
        console.log("Successfully created new user:", userRecord.uid);
        // Insert user data into MongoDB
        const result = await usersCollection.insertOne(userItem);
        res.send(result);
      } catch (error) {
        console.log("Error creating new user:", error);
        res.status(500).send(error);
      }
    });
    // user get all
    app.get("/users", async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    // user get via email
    app.get("/getUserRole/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await usersCollection.findOne({ email: email });
        res.send(result.role);
      } catch (error) {
        res.send(error);
      }
    });
    // user get specific id
    app.get("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await usersCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    // update user
    app.patch("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const filter = { _id: new ObjectId(id) };
        const updatesUser = req.body;
        console.log(updatesUser);
        const user = {
          $set: {
            role: updatesUser.role,
          },
        };
        const result = await usersCollection.updateOne(filter, user);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    //   delete suer
    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const filter = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // add project post
    app.post("/demos", async (req, res) => {
      try {
        const demoItem = req.body;
        const result = await demosCollection.insertOne(demoItem);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    // project get all
    app.get("/demos", async (req, res) => {
      try {
        const result = await demosCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    // project get specific id
    app.get("/demos/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await demosCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    // update project
    app.patch("/demos/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const filter = { _id: new ObjectId(id) };
        const updatesDemo = req.body;
        console.log(updatesDemo);
        const demo = {
          $set: {
            demo_Name: updatesDemo.demo_Name,
            demo_before_image: updatesDemo.demo_before_image,
            demo_after_image: updatesDemo.demo_after_image,
            demo_description: updatesDemo.demo_description,
            demo_category: updatesDemo.demo_category,
          },
        };
        const result = await demosCollection.updateOne(filter, demo, {
          upsert: true,
        });
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    // Deleting project data
    app.delete("/demos/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const result = await demosCollection.deleteOne(query);
        console.log(query, result);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.listen(port, (req, res) => {
  console.log(`Server is running on ${port}`);
});
