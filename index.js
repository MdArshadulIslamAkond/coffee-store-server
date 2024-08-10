const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// coffeeMaster
// WT0FjD4XF7Ij9ouP

// console.log(process.env.DB_USER + ' ' + process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp5aibk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const database = client.db("coffeeStore");
    const coffeeCollection = database.collection("coffees");
    const userCollection = database.collection("user");

    app.get('/coffees', async(req, res)=>{
        const coffees = await coffeeCollection.find().toArray();
        res.json(coffees);
    })

    app.get('/coffees/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const coffee = await coffeeCollection.findOne(query);
        if(!coffee) return res.status(404).json({ message: 'Coffee not found' });
        // res.json(coffee);
        res.status(200).json(coffee);
        // res.send(coffee);
    })

    app.post('/coffees', async (req, res) => {
        const newCoffee = req.body;
        // console.log(newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        console.log(result);
        res.status(201).json({ message: 'Coffee added successfully', insertedId: result.insertedId });
        // res.send(result);

    })

    app.put('/coffees/:id', async (req, res) => {
        const id = req.params.id;
        const updatedCoffee = req.body;
        const query = {_id: new ObjectId(id)};
        const options = { upsert: true };
        const result = await coffeeCollection.updateOne(query, { $set: updatedCoffee }, options);
        // if(result.matchedCount === 0) return res.status(404).json({ message: 'Coffee not found' });
        // res.json({ message: 'Coffee updated successfully', updatedCount: result.modifiedCount });
        res.status(200).json({ message: 'Coffee updated successfully', updatedCount: result.modifiedCount });
        // res.send(result);
    })

    app.delete('/coffees/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await coffeeCollection.deleteOne(query);
        if(result.deletedCount === 0) return res.status(404).json({ message: 'Coffee not found' });
        // res.json({ message: 'Coffee deleted successfully', deletedCount });
        res.status(200).json({ message: 'Coffee deleted successfully', deletedCount: result.deletedCount });
        // res.send(result);
    });

    // user related apis
    app.get('/user', async(req, res)=>{
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    })
    app.post('/user', async(req, res)=>{
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      // res.send(result);
      res.status(201).json({ message: 'Coffee added successfully', insertedId: result.insertedId });
    })

    app.patch('/user', async(req, res)=>{
      const user = req.body;
      const filter = {email: user.email}
      const updateDoc = {
        $set:{
          lastLoggedAt: user.lastLoggedAt
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      if(result.matchedCount === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated successfully', updatedCount: result.modifiedCount });
        // res.send(result);

    })

    app.delete('/user/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      if(result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
        // res.json({ message: 'User deleted successfully', deletedCount });
        res.status(200).json({ message: 'User deleted successfully', deletedCount: result.deletedCount });
        // res.send(result);
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

app.get('/', (req, res) =>{
    res.send('Coffee making server is running');
})

app.listen(port, ()=>{
    console.log(`Coffee Server is running on port:  ${port}`);
});