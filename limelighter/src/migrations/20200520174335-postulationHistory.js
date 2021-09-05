module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.addColumn('groups', 'postulants', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    }),
    queryInterface.addColumn('announcements', 'postulants', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeColumn('groups', 'postulants'),
    queryInterface.removeColumn('announcements', 'postulants'),
  ],
};
