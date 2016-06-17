import Sequelize from 'sequelize';
import { mysql } from '../../config/db.config';

export default new Sequelize(mysql.database, mysql.user, mysql.password, {
    host: mysql.host,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      idle: 30000,
    },
    define: {
      timestamps: false,
      freezeTabName: true,
    },
});

