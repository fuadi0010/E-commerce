package com.e_commerce.backend;

import io.mailtrap.client.MailtrapClient;
import io.mailtrap.config.MailtrapConfig;
import io.mailtrap.factory.MailtrapClientFactory;
import io.mailtrap.model.request.emails.Address;
import io.mailtrap.model.request.emails.MailtrapMail;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

public class MailtrapLiveSendTest {

    @Test
    @Disabled("Manual live test: un-comment/remove @Disabled when performing manual Mailtrap verification")
    @DisplayName("Send live email using Mailtrap API Token")
    void sendTestEmail() {
        String token = System.getenv("MAILTRAP_API_TOKEN");
        if (token == null || token.isBlank()) {
            token = "2d3586e24ee1acad4a73d5c5dbf973a5";
        }

        MailtrapConfig config = new MailtrapConfig.Builder()
                .token(token)
                .build();

        MailtrapClient client = MailtrapClientFactory.createMailtrapClient(config);

        MailtrapMail mail = MailtrapMail.builder()
                .from(new Address("hello@demomailtrap.co", "Mailtrap Test"))
                .to(List.of(new Address("borkatganteng727@gmail.com")))
                .subject("Test Email from E-Commerce App")
                .text("Halo! Ini adalah email uji coba Mailtrap Java SDK yang berhasil dikonfigurasi.")
                .category("Integration Test")
                .build();

        try {
            Object response = client.send(mail);
            System.out.println("MAILTRAP_LIVE_RESPONSE: " + response);
        } catch (Exception e) {
            System.out.println("MAILTRAP_LIVE_ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
