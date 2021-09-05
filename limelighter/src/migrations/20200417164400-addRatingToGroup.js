module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('groups', 'rating', {
    type: Sequelize.FLOAT,
  }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('groups', 'rating', {
    type: Sequelize.FLOAT,
  }),
};
