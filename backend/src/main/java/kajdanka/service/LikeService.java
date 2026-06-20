package kajdanka.service;

import kajdanka.entity.EventType;
import kajdanka.entity.Like;
import kajdanka.entity.Song;
import kajdanka.entity.User;
import kajdanka.repository.LikeRepository;
import kajdanka.repository.SongRepository;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LikeService {
    private final LikeRepository likeRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    @Transactional
    public Boolean likeSong(Long id) {
        User user = getLoggedInUser();
        Song song = songRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Song not found"));

        Optional<Like> like = likeRepository.findByUserIdAndSongId(user.getId(), song.getId());
        if (like.isPresent()) {
            likeRepository.deleteById(like.get().getId());
            return false;
        }

        Like likeEntity = new Like().builder()
                .user(user)
                .song(song)
                .createdAt(LocalDateTime.now())
                .build();

        likeRepository.save(likeEntity);
        eventService.recordEvent(song.getId(), EventType.LIKE);
        return true;
    }

    @Transactional
    public Boolean getIsLiked(Long id) {
        User user = getLoggedInUser();
        Song song = songRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Song not found"));

        return likeRepository.findByUserIdAndSongId(user.getId(), song.getId()).isPresent();
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("User not found"));
    }
}