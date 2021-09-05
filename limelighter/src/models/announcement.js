module.exports = (sequelize, DataTypes) => {
  const announcement = sequelize.define('announcement', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    postulants: DataTypes.ARRAY(DataTypes.INTEGER),
  }, {});

  announcement.associate = function associate(models) {
    announcement.belongsTo(models.user, {
      onDelete: 'CASCADE',
    });
    announcement.belongsTo(models.group, {
      onDelete: 'CASCADE',
    });
    announcement.hasMany(models.postulation);
  };

  return announcement;
};
