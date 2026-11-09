const sqlite3 = require("sqlite3");
const fs = require("node:fs");
const path = require("node:path");

function registerDatabaseTasks(on, config) {
	function query(sql, parameters = []) {
		// Resolve the path when a database task runs.
		// Other UI/API tests can run without database configuration.
		const configuredPath = config.env.DB_PATH;

		if (!configuredPath) {
			throw new Error(
				"Set DB_PATH in cypress.env.json to the backend's biblioteca.db file.",
			);
		}

		const databasePath = path.resolve(config.projectRoot, configuredPath);

		// Fail explicitly instead of accidentally creating an empty DB.
		if (!fs.existsSync(databasePath)) {
			throw new Error(`Database file not found: ${databasePath}`);
		}

		return new Promise((resolve, reject) => {
			// Open the existing file in read-only mode.
			const db = new sqlite3.Database(
				databasePath,
				sqlite3.OPEN_READONLY,
				(openError) => {
					if (openError) {
						reject(openError);
						return;
					}

					// Allow brief contention with the running application.
					db.configure("busyTimeout", 5000);

					db.all(sql, parameters, (queryError, rows) => {
						// Close the connection after every query, including
						// failed queries, so tests do not leave open handles.
						db.close((closeError) => {
							if (queryError) {
								reject(queryError);
							} else if (closeError) {
								reject(closeError);
							} else {
								resolve(rows);
							}
						});
					});
				},
			);
		});
	}

	// Expose specific queries rather than accepting arbitrary SQL
	// from feature files or browser-side test code.
	on("task", {
		"db:integrity"() {
			// SQLite returns "ok" when its integrity check succeeds.
			return query("PRAGMA integrity_check");
		},

		"db:tables"() {
			return query(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
		},

		"db:bookById"(id) {
			// Validate the task argument before running the query.
			if (!Number.isInteger(id) || id <= 0) {
				throw new Error("Book ID must be a positive integer.");
			}

			// Use a parameter placeholder instead of interpolating the ID.
			return query(
				`SELECT
           id, title, author, isbn, editor, category,
           total_copies, available_copies
         FROM Books
         WHERE id = ?`,
				[id],
			);
		},

		"db:bookCount"() {
			return query("SELECT COUNT(*) AS total FROM Books");
		},

		"db:invalidStock"() {
			// Return records that violate the expected stock rules.
			// A passing test expects this result to be empty.
			return query(`
        SELECT id, title, total_copies, available_copies
        FROM Books
        WHERE total_copies IS NULL
           OR available_copies IS NULL
           OR typeof(total_copies) <> 'integer'
           OR typeof(available_copies) <> 'integer'
           OR total_copies < 0
           OR available_copies < 0
           OR available_copies > total_copies
      `);
		},

		"db:foreignKeyViolations"() {
			// Check existing relationships against declared foreign keys.
			return query("PRAGMA foreign_key_check");
		},
	});
}

module.exports = { registerDatabaseTasks };
