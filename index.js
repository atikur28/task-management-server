const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ny7g9hw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const tasksCollection = client.db("taskManagement").collection("tasks");

    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const taskInfo = req.body;
      const result = await tasksCollection.insertOne(taskInfo);
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedStatus = req.body;
      const updatedDoc = {
        $set: {
          status: updatedStatus.status,
        },
      };
      const result = await tasksCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // app.put("/tasks/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const taskInfo = req.body;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       email: taskInfo.email,
    //       title: taskInfo.title,
    //       description: taskInfo.description,
    //       date: taskInfo.date,
    //       priority: taskInfo.priority,
    //       status: taskInfo.status,
    //     },
    //   };
    //   const result = await tasksCollection.updateOne(filter, updatedDoc, options);
    //   res.send(result);
    // });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("Task management server is running...");
});

app.listen(port, () => {
  console.log(`Task management server is running on port, ${port}`);
});
