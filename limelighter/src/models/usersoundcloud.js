module.exports = (sequelize, DataTypes) => {
  const usersoundcloud = sequelize.define('usersoundcloud', {
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    clientId: DataTypes.UUID,
    audioId: DataTypes.INTEGER,
  }, {});

  usersoundcloud.associate = function associate(models) {
    usersoundcloud.belongsTo(models.user);
  };

  return usersoundcloud;
};
