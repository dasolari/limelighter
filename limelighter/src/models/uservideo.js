module.exports = (sequelize, DataTypes) => {
  const uservideo = sequelize.define('uservideo', {
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    videoUrl: DataTypes.TEXT,
  }, {});

  uservideo.associate = function associate(models) {
    uservideo.belongsTo(models.user);
  };

  return uservideo;
};
