package com.e_commerce.backend.feature_payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Konfigurasi properties untuk Midtrans Payment Gateway.
 * Memetakan nilai prefix 'midtrans' dari application.properties / .env.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "midtrans")
public class MidtransProperties {

    /**
     * Midtrans Server Key (Rahasia - HANYA untuk backend, JANGAN diekspos ke publik / frontend).
     */
    private String serverKey = "";

    /**
     * Midtrans Client Key (Publik - digunakan oleh frontend untuk integrasi Snap.js).
     */
    private String clientKey = "";

    /**
     * Merchant ID dari dashboard Midtrans.
     */
    private String merchantId = "";

    /**
     * Flag environment: false untuk Sandbox, true untuk Production.
     * Secara default HARUS false (Sandbox).
     */
    private boolean isProduction = false;

    /**
     * URL script Snap.js.
     * Default Sandbox: https://app.sandbox.midtrans.com/snap/snap.js
     */
    private String snapUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    /**
     * URL API Core Midtrans.
     * Default Sandbox: https://api.sandbox.midtrans.com
     */
    private String apiUrl = "https://api.sandbox.midtrans.com";

    public boolean isProduction() {
        return isProduction;
    }

    public void setProduction(boolean production) {
        this.isProduction = production;
    }

    public void setIsProduction(boolean production) {
        this.isProduction = production;
    }
}
