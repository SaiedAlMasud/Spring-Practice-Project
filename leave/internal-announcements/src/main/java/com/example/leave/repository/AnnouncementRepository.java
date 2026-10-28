
package com.example.leave.repository;

import com.example.leave.entity.Announcement;
import com.example.leave.entity.AnnouncementType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface AnnouncementRepository
        extends JpaRepository<Announcement, Long> {

    // 1. Find announcements visible to a particular department
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
              COALESCE(:search, '') = ''
              OR LOWER(a.title) LIKE
                 LOWER(CONCAT('%', COALESCE(:search, ''), '%'))
              OR LOWER(a.body) LIKE
                 LOWER(CONCAT('%', COALESCE(:search, ''), '%'))
          )
        """)
    Page<Announcement> findVisibleAnnouncements(
            @Param("departmentId") Long departmentId,
            @Param("now") OffsetDateTime now,
            @Param("type") AnnouncementType type,
            @Param("search") String search,
            Pageable pageable
    );

    // 2. Find announcements for management with optional type filter
    @Query("""
        SELECT a FROM Announcement a
        WHERE (:filterByType = false OR a.type = :type)
          AND (
              LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(a.body) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        """)
    Page<Announcement> findAllForManagement(
            @Param("filterByType") boolean filterByType,
            @Param("type") AnnouncementType type,
            @Param("search") String search,
            Pageable pageable
    );

    // 3. Count archived announcements
    long countByArchivedTrue();

    // 4. Count non-archived announcements that have not expired
    long countByArchivedFalseAndExpiresAtAfter(
            OffsetDateTime now
    );

    // 5. Count non-archived announcements that have expired
    long countByArchivedFalseAndExpiresAtLessThanEqual(
            OffsetDateTime now
    );

    // 6. Count announcements by type
    long countByType(AnnouncementType type);

    // 7. Get the five most recently created announcements
    List<Announcement> findTop5ByOrderByCreatedAtDesc();

    // 8. Get the five latest active announcements of a particular type
    List<Announcement>
    findTop5ByTypeAndArchivedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            AnnouncementType type,
            OffsetDateTime now
    );

    // 9. Get creation dates since a specified date and time
    @Query("""
        SELECT a.createdAt
        FROM Announcement a
        WHERE a.createdAt >= :since
        """)
    List<OffsetDateTime> findCreatedAtSince(
            @Param("since") OffsetDateTime since
    );

    // 10. Get active announcements visible to a particular department
    @Query("""
        SELECT a FROM Announcement a
        WHERE a.archived = false
          AND a.expiresAt > :now
          AND (
              a.targetDepartment IS NULL
              OR a.targetDepartment.id = :departmentId
          )
        ORDER BY a.createdAt DESC
        """)
    List<Announcement> findActiveVisibleForDepartment(
            @Param("departmentId") Long departmentId,
            @Param("now") OffsetDateTime now
    );
}
