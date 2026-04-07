const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function getDB() {
  await client.connect();
  return client.db("CareerMatcherDB");
}


// GET USER PROFILE
router.get("/:id", async (req, res) => {
  try {

    const db = await getDB();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(req.params.id)
    });

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// UPDATE USER PROFILE
router.put("/:id", async (req, res) => {
  try {

    const db = await getDB();

    const { about, location, phone, skills, company } = req.body;

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          about,
          location,
          phone,
          skills,
          company
        }
      }
    );

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;