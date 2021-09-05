module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('users', 'photo', {
      type: Sequelize.TEXT,
      defaultValue: null,
    }),
    queryInterface.addColumn('groups', 'photo', {
      type: Sequelize.TEXT,
      defaultValue: null,
    })],

  down: (queryInterface) => [
    queryInterface.removeColumn('users', 'photo'),
    queryInterface.removeColumn('groups', 'photo'),
  ],
};
