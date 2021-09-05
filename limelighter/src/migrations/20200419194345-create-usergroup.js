module.exports = {
  up: (queryInterface, Sequelize) => [
    queryInterface.createTable('usergroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
      },
      groupId: {
        type: Sequelize.INTEGER,
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
    queryInterface.addColumn('announcements', 'userId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    }),
    queryInterface.addColumn('announcements', 'groupId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'groups',
        key: 'id',
      },
    }),
    queryInterface.addColumn('postulations', 'userId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    }),
    queryInterface.addColumn('postulations', 'announcementId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'announcements',
        key: 'id',
      },
    }),
    queryInterface.addColumn('postulations', 'groupId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'groups',
        key: 'id',
      },
    }),
  ],

  down: (queryInterface) => [
    queryInterface.dropTable('usergroups'),
    queryInterface.removeColumn('announcements', 'userId'),
    queryInterface.removeColumn('announcements', 'groupId'),
    queryInterface.removeColumn('postulations', 'userId'),
    queryInterface.removeColumn('postulations', 'announcementId'),
    queryInterface.removeColumn('postulations', 'groupId'),
  ],
};
