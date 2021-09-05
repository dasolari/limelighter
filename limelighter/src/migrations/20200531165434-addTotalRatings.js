module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('users', 'allratings', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }),
    queryInterface.addColumn('groups', 'allratings', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('users', 'allratings'),
    queryInterface.removeColumn('groups', 'allratings'),
  ],
};
