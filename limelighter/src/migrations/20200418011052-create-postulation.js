module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('postulations', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    description: {
      type: Sequelize.TEXT,
    },
    date: {
      type: Sequelize.DATE,
    },
    status: {
      type: Sequelize.STRING,
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

  down: (queryInterface) => queryInterface.dropTable('postulations'),
};
