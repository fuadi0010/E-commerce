package com.e_commerce.backend.config;

import com.e_commerce.backend.common.entity.BaseEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.auditing.DateTimeProvider;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAccessor;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JPA Auditing & Timezone Tests")
class JpaAuditingConfigTest {

    private final JpaAuditingConfig auditingConfig = new JpaAuditingConfig();

    static class TestEntity extends BaseEntity {
        public void triggerCreate() {
            onCreate();
        }
        public void triggerUpdate() {
            onUpdate();
        }
    }

    @Test
    @DisplayName("auditingDateTimeProvider: Mengembalikan ZonedDateTime dalam zona UTC")
    void auditingDateTimeProvider_ReturnsUtcZonedDateTime() {
        DateTimeProvider provider = auditingConfig.auditingDateTimeProvider();
        assertNotNull(provider);

        Optional<TemporalAccessor> nowOpt = provider.getNow();
        assertTrue(nowOpt.isPresent());

        TemporalAccessor temporal = nowOpt.get();
        assertInstanceOf(ZonedDateTime.class, temporal, "Waktu harus berupa java.time.ZonedDateTime");

        ZonedDateTime zdt = (ZonedDateTime) temporal;
        assertEquals(ZoneOffset.UTC, zdt.getZone(), "Zone harus selalu UTC");
    }

    @Test
    @DisplayName("BaseEntity: @PrePersist menginisialisasi createdAt dan updatedAt dalam UTC")
    void baseEntity_PrePersist_InitializesTimestamps() {
        TestEntity entity = new TestEntity();
        assertNull(entity.getCreatedAt());
        assertNull(entity.getUpdatedAt());

        entity.triggerCreate();

        assertNotNull(entity.getCreatedAt());
        assertNotNull(entity.getUpdatedAt());
        assertEquals(ZoneOffset.UTC, entity.getCreatedAt().getZone());
        assertEquals(ZoneOffset.UTC, entity.getUpdatedAt().getZone());
    }

    @Test
    @DisplayName("BaseEntity: @PreUpdate memperbarui updatedAt dalam UTC")
    void baseEntity_PreUpdate_UpdatesTimestamp() throws InterruptedException {
        TestEntity entity = new TestEntity();
        entity.triggerCreate();
        ZonedDateTime initialUpdated = entity.getUpdatedAt();

        Thread.sleep(10);
        entity.triggerUpdate();

        assertNotNull(entity.getUpdatedAt());
        assertTrue(entity.getUpdatedAt().isAfter(initialUpdated) || entity.getUpdatedAt().isEqual(initialUpdated));
        assertEquals(ZoneOffset.UTC, entity.getUpdatedAt().getZone());
    }
}
