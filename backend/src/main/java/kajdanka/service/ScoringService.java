package kajdanka.service;

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
            double contribution = row.getAnonCount() * EventWeights.weightFor(row.getEventType(), false)
                    + row.getAuthCount() * EventWeights.weightFor(row.getEventType(), true);
            scores.merge(row.getSongId(), contribution, Double::sum);
        }
        return scores;
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