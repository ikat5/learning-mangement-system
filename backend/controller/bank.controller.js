// bank.controller.js

import { BankAccount } from "../model/bankAccount.model.js";
import { User } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";

const ADMIN_ACCOUNT = "2022331054";

export const executeImmediatePayment = async ({
    learnerId,
    learnerBankAccount,
    secretKey,
    instructorBankAccount,
    amount
}) => {
    const learner = await User.findById(learnerId);
    if (learner.bank_account_number !== learnerBankAccount || learner.bank_secret !== secretKey) {
        throw new ApiError(400, "Invalid bank credentials");
    }

    const [learnerAcc, instructorAcc, adminAcc] = await Promise.all([
        BankAccount.findOne({ account_number: learnerBankAccount }),
        BankAccount.findOne({ account_number: instructorBankAccount }),
        BankAccount.findOne({ account_number: ADMIN_ACCOUNT })
    ]);

    if (learnerAcc.current_balance < amount) {
        throw new ApiError(400, "Insufficient balance");
    }

    const adminShare = amount * 0.2;
    const instructorShare = amount * 0.8;

    learnerAcc.current_balance -= amount;
    instructorAcc.current_balance += instructorShare;
    adminAcc.current_balance += adminShare;

    await Promise.all([
        learnerAcc.save({ validateBeforeSave: false }),
        instructorAcc.save({ validateBeforeSave: false }),
        adminAcc.save({ validateBeforeSave: false })
    ]);

    // Update instructor total earnings
    const instructor = await User.findOne({ bank_account_number: instructorBankAccount });
    if (instructor?.role === "Instructor") {
        instructor.total_earnings += instructorShare;
        await instructor.save();
    }
};