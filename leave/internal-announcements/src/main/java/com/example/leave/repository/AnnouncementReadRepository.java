package com.example.leave.repository;

import com.example.leave.entity.AnnouncementRead;
import com.example.leave.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnnouncementReadRepository
    extends JpaRepository<AnnouncementRead, Long> {
    boolean existsByAnnouncement_IdAndEmployee_Id(
            Long announcementId,
            Long employeeId
    );

    @Query("SELECT r.announcement.id FROM AnnouncementRead r WHERE r.employee.id = :employeeId")
    List<Long> findAcknowledgedAnnouncementIds(
            @Param("employeeId") Long employeeId
    );

    long countByAnnouncement_Id(Long announcementId);
    List<AnnouncementRead> findByAnnouncement_Id(Long announcementId);

    long countByAnnouncement_IdAndEmployee_Role(
            Long announcementId,
            Role role
    );
}
