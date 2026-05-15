package kajdanka.service;

import kajdanka.dto.response.SongSummaryDto;
import kajdanka.dto.response.UserProfileDto;
import kajdanka.entity.User;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserProfileDto getMyProfile() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));

        List<SongSummaryDto> songs = user.getSongs().stream()
                .map(song -> new SongSummaryDto(
                        song.getId(),
                        song.getTitle(),
                        song.getArtist(),
                        song.getGenre(),
                        song.getKeySignature(),
                        song.getCapo(),
                        song.getLikeCount(),
                        song.getViewCount(),
                        user.getUsername(),
                        song.getCreatedAt()
                ))
                .toList();

        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                songs
        );
    }
}