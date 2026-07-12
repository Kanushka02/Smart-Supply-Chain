const prisma = require('../config/prisma');

exports.createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  description
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      description
    }
  });
};