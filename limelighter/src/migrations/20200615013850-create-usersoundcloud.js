module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('usersoundclouds', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    userId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: Sequelize.STRING,
    },
    clientId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    audioId: {
      allowNull: false,
      type: Sequelize.INTEGER,
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

  down: (queryInterface) => queryInterface.dropTable('usersoundclouds'),
};
