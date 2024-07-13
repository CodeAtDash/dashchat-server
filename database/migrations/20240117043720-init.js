'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // try {
    //   await queryInterface.createTable('users', {
    //     id: {
    //       type: Sequelize.UUID,
    //       defaultValue: Sequelize.UUIDV4,
    //       allowNull: false,
    //       primaryKey: true,
    //     },
    //     name: {
    //       type: Sequelize.STRING,
    //       allowNull: false,
    //     },
    //     email: {
    //       type: Sequelize.STRING,
    //       allowNull: false,
    //       unique: true,
    //     },
    //     password: {
    //       type: Sequelize.STRING,
    //       allowNull: false,
    //     },
    //     is_verified: {
    //       type: Sequelize.BOOLEAN,
    //       allowNull: false,
    //       defaultValue: false,
    //     },
    //     otp: {
    //       type: Sequelize.STRING,
    //     },
    //     verification_token: {
    //       type: Sequelize.TEXT,
    //     },
    //     created_at: {
    //       allowNull: false,
    //       type: Sequelize.DATE,
    //     },
    //     updated_at: {
    //       allowNull: false,
    //       type: Sequelize.DATE,
    //     },
    //     deleted_at: {
    //       allowNull: true,
    //       type: Sequelize.DATE,
    //     },
    //   });
    // } catch (error) {
    //   console.log('Error in migration', error);
    //   throw error;
    // }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.dropTable('users');
  },
};
