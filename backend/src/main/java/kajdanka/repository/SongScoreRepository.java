package kajdanka.repository;

import kajdanka.entity.SongScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SongScoreRepository extends JpaRepository<SongScore, Long> {

    @Query("""
        SELECT s FROM SongScore s
        JOIN FETCH s.song sg
        WHERE sg.isPrivate = false
        ORDER BY s.trendingScore DESC
        """)
    Page<SongScore> findTrending(Pageable pageable);

    @Query("""
        SELECT s FROM SongScore s
        JOIN FETCH s.song sg
        WHERE sg.isPrivate = false
        ORDER BY s.allTimeScore DESC
        """)
    Page<SongScore> findAllTimeTop(Pageable pageable);
}