import dotenv from 'dotenv';
dotenv.config();
import connectDb from './db/index.js';
import app from './app.js';
import { BankAccount} from './model/bankAccount.model.js';  
import { bankAccountData } from './utils/bankAccountData.js'; 



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



connectDb()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`port is listening at ${process.env.PORT || 5000}`);
      // Seed bank accounts after server starts
      seedBankAccounts();   
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed", error);
  });