module.exports = (sequelize, DataTypes) => {
  const group = sequelize.define('group', {
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    instruments: DataTypes.ARRAY(DataTypes.STRING),
    genre: DataTypes.STRING,
    description: DataTypes.TEXT,
    avaincies: DataTypes.INTEGER,
    leader_id: DataTypes.INTEGER,
    rating: DataTypes.FLOAT,
    postulants: DataTypes.ARRAY(DataTypes.INTEGER),
    allratings: DataTypes.INTEGER,
    photo: DataTypes.TEXT,
  }, {});

  group.associate = function associate(models) {
    group.hasMany(models.announcement);
    group.hasMany(models.postulation);
    group.hasMany(models.chatmessage);
    group.belongsToMany(models.user, {
      through: models.usergroup,
      as: 'users',
      foreignKey: 'groupId',
    });
  };

  group.prototype.validateVancancies = function validateVancancies(vancancies) {
    const re = /^\d+$/;
    if (re.test(String(vancancies))) {
      if (vancancies >= 1) {
        return true;
      }
    }
    return false;
  };

  group.prototype.compareInstruments = function compareInstruments(user) {
    if (user && this.instruments && user.instruments) {
      return this.instruments.filter((value) => user.instruments.includes(value)).length;
    }
    return 0;
  };

  return group;
};
