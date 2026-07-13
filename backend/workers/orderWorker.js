require('dotenv').config();

const { Worker, QueueEvents } = require('bullmq');

const prisma = require('../src/config/prisma');
const { connection } = require('../src/config/queue');
const { sendOrderEmail } = require('../src/services/emailService');
const { createAuditLog } = require('../src/services/auditService');

const queueName = 'orderQueue';
const lowStockThreshold = Number.parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10);
const workerConcurrency = Number.parseInt(process.env.ORDER_WORKER_CONCURRENCY || '5', 10);

const queueEvents = new QueueEvents(queueName, {
  connection
});

queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job completed: ${jobId}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job failed: ${jobId}`, failedReason);
});

const worker = new Worker(
  queueName,
  async (job) => {
    const {
      orderId,
      userId,
      userEmail,
      userName,
      productId,
      productName,
      quantity,
      totalPrice
    } = job.data;

    console.log(`Processing job ${job.id} for order ${orderId}`);

    try {
      await createAuditLog({
        userId,
        action: 'PROCESS',
        entity: 'ORDER_JOB',
        entityId: orderId,
        description: `Processing background job ${job.id} for order ${orderId}`
      });
    } catch (auditError) {
      console.error('Failed to write job processing audit log', auditError);
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });

    if (product && product.stock < lowStockThreshold) {
      console.log(`Low stock alert for ${product.name}: ${product.stock} remaining`);

      try {
        await createAuditLog({
          userId,
          action: 'NOTIFY',
          entity: 'PRODUCT',
          entityId: product.id,
          description: `Low stock alert: ${product.name} has ${product.stock} items remaining`
        });
      } catch (auditError) {
        console.error('Failed to write low stock audit log', auditError);
      }
    }

    await sendOrderEmail(
      userEmail,
      userName,
      productName,
      quantity,
      totalPrice
    );

    try {
      await createAuditLog({
        userId,
        action: 'COMPLETE',
        entity: 'ORDER_JOB',
        entityId: orderId,
        description: `Completed background job ${job.id} for order ${orderId}`
      });
    } catch (auditError) {
      console.error('Failed to write job completion audit log', auditError);
    }
  },
  {
    connection,
    concurrency: workerConcurrency
  }
);

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

console.log('Worker started and listening for orderQueue jobs...');
