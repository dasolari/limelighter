module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('userannouncements', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    userId: {
      type: Sequelize.INTEGER,
    },
    announcementId: {
      type: Sequelize.INTEGER,
    },
    rated: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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

  down: (queryInterface) => queryInterface.dropTable('userannouncements'),
};
