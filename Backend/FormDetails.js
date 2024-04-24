const mongoose = require("mongoose");

const formDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User model
  name: { type: String, required: true },
  arriveDate: { type: String, required: true },
  district: { type: String, required: true },
  contactNo: { type: String, required: true },
  passportId: { type: String, required: true },
  emergencyNo: { type: String, required: false },
  comment: { type: String, required: false },
  likesTracking: { type: String, required: false },
});

const FormDetail = mongoose.model("FormDetail", formDetailsSchema);

module.exports = FormDetail;
