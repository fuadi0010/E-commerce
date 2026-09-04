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
            log.warn("Mailtrap API token is not configured (mailtrap.token is empty). MailtrapClient will not be initialized.");
            return null;
        }
        try {
            MailtrapConfig config = new MailtrapConfig.Builder()
                    .token(token.trim())
                    .build();
            return MailtrapClientFactory.createMailtrapClient(config);
        } catch (Exception e) {
            log.error("Failed to initialize MailtrapClient: {}", e.getMessage());
            return null;
        }
    }
}
