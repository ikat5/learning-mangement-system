import dotenv from 'dotenv';
dotenv.config();
import connectDb from './db/index.js';
import app from './app.js';
import { BankAccount} from './model/bankAccount.model.js';  
import { bankAccountData } from './utils/bankAccountData.js'; 
import { Admin } from './model/admin.model.js';



// Seed Bank Accounts (runs only if empty)
const seedBankAccounts = async () => {
  try {
    const count = await BankAccount.countDocuments();
    if (count === 0) {
      await BankAccount.insertMany(bankAccountData);
      console.log("✅ Bank accounts seeded successfully!");
    } else {
      console.log(`⚪ ${count} bank accounts already exist. Skipping seed.`);
    }
  } catch (error) {
    console.error("❌ Error seeding bank accounts:", error);
  }
};

// Seed Default Admin (runs only if no admin exists)
const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultAdmin = await Admin.create({
        fullName: "lms",
        userName: "admin",
        email: "admin@test.com",
        password: "1234",
        phoneNumber: "0187654353",
        role: "Admin",
        bank_account_number: "2022331054",
        bank_secret: "m20225t"
      });
      console.log("✅ Default admin created successfully!");
      console.log(`   📧 Email: admin@test.com | 🔑 Password: 1234`);
    } else {
      console.log(`⚪ ${adminCount} admin(s) already exist. Skipping seed.`);
    }
  } catch (error) {
    console.error("❌ Error seeding default admin:", error.message);
  }
};

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`port is listening at ${process.env.PORT || 5000}`);
      // Seed bank accounts and admin after server starts
      seedBankAccounts();
      seedDefaultAdmin();
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed", error);
  });