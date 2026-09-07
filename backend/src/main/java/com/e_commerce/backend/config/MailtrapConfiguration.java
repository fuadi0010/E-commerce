package com.e_commerce.backend.config;

import io.mailtrap.client.MailtrapClient;
import io.mailtrap.config.MailtrapConfig;
import io.mailtrap.factory.MailtrapClientFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MailtrapConfiguration {

    @Value("${mailtrap.token:}")
    private String token;

    @Bean
    public MailtrapClient mailtrapClient() {
        if (token == null || token.trim().isEmpty()) {
            log.info("Mailtrap API token is not configured. Live email delivery is disabled. Fallback simulation mode will be used if enabled.");
            return null;
        }
        try {
            MailtrapConfig config = new MailtrapConfig.Builder()
                    .token(token.trim())
                    .build();
            log.info("MailtrapClient initialized successfully with configured token.");
            return MailtrapClientFactory.createMailtrapClient(config);
        } catch (Exception e) {
            log.error("Failed to initialize MailtrapClient: {}", e.getMessage());
            return null;
        }
    }
}
