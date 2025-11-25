// controllers/admin.controller.js

import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponce.js";
import ApiError from "../utils/ApiError.js";
import { Course } from "../model/course.model.js";
import { User } from "../model/user.model.js";
import { Transaction } from "../model/transaction.model.js";
import { BankAccount } from "../model/bankAccount.model.js";

const getPlatformStats = asyncHandler(async (req, res) => {
  // verifyRole("Admin") already applied in route
  // No need to check again — but keep for safety
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Access denied. Admin only.");
  }

  const adminAccountNumber = "2022331054";

  // === 1. Basic Stats ===
  const [
    totalCourses,
    totalLearners,
    totalInstructors,
    totalEnrollments,
    adminBank
  ] = await Promise.all([
    Course.countDocuments(),
    User.countDocuments({ role: "Learner" }),
    User.countDocuments({ role: "Instructor" }),
    Transaction.countDocuments({ type: "PURCHASE", status: "COMPLETED" }),
    BankAccount.findOne({ account_number: adminAccountNumber })
  ]);

  const adminIncome = adminBank?.current_balance || 0;
  const totalRevenue = adminIncome * 5; // 20% admin → 100% = 5x

  // === 2. Monthly Revenue Chart (Last 12 Months) ===
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

  const monthlyRevenue = await Transaction.aggregate([
    {
      $match: {
        type: "PURCHASE",
        status: "COMPLETED",
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    },
    {
      $project: {
        month: {
          $dateToString: {
            format: "%b %Y",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1
              }
            }
          }
        },
        revenue: { $multiply: ["$totalAmount", 0.2] }, // Admin 20%
        enrollments: "$count"
      }
    }
  ]);

  // Fill missing months with 0
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const current = new Date();
  const chartData = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(current.getMonth() - i);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const found = monthlyRevenue.find(item => item.month === monthKey);
    chartData.push({
      month: monthKey,
      revenue: found ? Math.round(found.revenue) : 0,
      enrollments: found ? found.enrollments : 0
    });
  }

  // === Final Response ===
  const stats = {
    overview: {
      totalCourses,
      totalLearners,
      totalInstructors,
      totalEnrollments,
      totalRevenue,
      adminIncome,
      platformCommission: "20%"
    },
    monthlyRevenueChart: chartData,
    lastUpdated: new Date().toISOString()
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Admin dashboard stats fetched successfully")
  );
});

export { getPlatformStats };