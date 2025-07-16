const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({

    auditLog_id: {
      type: String,
      required: true,
      unique: true,
      primaryKey: true,
    },
  action_by: {
    type: String,
    ref: 'Admin',
    required: true,
  },
  target: {
    type: String,
    ref: 'User',
    required: true,
    trim: true,
    lowercase: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  details: {
     type: Schema.Types.Mixed 
    },
  ip_address: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('auditLog', auditLogSchema);
