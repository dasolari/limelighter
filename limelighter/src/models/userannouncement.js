module.exports = (sequelize, DataTypes) => {
  const userannouncement = sequelize.define('userannouncement', {
    userId: DataTypes.INTEGER,
    announcementId: DataTypes.INTEGER,
    rated: DataTypes.BOOLEAN,
  }, {});

  userannouncement.associate = function associate(models) {
    userannouncement.belongsTo(models.user);
    userannouncement.belongsTo(models.announcement);
  };

  return userannouncement;
};
