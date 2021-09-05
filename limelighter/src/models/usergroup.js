module.exports = (sequelize, DataTypes) => {
  const usergroup = sequelize.define('usergroup', {
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    rated: DataTypes.BOOLEAN,
    instrument: DataTypes.STRING,
  }, {});

  usergroup.associate = function associate(models) {
    usergroup.belongsTo(models.user);
    usergroup.belongsTo(models.group);
  };

  return usergroup;
};
