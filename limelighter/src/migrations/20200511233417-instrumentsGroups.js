module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.removeColumn('groups', 'instruments', {
      type: Sequelize.STRING,
    }),
    queryInterface.addColumn('groups', 'instruments', {
      type: Sequelize.ARRAY(Sequelize.STRING),
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('groups', 'instruments'),
  ],
};
