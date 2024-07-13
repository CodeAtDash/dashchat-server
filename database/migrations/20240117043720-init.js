'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // await queryInterface.sequelize.query(
      //   'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      //   { transaction },
      // );
    } catch (error) {
      console.log('Error in migration', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {},
};
