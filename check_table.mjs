(async () => {
    const { default: pool } = await import('./src/lib/db.mjs');
    try {
        const [cols] = await pool.query("SHOW COLUMNS FROM packages");
        console.log("Packages Columns:", cols.map(c => c.Field).join(", "));
    } catch (e) { console.error(e) }
    process.exit(0);
})();
