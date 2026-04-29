const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection
//const uri = "mongodb://127.0.0.1:27017";
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "CareerMatcherDB";

// Helper function to get DB
async function getDB() {
  await client.connect();
  return client.db(dbName);
}

/////////////////////////////////////////////////
// ADD NEW JOB POST
/////////////////////////////////////////////////

async function addPost(req, res) {
  try {
    const db = await getDB();

    const {
      title,
      company,
      skills,
      location,
      type,
      salary,
      description
    } = req.body;

    const post = {
      title,
      company,
      skills,
      location,
      type,
      salary,
      description,

      createdBy: "admin", // temporary until authentication
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "open"
    };

    const result = await db.collection("posts").insertOne(post);

    res.json({
      message: "Job posted successfully ✅",
      postId: result.insertedId
    });

  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ error: error.message });
  }
}

/////////////////////////////////////////////////
// GET ALL POSTS
/////////////////////////////////////////////////

async function getAllPosts(req, res) {
  try {
    const db = await getDB();

    const posts = await db
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(posts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/////////////////////////////////////////////////
// GET SINGLE POST BY ID
/////////////////////////////////////////////////

async function getPostById(req, res) {
  try {
    const db = await getDB();

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/////////////////////////////////////////////////
// UPDATE POST
/////////////////////////////////////////////////

async function updatePost(req, res) {
  try {
    const db = await getDB();

    const {
      title,
      company,
      skills,
      location,
      type,
      salary,
      description,
      status
    } = req.body;

    const updated = await db.collection("posts").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title,
          company,
          skills,
          location,
          type,
          salary,
          description,
          status,
          updatedAt: new Date()
        }
      }
    );

    if (updated.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post updated successfully ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/////////////////////////////////////////////////
// DELETE POST (Useful for Admin Dashboard)
/////////////////////////////////////////////////

async function deletePost(req, res) {
  try {
    const db = await getDB();

    const result = await db.collection("posts").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully 🗑️" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function getJobs(req, res) {
  try {

    const db = await getDB();

    const jobs = await db
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(jobs);

  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
}


module.exports = {
  addPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getJobs
};