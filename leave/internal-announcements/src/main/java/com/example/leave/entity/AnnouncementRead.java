package com.example.leave.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "announcement_reads",
        uniqueConstraints = {
                @UniqueConstraint(
                    name = "uk_announcement_read_employee",
                    columnNames = {"announcement_id", "employee_id"}
                )
        }
    )

@Getter
@Setter
public class AnnouncementRead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "read_at", nullable = false, updatable = false)
    private OffsetDateTime readAt;

    public AnnouncementRead() {
    }

    public AnnouncementRead(
            Announcement announcement,
            Employee employee
    ) {
        this.announcement = announcement;
        this.employee = employee;
    }

    @PrePersist
    protected void onCreate() {
        if (readAt == null) {
            readAt = OffsetDateTime.now();
        }
    }
}
