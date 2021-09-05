module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('groups', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    name: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
    },
    instruments: {
      type: Sequelize.STRING,
    },
    genre: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    avaincies: {
      type: Sequelize.INTEGER,
    },
    leader_id: {
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

  down: (queryInterface) => queryInterface.dropTable('groups'),
};
