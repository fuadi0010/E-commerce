package com.e_commerce.backend.feature_payment.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentStatusTest {

    @Test
    @DisplayName("isSuccess returns true only for SETTLEMENT and CAPTURE")
    void testIsSuccess() {
        assertTrue(PaymentStatus.SETTLEMENT.isSuccess());
        assertTrue(PaymentStatus.CAPTURE.isSuccess());

        assertFalse(PaymentStatus.PENDING.isSuccess());
        assertFalse(PaymentStatus.DENY.isSuccess());
        assertFalse(PaymentStatus.CANCEL.isSuccess());
        assertFalse(PaymentStatus.EXPIRE.isSuccess());
        assertFalse(PaymentStatus.FAILURE.isSuccess());
        assertFalse(PaymentStatus.REFUND.isSuccess());
    }

    @Test
    @DisplayName("isTerminal returns true for terminal states and false for PENDING")
    void testIsTerminal() {
        assertFalse(PaymentStatus.PENDING.isTerminal());

        assertTrue(PaymentStatus.SETTLEMENT.isTerminal());
        assertTrue(PaymentStatus.DENY.isTerminal());
        assertTrue(PaymentStatus.CANCEL.isTerminal());
        assertTrue(PaymentStatus.EXPIRE.isTerminal());
        assertTrue(PaymentStatus.FAILURE.isTerminal());
        assertTrue(PaymentStatus.REFUND.isTerminal());
    }
}
