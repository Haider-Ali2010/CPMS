const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Store the original res.json function
    const originalJson = res.json;

    // Override res.json method
    res.json = function(data) {
      // Restore the original json method
      res.json = originalJson;

      // Only set resourceId if it's a valid ObjectId
      let resourceId = undefined;
      if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) {
        resourceId = req.params.id;
      }

      // Create audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action,
        resource,
        resourceId,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body,
          statusCode: res.statusCode
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Save audit log asynchronously
      auditLog.save().catch(err => {
        console.error('Error saving audit log:', err);
      });

      // Call the original res.json
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger; 