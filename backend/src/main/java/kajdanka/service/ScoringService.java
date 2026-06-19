package kajdanka.service;

import kajdanka.entity.EventType;
import kajdanka.entity.Song;
import kajdanka.entity.SongScore;
import kajdanka.repository.EventLogRepository;
import kajdanka.repository.EventLogRepository.EventAggregateRow;
import kajdanka.repository.SongScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private static final double WEIGHT_VIEW_ANON   = 1.0;
    private static final double WEIGHT_VIEW_AUTH   = 2.0;
    private static final double WEIGHT_LIKE        = 5.0;
    private static final double WEIGHT_COMMENT     = 4.0;
    private static final double WEIGHT_PRINT       = 3.0;
    private static final double WEIGHT_SEARCH_CLICK = 2.0;

    private final EventLogRepository eventLogRepository;
    private final SongScoreRepository songScoreRepository;
    private final EntityManager entityManager;

    @Scheduled(fixedRateString = "${app.scoring.interval-ms:3600000}")
    @Transactional
    public void recompute() {
        recomputeTrending();
        recomputeAllTime();
    }

    private void recomputeTrending() {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<EventAggregateRow> rows = eventLogRepository.aggregateSince(since);
        upsertScores(aggregate(rows), false);
    }

    private void recomputeAllTime() {
        List<EventAggregateRow> rows = eventLogRepository.aggregateAllTime();
        upsertScores(aggregate(rows), true);
    }

    private Map<Long, Double> aggregate(List<EventAggregateRow> rows) {
        Map<Long, Double> scores = new HashMap<>();
        for (EventAggregateRow row : rows) {
            double contribution;
            if (row.getEventType() == EventType.VIEW) {
                contribution = row.getAnonCount() * WEIGHT_VIEW_ANON
                        + row.getAuthCount() * WEIGHT_VIEW_AUTH;
            } else {
                double weight = resolveWeight(row.getEventType());
                contribution = (row.getAnonCount() + row.getAuthCount()) * weight;
            }
            scores.merge(row.getSongId(), contribution, Double::sum);
        }
        return scores;
    }

    private double resolveWeight(EventType eventType) {
        return switch (eventType) {
            case VIEW         -> WEIGHT_VIEW_ANON;
            case LIKE         -> WEIGHT_LIKE;
            case COMMENT      -> WEIGHT_COMMENT;
            case PRINT        -> WEIGHT_PRINT;
            case SEARCH_CLICK -> WEIGHT_SEARCH_CLICK;
        };
    }

    private void upsertScores(Map<Long, Double> scores, boolean allTime) {
        for (Map.Entry<Long, Double> entry : scores.entrySet()) {
            Long songId = entry.getKey();
            double score = entry.getValue();

            SongScore existing = songScoreRepository.findById(songId).orElse(null);
            if (existing == null) {
                Song songRef = entityManager.getReference(Song.class, songId);
                SongScore newScore = SongScore.builder()
                        .song(songRef)
                        .trendingScore(allTime ? 0.0 : score)
                        .allTimeScore(allTime ? score : 0.0)
                        .updatedAt(LocalDateTime.now())
                        .build();
                songScoreRepository.save(newScore);
            } else {
                if (allTime) {
                    existing.setAllTimeScore(score);
                } else {
                    existing.setTrendingScore(score);
                }
                existing.setUpdatedAt(LocalDateTime.now());
            }
        }
    }
}