package kajdanka.service;

import kajdanka.dto.response.SongSummaryDto;
import kajdanka.entity.Song;
import kajdanka.entity.SongScore;
import kajdanka.repository.EventLogRepository;
import kajdanka.repository.EventLogRepository.SongEventAggregateRow;
import kajdanka.repository.SongRepository;
import kajdanka.repository.SongScoreRepository;
import kajdanka.security.CurrentActor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private static final int PREFERENCE_LOOKBACK_DAYS = 30;
    private static final int SEED_LIMIT = 5;
    private static final int CANDIDATE_FETCH_SIZE = 40;
    private static final int RESULT_LIMIT = 10;

    private final EventLogRepository eventLogRepository;
    private final SongRepository songRepository;
    private final SongScoreRepository songScoreRepository;

    public List<SongSummaryDto> recommend() {
        Long userId = CurrentActor.getUserId();
        String anonToken = CurrentActor.getAnonToken();

        LinkedHashSet<Long> collected = new LinkedHashSet<>();
        List<Song> result = new ArrayList<>();

        Map<Long, Double> personalScores = computePersonalScores(userId, anonToken);
        if (!personalScores.isEmpty()) {
            addPersonalCandidates(personalScores, collected, result);
        }
        if (result.size() < RESULT_LIMIT) {
            addPopularCandidates(collected, result);
        }
        if (result.size() < RESULT_LIMIT) {
            addFeaturedCandidates(collected, result);
        }

        return result.stream()
                .limit(RESULT_LIMIT)
                .map(this::toSummaryDto)
                .toList();
    }

    private Map<Long, Double> computePersonalScores(Long userId, String anonToken) {
        LocalDateTime since = LocalDateTime.now().minusDays(PREFERENCE_LOOKBACK_DAYS);
        boolean authenticated = userId != null;

        List<SongEventAggregateRow> rows;
        if (userId != null) {
            rows = eventLogRepository.aggregateForUser(userId, since);
        } else if (anonToken != null) {
            rows = eventLogRepository.aggregateForGuest(anonToken, since);
        } else {
            return Map.of();
        }

        Map<Long, Double> scores = new HashMap<>();
        for (SongEventAggregateRow row : rows) {
            double weight = EventWeights.weightFor(row.getEventType(), authenticated);
            scores.merge(row.getSongId(), row.getHits() * weight, Double::sum);
        }
        return scores;
    }

    private void addPersonalCandidates(
            Map<Long, Double> personalScores,
            LinkedHashSet<Long> collected,
            List<Song> result
    ) {
        List<Long> orderedIds = personalScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toList();

        Map<Long, Song> songsById = songRepository.findAllById(orderedIds).stream()
                .collect(Collectors.toMap(Song::getId, song -> song));

        List<Song> orderedSongs = orderedIds.stream()
                .map(songsById::get)
                .filter(Objects::nonNull)
                .toList();

        for (Song song : orderedSongs) {
            if (result.size() >= RESULT_LIMIT) {
                return;
            }
            if (collected.add(song.getId())) {
                result.add(song);
            }
        }

        List<Song> seeds = orderedSongs.stream().limit(SEED_LIMIT).toList();
        for (Song seed : seeds) {
            if (result.size() >= RESULT_LIMIT) {
                return;
            }
            List<Song> byGenre = songRepository.search(
                    null, seed.getGenre(), null, PageRequest.of(0, CANDIDATE_FETCH_SIZE)
            ).getContent();
            List<Song> byArtist = songRepository.search(
                    null, null, seed.getArtist(), PageRequest.of(0, CANDIDATE_FETCH_SIZE)
            ).getContent();

            for (Song song : byGenre) {
                if (result.size() >= RESULT_LIMIT) {
                    return;
                }
                if (collected.add(song.getId())) {
                    result.add(song);
                }
            }
            for (Song song : byArtist) {
                if (result.size() >= RESULT_LIMIT) {
                    return;
                }
                if (collected.add(song.getId())) {
                    result.add(song);
                }
            }
        }
    }

    private void addPopularCandidates(LinkedHashSet<Long> collected, List<Song> result) {
        List<Song> trending = songScoreRepository.findTrending(PageRequest.of(0, CANDIDATE_FETCH_SIZE))
                .map(SongScore::getSong)
                .getContent();
        List<Song> allTime = songScoreRepository.findAllTimeTop(PageRequest.of(0, CANDIDATE_FETCH_SIZE))
                .map(SongScore::getSong)
                .getContent();

        int max = Math.max(trending.size(), allTime.size());
        for (int i = 0; i < max && result.size() < RESULT_LIMIT; i++) {
            if (i < trending.size()) {
                Song song = trending.get(i);
                if (collected.add(song.getId())) {
                    result.add(song);
                }
            }
            if (result.size() >= RESULT_LIMIT) {
                break;
            }
            if (i < allTime.size()) {
                Song song = allTime.get(i);
                if (collected.add(song.getId())) {
                    result.add(song);
                }
            }
        }
    }

    private void addFeaturedCandidates(LinkedHashSet<Long> collected, List<Song> result) {
        for (Song song : songRepository.findFeatured(PageRequest.of(0, CANDIDATE_FETCH_SIZE))) {
            if (result.size() >= RESULT_LIMIT) {
                break;
            }
            if (collected.add(song.getId())) {
                result.add(song);
            }
        }
    }

    private SongSummaryDto toSummaryDto(Song song) {
        return new SongSummaryDto(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getGenre(),
                song.getKeySignature(),
                song.getCapo(),
                song.getLikeCount(),
                song.getViewCount(),
                song.getUser() != null ? song.getUser().getUsername() : null,
                song.getCreatedAt()
        );
    }
}