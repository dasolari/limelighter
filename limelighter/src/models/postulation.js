module.exports = (sequelize, DataTypes) => {
  const postulation = sequelize.define('postulation', {
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    announcementId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
  }, {});

  postulation.associate = function associate(models) {
    postulation.belongsTo(models.user, {
      onDelete: 'CASCADE',
    });
    postulation.belongsTo(models.announcement, {
      onDelete: 'CASCADE',
    });
    postulation.belongsTo(models.group, {
      onDelete: 'CASCADE',
    });
  };

  return postulation;
};
