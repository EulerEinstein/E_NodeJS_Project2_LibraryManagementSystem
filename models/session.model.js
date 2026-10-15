const { DataTypes } = require("sequelize");

const sessionModel = (db) => {
	return db.define("Session", {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		expiresAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	});
};

module.exports = { sessionModel };
