module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('users', 'musician', {
      type: Sequelize.BOOLEAN,
    }),
    queryInterface.addColumn('users', 'instruments', {
      type: Sequelize.ARRAY(Sequelize.STRING),
    }),
    queryInterface.addColumn('users', 'links', {
      type: Sequelize.ARRAY(Sequelize.STRING),
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('users', 'musician'),
    queryInterface.removeColumn('users', 'instruments'),
    queryInterface.removeColumn('users', 'links'),
  ],
};
