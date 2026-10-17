package com.example.leave.repository;

import com.example.leave.entity.Announcement;
import com.example.leave.entity.AnnouncementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;


public interface AnnouncementRepository
    extends JpaRepository<Announcement, Long> {

    @Query("""
    SELECT a FROM Announcement a
    WHERE a.archived = false
      AND a.expiresAt > :now
      AND (
          a.targetDepartment IS NULL
          OR a.targetDepartment.id = :departmentId
      )
      AND (:type IS NULL OR a.type = :type)
      AND (
          :search IS NULL
          OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(a.body) LIKE LOWER(CONCAT('%', :search, '%'))
      )
    """)
    Page<Announcement> findVisibleAnnouncements(
            @Param("departmentId") Long departmentId,
            @Param("now") OffsetDateTime now,
            @Param("type") AnnouncementType type,
            @Param("search") String search,
            Pageable pageable
    );

}
