module.exports = (sequelize, DataTypes) => {
  const chatmessage = sequelize.define('chatmessage', {
    content: DataTypes.STRING,
    userName: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    date: DataTypes.DATE,
  }, {});

  chatmessage.associate = function associate(models) {
    chatmessage.belongsTo(models.user, {
      onDelete: 'CASCADE',
    });
    chatmessage.belongsTo(models.group, {
      onDelete: 'CASCADE',
    });
  };

  return chatmessage;
};
