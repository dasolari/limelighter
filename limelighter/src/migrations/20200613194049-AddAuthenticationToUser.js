module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('users', 'confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('users', 'confirmed'),
  ],
};
