package kajdanka.service;

import kajdanka.entity.Comment;
import kajdanka.entity.Like;
import kajdanka.entity.Song;
import kajdanka.entity.User;
import kajdanka.repository.CommentRepository;
import kajdanka.repository.LikeRepository;
import kajdanka.repository.SongRepository;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {
    private final CommentRepository commentRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<Comment> getComments(Long songId) {
        return commentRepository.findBySongId(songId).stream().toList();
    }
}
