module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('usergroups', 'rated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('usergroups', 'rated'),
  ],
};
