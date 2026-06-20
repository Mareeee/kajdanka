package kajdanka.repository;

import kajdanka.entity.SongViewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SongViewHistoryRepository extends JpaRepository<SongViewHistory, Long> {

    @Query("""
        SELECT h FROM SongViewHistory h
        WHERE h.user.id = :userId AND h.song.id = :songId
        """)
    Optional<SongViewHistory> findByUserIdAndSongId(
            @Param("userId") Long userId,
            @Param("songId") Long songId
    );

    @Query("""
        SELECT h FROM SongViewHistory h
        WHERE h.anonToken = :anonToken AND h.song.id = :songId
        """)
    Optional<SongViewHistory> findByAnonTokenAndSongId(
            @Param("anonToken") String anonToken,
            @Param("songId") Long songId
    );

    @Query("""
        SELECT h FROM SongViewHistory h
        JOIN FETCH h.song s
        WHERE h.user.id = :userId
        ORDER BY h.viewedAt DESC
        """)
    List<SongViewHistory> findRecentByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT h FROM SongViewHistory h
        JOIN FETCH h.song s
        WHERE h.anonToken = :anonToken
        ORDER BY h.viewedAt DESC
        """)
    List<SongViewHistory> findRecentByAnonToken(@Param("anonToken") String anonToken);

    @Modifying
    @Query("DELETE FROM SongViewHistory h WHERE h.id = :id")
    void deleteById(@Param("id") Long id);
}