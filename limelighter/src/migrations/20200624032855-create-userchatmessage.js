module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('userchatmessages', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    content: {
      type: Sequelize.STRING,
    },
    userName: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    chatId: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATE,
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface) => queryInterface.dropTable('userchatmessages'),
};
