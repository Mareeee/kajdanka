package kajdanka.repository;

import kajdanka.entity.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    @Query("""
        SELECT e.song.id AS songId, e.eventType AS eventType,
               SUM(CASE WHEN e.user IS NULL THEN 1 ELSE 0 END) AS anonCount,
               SUM(CASE WHEN e.user IS NOT NULL THEN 1 ELSE 0 END) AS authCount
        FROM EventLog e
        WHERE e.createdAt >= :since
        GROUP BY e.song.id, e.eventType
        """)
    List<EventAggregateRow> aggregateSince(@Param("since") LocalDateTime since);

    @Query("""
        SELECT e.song.id AS songId, e.eventType AS eventType,
               SUM(CASE WHEN e.user IS NULL THEN 1 ELSE 0 END) AS anonCount,
               SUM(CASE WHEN e.user IS NOT NULL THEN 1 ELSE 0 END) AS authCount
        FROM EventLog e
        GROUP BY e.song.id, e.eventType
        """)
    List<EventAggregateRow> aggregateAllTime();

    @Query("""
        SELECT e.song.genre AS genre, e.song.artist AS artist, COUNT(e) AS hits
        FROM EventLog e
        WHERE e.user.id = :userId AND e.createdAt >= :since
        GROUP BY e.song.genre, e.song.artist
        ORDER BY COUNT(e) DESC
        """)
    List<GenreArtistAggregateRow> findTopGenresAndArtistsForUser(
            @Param("userId") Long userId,
            @Param("since") LocalDateTime since
    );

    @Query("""
        SELECT e.song.genre AS genre, e.song.artist AS artist, COUNT(e) AS hits
        FROM EventLog e
        WHERE e.anonToken = :anonToken AND e.createdAt >= :since
        GROUP BY e.song.genre, e.song.artist
        ORDER BY COUNT(e) DESC
        """)
    List<GenreArtistAggregateRow> findTopGenresAndArtistsForGuest(
            @Param("anonToken") String anonToken,
            @Param("since") LocalDateTime since
    );

    interface EventAggregateRow {
        Long getSongId();
        kajdanka.entity.EventType getEventType();
        Long getAnonCount();
        Long getAuthCount();
    }

    interface GenreArtistAggregateRow {
        String getGenre();
        String getArtist();
        Long getHits();
    }
}