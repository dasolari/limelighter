module.exports = (sequelize, DataTypes) => {
  const spotifymediauser = sequelize.define('spotifymediauser', {
    userId: DataTypes.INTEGER,
    uri: DataTypes.STRING,
    type: DataTypes.STRING,
  }, {});

  spotifymediauser.associate = function associate(models) {
    spotifymediauser.belongsTo(models.user);
  };

  return spotifymediauser;
};
