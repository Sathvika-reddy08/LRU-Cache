import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

const db = new pg.Client({
    user : "postgres",
    host : "localhost",
    database : "lrucache",
    password : process.env.password,
    port : 5432
});
db.connect();
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
    }

    async get(key) {
        key = parseInt(key, 10);
        const result = await db.query('SELECT value FROM cache WHERE key = $1', [key]);
        if (result.rows.length > 0) {
            await db.query(`UPDATE cache SET accessed_at = NOW() WHERE key = $1`, [key]);
            return result.rows[0].value;
        }
        return null;
    }

    async put(key, value) {
        key = parseInt(key, 10);
        const countResult = await db.query("SELECT COUNT(*) FROM cache");
        const cacheSize = parseInt(countResult.rows[0].count);

        if (cacheSize >= this.capacity) {
            await db.query(`DELETE FROM cache WHERE key = (SELECT key FROM cache ORDER BY accessed_at ASC LIMIT 1)`);
        }
        
        await db.query(`INSERT INTO cache (key, value, accessed_at) VALUES ($1, $2, NOW())
                          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, accessed_at = NOW()`, [key, value]);
    }
}
const lruCache = new LRUCache(5);
app.get('/cache/:key', async (req, res) => {
    const key = parseInt(req.params.key, 10);
    if (isNaN(key)) {
        return res.status(400).json({ error: "Invalid key. Must be an integer." });
    }

    try {
        const value = await lruCache.get(key);
        res.json({ key, value });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post('/cache', async (req, res) => {
    const { key, value } = req.body;
    await lruCache.put(parseInt(key, 10), value);
    res.json({ message: 'Inserted Successfully' });
});
app.get("/cache-state", async (req, res) => {
    const result = await db.query("SELECT key, value FROM cache ORDER BY accessed_at DESC");
    res.json(result.rows);
});
app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
});