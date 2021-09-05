module.exports = (sequelize, DataTypes) => {
  const userchatmessage = sequelize.define('userchatmessage', {
    content: DataTypes.STRING,
    userName: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    chatId: DataTypes.INTEGER,
    date: DataTypes.DATE,
  }, {});

  userchatmessage.associate = function associate(models) {
    userchatmessage.belongsTo(models.user, {
      onDelete: 'CASCADE',
    });
  };

  return userchatmessage;
};
