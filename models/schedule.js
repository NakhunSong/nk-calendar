'use strict';
module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    startDate: DataTypes.STRING,
    endDate: DataTypes.STRING,
    startTime: DataTypes.STRING,
    endTime: DataTypes.STRING,
    repeat: DataTypes.BOOLEAN,
    allday: DataTypes.BOOLEAN
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });
  Schedule.associate = function(models) {
  };
  return Schedule;
};