'use client';

import React, { useState } from 'react';
import styles from './MockCheckoutModal.module.css';

interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MockCheckoutModal({ isOpen, onClose, onSuccess }: MockCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulate network request for payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Razorpay (Mock)</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.orderSummary}>
            <p><strong>Meridian CV Premium</strong></p>
            <p className={styles.price}>₹49.00</p>
          </div>
          
          <p className={styles.description}>
            Unlock unlimited AI generation, ATS analysis, and PDF parsing.
          </p>

          <button 
            className={styles.payBtn} 
            onClick={handleSimulatePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Simulate Payment Success'}
          </button>
          
          <button 
            className={styles.failBtn} 
            onClick={onClose}
            disabled={isProcessing}
          >
            Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  );
}
