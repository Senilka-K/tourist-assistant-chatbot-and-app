const mongoose = require("mongoose");

const emergenciesSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    onGoingEmergency: { type: Boolean, default: true },
    dateTimeDeclared: { type: Date, default: Date.now },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    message: [{ type: String, required: false }],
});

const Emergency = mongoose.model("Emergency", emergenciesSchema);

module.exports = Emergency;
