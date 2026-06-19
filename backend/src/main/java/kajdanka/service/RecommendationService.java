package kajdanka.service;

import kajdanka.dto.response.SongSummaryDto;
import kajdanka.entity.Song;
import kajdanka.entity.SongViewHistory;
import kajdanka.repository.EventLogRepository;
import kajdanka.repository.EventLogRepository.GenreArtistAggregateRow;
import kajdanka.repository.SongRepository;
import kajdanka.repository.SongViewHistoryRepository;
import kajdanka.security.CurrentActor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private static final int PREFERENCE_LOOKBACK_DAYS = 30;
    private static final int CANDIDATE_FETCH_SIZE = 40;
    private static final int RESULT_LIMIT = 10;

    private final EventLogRepository eventLogRepository;
    private final SongViewHistoryRepository songViewHistoryRepository;
    private final SongRepository songRepository;

    public List<SongSummaryDto> recommend() {
        Long userId = CurrentActor.getUserId();
        String anonToken = CurrentActor.getAnonToken();

        List<GenreArtistAggregateRow> preferences = fetchPreferences(userId, anonToken);
        Set<Long> seenIds = fetchSeenIds(userId, anonToken);

        if (preferences.isEmpty()) {
            return fallbackToFeatured(seenIds);
        }

        return buildRecommendations(preferences, seenIds);
    }

    private List<GenreArtistAggregateRow> fetchPreferences(Long userId, String anonToken) {
        LocalDateTime since = LocalDateTime.now().minusDays(PREFERENCE_LOOKBACK_DAYS);
        if (userId != null) {
            return eventLogRepository.findTopGenresAndArtistsForUser(userId, since);
        }
        if (anonToken != null) {
            return eventLogRepository.findTopGenresAndArtistsForGuest(anonToken, since);
        }
        return List.of();
    }

    private Set<Long> fetchSeenIds(Long userId, String anonToken) {
        List<SongViewHistory> history;
        if (userId != null) {
            history = songViewHistoryRepository.findRecentByUserId(userId);
        } else if (anonToken != null) {
            history = songViewHistoryRepository.findRecentByAnonToken(anonToken);
        } else {
            return Set.of();
        }
        return history.stream()
                .map(h -> h.getSong().getId())
                .collect(Collectors.toSet());
    }

    private List<SongSummaryDto> buildRecommendations(
            List<GenreArtistAggregateRow> preferences,
            Set<Long> seenIds
    ) {
        Set<Long> collected = new LinkedHashSet<>();
        List<Song> candidates = new ArrayList<>();

        for (GenreArtistAggregateRow pref : preferences) {
            if (candidates.size() >= CANDIDATE_FETCH_SIZE) {
                break;
            }
            List<Song> byGenre = songRepository.search(
                    null, pref.getGenre(), null, PageRequest.of(0, CANDIDATE_FETCH_SIZE)
            ).getContent();

            List<Song> byArtist = songRepository.search(
                    null, null, pref.getArtist(), PageRequest.of(0, CANDIDATE_FETCH_SIZE)
            ).getContent();

            for (Song song : byGenre) {
                if (!seenIds.contains(song.getId()) && collected.add(song.getId())) {
                    candidates.add(song);
                }
            }
            for (Song song : byArtist) {
                if (!seenIds.contains(song.getId()) && collected.add(song.getId())) {
                    candidates.add(song);
                }
            }
        }

        return candidates.stream()
                .limit(RESULT_LIMIT)
                .map(this::toSummaryDto)
                .toList();
    }

    private List<SongSummaryDto> fallbackToFeatured(Set<Long> seenIds) {
        return songRepository.findFeatured(PageRequest.of(0, CANDIDATE_FETCH_SIZE))
                .stream()
                .filter(s -> !seenIds.contains(s.getId()))
                .limit(RESULT_LIMIT)
                .map(this::toSummaryDto)
                .toList();
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