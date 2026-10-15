package com.example.leave.repository;

import com.example.leave.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface AnnouncementRepository
    extends JpaRepository<Announcement, Long> {
    @Query("""
    SELECT a FROM Announcement a 
    WHERE (:type IS null OR a.type = :type)
    AND (
        :search IS NULL 
        OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%'))
        OR LOWER(a.body) LIKE LOWER(CONCAT('%',:search,'%'))
    ) 
""")
    Page<Announcement> searchAnnouncements(
            @Param("type") Announcement type,
            @Param("search") String search,
            Pageable pageable
    );
}
