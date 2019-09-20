import IdGenerator from '../services/id_generator';

export default (sequelize, DataTypes) => {
  const Credential = sequelize.define('Credential', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: IdGenerator.id(),
    },
    userId: DataTypes.STRING,
    name: DataTypes.STRING,
    type: {
      type: DataTypes.STRING,
      unique: 'UTypeValue',
    },
    value: {
      type: DataTypes.STRING,
      unique: 'UTypeValue',
    },
  },
  {
    timestamps: true
  });
  Credential.associate = function(models) {
    Credential.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };
  return Credential;
};
