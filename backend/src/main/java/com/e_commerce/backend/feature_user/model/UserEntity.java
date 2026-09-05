package com.e_commerce.backend.feature_user.model;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;

import java.util.UUID;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import com.e_commerce.backend.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@lombok.EqualsAndHashCode(callSuper = false)
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class UserEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password_hash;

    @Column(name = "deleted_at")
    private ZonedDateTime deletedAt;

    // PR REVIEW: Menggunakan FetchType.EAGER karena role selalu dibutuhkan 
    // oleh Spring Security saat load UserDetails, untuk mencegah N+1 / LazyInitializationException di luar transaksi.

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles", // Sesuai dengan tabel ketiga Anda di SQL
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id")
    )
    private Set<Role> roles = new HashSet<>();
}
