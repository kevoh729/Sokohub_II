require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function remove() {
    const client = await pool.connect();
    try {
        const r = await client.query(
            "DELETE FROM products WHERE seller_id = (SELECT id FROM sellers WHERE email = 'seed@sokohub.com' LIMIT 1)"
        );
        console.log('Deleted', r.rowCount, 'seed products');
        await client.query("DELETE FROM sellers WHERE email = 'seed@sokohub.com'");
        console.log('Seed seller removed');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}
remove();
