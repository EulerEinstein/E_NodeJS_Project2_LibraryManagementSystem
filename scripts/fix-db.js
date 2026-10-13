// Restart with alter, after cleaning up the indexes:
// 1. Drop the duplicate username_N and email_N indexes on 
//    Users (the SQL from earlier).
// 2. Make sure server.js has db.sync({ alter: true }).
// 3. Restart. It adds isAvailable and borrowerId to Books.
// 4. Change it back to db.sync(), or the duplicate indexes 
//    start piling up again on every restart.

const { db } = require("../models");

// Drops indexes like `username_2` only when an index named `username`
// already exists on the same table with identical columns and uniqueness.
const dropDuplicateIndexes = async () => {
	const [rows] = await db.query(`
		SELECT TABLE_NAME AS tbl, INDEX_NAME AS idx, NON_UNIQUE AS nonUnique,
		       GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols
		FROM information_schema.STATISTICS
		WHERE TABLE_SCHEMA = DATABASE()
		GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
	`);

	const byTable = {};
	for (const r of rows) (byTable[r.tbl] ??= {})[r.idx] = r;

	let dropped = 0;
	for (const [tbl, indexes] of Object.entries(byTable)) {
		for (const [name, info] of Object.entries(indexes)) {
			const match = name.match(/^(.+)_\d+$/);
			const base = match && indexes[match[1]];
			if (base && base.cols === info.cols && base.nonUnique === info.nonUnique) {
				await db.query(`ALTER TABLE \`${tbl}\` DROP INDEX \`${name}\``);
				console.log(`Dropped ${tbl}.${name} (duplicate of ${match[1]})`);
				dropped++;
			}
		}
	}
	console.log(`Duplicate indexes dropped: ${dropped}`);
};

const fixDb = async () => {
	await db.authenticate();
	await dropDuplicateIndexes();      // get under the 64-key limit first
	await db.sync({ alter: true });    // apply all model changes to every table
	await dropDuplicateIndexes();      // remove duplicates the alter just added
	console.log("Database is in sync");
	await db.close();
};

fixDb().catch((err) => {
	console.error(err);
	process.exit(1);
});