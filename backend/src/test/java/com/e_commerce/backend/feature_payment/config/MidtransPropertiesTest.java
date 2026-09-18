package com.e_commerce.backend.feature_payment.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MidtransPropertiesTest {

    @Test
    @DisplayName("Should have safe default values for sandbox environment")
    void testDefaultValues() {
        MidtransProperties props = new MidtransProperties();

        assertEquals("", props.getServerKey());
        assertEquals("", props.getClientKey());
        assertEquals("", props.getMerchantId());
        assertFalse(props.isProduction(), "Default environment must be sandbox (isProduction = false)");
        assertEquals("https://app.sandbox.midtrans.com/snap/snap.js", props.getSnapUrl());
        assertEquals("https://api.sandbox.midtrans.com", props.getApiUrl());
    }

    @Test
    @DisplayName("Should set and get custom properties correctly")
    void testSettersAndGetters() {
        MidtransProperties props = new MidtransProperties();

        props.setServerKey("SB-Mid-server-test-123");
        props.setClientKey("SB-Mid-client-test-456");
        props.setMerchantId("M-789");
        props.setProduction(false);
        props.setSnapUrl("https://app.sandbox.midtrans.com/snap/snap.js");
        props.setApiUrl("https://api.sandbox.midtrans.com");

        assertEquals("SB-Mid-server-test-123", props.getServerKey());
        assertEquals("SB-Mid-client-test-456", props.getClientKey());
        assertEquals("M-789", props.getMerchantId());
        assertFalse(props.isProduction());
        assertEquals("https://app.sandbox.midtrans.com/snap/snap.js", props.getSnapUrl());
        assertEquals("https://api.sandbox.midtrans.com", props.getApiUrl());

        props.setIsProduction(true);
        assertTrue(props.isProduction());
    }
}
