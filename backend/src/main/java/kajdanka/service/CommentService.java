package kajdanka.service;

import kajdanka.dto.response.SongDetailDto;
import kajdanka.entity.Comment;
import kajdanka.entity.Song;
import kajdanka.entity.User;
import kajdanka.repository.CommentRepository;
import kajdanka.repository.SongRepository;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {
    private final CommentRepository commentRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<SongDetailDto.CommentDto> getComments(Long songId) {
        return commentRepository.findAllBySongId(songId).stream()
                .map(c -> new SongDetailDto.CommentDto(
                        c.getId(),
                        c.getComment(),
                        c.getUser() != null ? c.getUser().getUsername() : "Anonymous",
                        c.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public List<SongDetailDto.CommentDto> deleteComment(Long songId, Long commentId) {
        commentRepository.deleteById(commentId);
        return getComments(songId);
    }

    @Transactional
    public List<SongDetailDto.CommentDto> sendComment(Long songId, String commentText) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new NoSuchElementException("Song not found: " + songId));

        Comment newComment = Comment.builder()
                .comment(commentText)
                .song(song)
                .user(getLoggedInUser())
                .createdAt(LocalDateTime.now())
                .build();

        commentRepository.save(newComment);
        return getComments(songId);
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("User not found"));
    }
}
