import IdGenerator from '../services/id_generator';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: IdGenerator.id(),
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
    }
  },
  {
    timestamps: true
  });
  User.associate = function(models) {
    User.hasMany(models.Credential, { as: 'credentials' });
  };
  return User;
};
