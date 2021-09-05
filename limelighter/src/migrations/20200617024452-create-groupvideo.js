module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('groupvideos', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    groupId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'groups',
        key: 'id',
      },
    },
    title: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    videoUrl: {
      allowNull: false,
      type: Sequelize.TEXT,
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

  down: (queryInterface) => queryInterface.dropTable('groupvideos'),
};
