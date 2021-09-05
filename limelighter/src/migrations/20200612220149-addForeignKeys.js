module.exports = {
  up: (queryInterface) => [
    queryInterface.addConstraint('usergroups', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'usergroups_userId_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
    }),
    queryInterface.addConstraint('usergroups', {
      fields: ['groupId'],
      type: 'foreign key',
      name: 'usergroups_groupId_fkey',
      references: {
        table: 'groups',
        field: 'id',
      },
      onDelete: 'cascade',
    }),
    queryInterface.addConstraint('userannouncements', {
      fields: ['announcementId'],
      type: 'foreign key',
      name: 'userannouncements_announcementId_fkey',
      references: {
        table: 'announcements',
        field: 'id',
      },
      onDelete: 'cascade',
    }),
    queryInterface.addConstraint('userannouncements', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'userannouncements_userId_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
    }),
  ],

  down: (queryInterface) => [
    queryInterface.removeConstraint('usergroups', 'usergroups_userId_fkey'),
    queryInterface.removeConstraint('usergroups', 'usergroups_groupId_fkey'),
    queryInterface.removeConstraint('userannouncements', 'userannouncements_userId_fkey'),
    queryInterface.removeConstraint('userannouncements', 'userannouncements_announcementId_fkey'),
  ],
};
