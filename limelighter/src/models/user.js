const bcrypt = require('bcrypt');

const PASSWORD_SALT = 10;

async function buildPasswordHash(instance) {
  if (instance.changed('password')) {
    const hash = await bcrypt.hash(instance.password, PASSWORD_SALT);
    instance.set('password', hash);
  }
}

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    state_region_province: DataTypes.STRING,
    address: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    musician: DataTypes.BOOLEAN,
    instruments: DataTypes.ARRAY(DataTypes.STRING),
    links: DataTypes.ARRAY(DataTypes.STRING),
    allratings: DataTypes.INTEGER,
    confirmed: DataTypes.BOOLEAN,
    photo: DataTypes.TEXT,
  }, {});

  user.beforeCreate(buildPasswordHash);
  user.beforeUpdate(buildPasswordHash);

  user.associate = function associate(models) {
    user.hasMany(models.announcement);
    user.hasMany(models.postulation);
    user.hasMany(models.chatmessage);
    user.belongsToMany(models.group, {
      through: models.usergroup,
      as: 'groups',
      foreignKey: 'userId',
    });
  };

  user.prototype.checkPassword = function checkPassword(password) {
    return bcrypt.compare(password, this.password);
  };

  user.prototype.validateEmail = function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  user.prototype.validatePassword = function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return re.test(String(password));
  };

  user.prototype.validatePhone = function validatePhone(phone) {
    const re = /^[+]+[0-9]{1,}$/;
    return re.test(String(phone));
  };

  return user;
};
