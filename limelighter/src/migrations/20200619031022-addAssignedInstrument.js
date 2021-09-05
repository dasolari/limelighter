module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('usergroups', 'instrument', {
      type: Sequelize.STRING,
      defaultValue: '',
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('usergroups', 'instrument'),
  ],
};
