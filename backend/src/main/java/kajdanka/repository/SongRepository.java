package kajdanka.repository;

import kajdanka.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import kajdanka.entity.Song;

import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {

    @Query("""
        SELECT s FROM Song s
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.artist) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:genre IS NULL OR :genre = '' OR LOWER(s.genre) = LOWER(:genre))
          AND (:artist IS NULL OR :artist = '' OR
               LOWER(s.artist) LIKE LOWER(CONCAT('%', :artist, '%')))
          AND s.isPrivate = false
        ORDER BY s.createdAt DESC
        """)
    Page<Song> search(
            @Param("search") String search,
            @Param("genre") String genre,
            @Param("artist") String artist,
            Pageable pageable
    );

    @Query("""
        SELECT s FROM Song s
        LEFT JOIN s.likes l
        GROUP BY s.id
        ORDER BY COUNT(l) DESC, s.createdAt DESC
        """)
    List<Song> findFeatured(Pageable pageable);

    @Query("SELECT DISTINCT s.genre FROM Song s WHERE s.genre IS NOT NULL ORDER BY s.genre")
    List<String> findAllGenres();

    @Modifying
    @Query("UPDATE Song s SET s.viewCount = s.viewCount + 1 WHERE s.id = :id")
    void incrementViewCount(@Param("id") Long id);

    List<Song> findByUserOrderByCreatedAtDesc(User user);

    List<Song> findAllByArtist(String artist);
}
