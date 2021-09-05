module.exports = (sequelize, DataTypes) => {
  const groupvideo = sequelize.define('groupvideo', {
    groupId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    videoUrl: DataTypes.TEXT,
  }, {});

  groupvideo.associate = function associate(models) {
    groupvideo.belongsTo(models.group);
  };

  return groupvideo;
};
