import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle loan subscriptions
    socket.on('subscribe_loan', (loanId: string) => {
      socket.join(`loan_${loanId}`);
      console.log(`Client ${socket.id} subscribed to loan ${loanId}`);
    });

    socket.on('subscribe_user', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`Client ${socket.id} subscribed to user ${userId}`);
    });

    socket.on('unsubscribe_loan', (loanId: string) => {
      socket.leave(`loan_${loanId}`);
      console.log(`Client ${socket.id} unsubscribed from loan ${loanId}`);
    });

    socket.on('unsubscribe_user', (userId: string) => {
      socket.leave(`user_${userId}`);
      console.log(`Client ${socket.id} unsubscribed from user ${userId}`);
    });

    // Handle payment notifications
    socket.on('payment_made', (paymentData: { loanId: string; amount: number; userId: string }) => {
      // Broadcast to loan subscribers
      io.to(`loan_${paymentData.loanId}`).emit('payment_received', {
        loanId: paymentData.loanId,
        amount: paymentData.amount,
        timestamp: new Date().toISOString()
      });

      // Broadcast to user subscribers
      io.to(`user_${paymentData.userId}`).emit('user_payment_received', {
        loanId: paymentData.loanId,
        amount: paymentData.amount,
        timestamp: new Date().toISOString()
      });
    });

    // Handle loan status updates
    socket.on('loan_status_update', (updateData: { loanId: string; status: string; userId: string }) => {
      // Broadcast to loan subscribers
      io.to(`loan_${updateData.loanId}`).emit('loan_update', {
        id: updateData.loanId,
        status: updateData.status,
        lastUpdated: new Date().toISOString()
      });

      // Broadcast to user subscribers
      io.to(`user_${updateData.userId}`).emit('user_loan_update', {
        id: updateData.loanId,
        status: updateData.status,
        lastUpdated: new Date().toISOString()
      });
    });

    // Handle messages (legacy)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Loan Status WebSocket Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper functions to emit events from API routes
export const emitLoanUpdate = (io: Server, loanId: string, userId: string, updateData: any) => {
  io.to(`loan_${loanId}`).emit('loan_update', {
    id: loanId,
    ...updateData,
    lastUpdated: new Date().toISOString()
  });

  io.to(`user_${userId}`).emit('user_loan_update', {
    id: loanId,
    ...updateData,
    lastUpdated: new Date().toISOString()
  });
};

export const emitPaymentReceived = (io: Server, loanId: string, userId: string, paymentData: any) => {
  io.to(`loan_${loanId}`).emit('payment_received', {
    loanId,
    ...paymentData,
    timestamp: new Date().toISOString()
  });

  io.to(`user_${userId}`).emit('user_payment_received', {
    loanId,
    ...paymentData,
    timestamp: new Date().toISOString()
  });
};