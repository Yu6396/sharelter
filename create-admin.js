require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('./src/model/admin'); 
require('./config/db'); 
const { saltAndHashPassword } = require('./src/utils/index');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
  try {
    const email = "twodot40@gmail.com";
    const plainPassword = "ororo07";

    const existingAdmin = await admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists:', email);
      return process.exit(0); 
    }

    const { salt, hashedPassword } = await saltAndHashPassword(plainPassword);

    const newAdmin = {
      admin_id: uuidv4(),
      first_name: "Abayomi",
      last_name: "Obayemi",
      email,
      phone: "09028610970",
      address: "47, olabode street, ikorodu, lagos",
      password_hash: hashedPassword,
      password_salt: salt,
      role: 'super-admin'
    };

    await admin.create(newAdmin);

    console.log('Admin created successfully:', email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
