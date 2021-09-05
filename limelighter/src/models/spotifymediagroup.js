module.exports = (sequelize, DataTypes) => {
  const spotifymediagroup = sequelize.define('spotifymediagroup', {
    groupId: DataTypes.INTEGER,
    uri: DataTypes.STRING,
    type: DataTypes.STRING,
  }, {});

  spotifymediagroup.associate = function associate(models) {
    spotifymediagroup.belongsTo(models.group);
  };

  return spotifymediagroup;
};
