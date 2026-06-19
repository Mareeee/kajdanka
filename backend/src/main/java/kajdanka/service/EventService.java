package kajdanka.service;

import jakarta.persistence.EntityManager;
import kajdanka.entity.EventLog;
import kajdanka.entity.EventType;
import kajdanka.entity.Song;
import kajdanka.entity.SongViewHistory;
import kajdanka.entity.User;
import kajdanka.repository.EventLogRepository;
import kajdanka.repository.SongViewHistoryRepository;
import kajdanka.security.CurrentActor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventLogRepository eventLogRepository;
    private final SongViewHistoryRepository songViewHistoryRepository;
    private final EntityManager entityManager;

    public void recordEvent(Long songId, EventType eventType) {
        Song songRef = entityManager.getReference(Song.class, songId);
        Long userId = CurrentActor.getUserId();
        String anonToken = CurrentActor.getAnonToken();

        EventLog eventLog = EventLog.builder()
                .song(songRef)
                .user(userId != null ? entityManager.getReference(User.class, userId) : null)
                .anonToken(userId == null ? anonToken : null)
                .eventType(eventType)
                .build();

        eventLogRepository.save(eventLog);

        if (eventType == EventType.VIEW) {
            recordViewHistory(songRef, userId, anonToken);
        }
    }

    private void recordViewHistory(Song songRef, Long userId, String anonToken) {
        if (userId != null) {
            songViewHistoryRepository.findByUserIdAndSongId(userId, songRef.getId())
                    .ifPresent(existing -> songViewHistoryRepository.deleteById(existing.getId()));
        } else {
            songViewHistoryRepository.findByAnonTokenAndSongId(anonToken, songRef.getId())
                    .ifPresent(existing -> songViewHistoryRepository.deleteById(existing.getId()));
        }

        SongViewHistory history = SongViewHistory.builder()
                .song(songRef)
                .user(userId != null ? entityManager.getReference(User.class, userId) : null)
                .anonToken(userId == null ? anonToken : null)
                .build();

        songViewHistoryRepository.save(history);
    }
}