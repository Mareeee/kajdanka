package kajdanka.service;

import kajdanka.dto.request.CreateSongRequest;
import kajdanka.dto.request.UpdateSongRequest;
import kajdanka.dto.response.SongDetailDto;
import kajdanka.dto.response.SongSummaryDto;
import kajdanka.entity.Role;
import kajdanka.entity.Song;
import kajdanka.entity.User;
import kajdanka.repository.SongRepository;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SongService {

    private final SongRepository songRepository;
    private final UserRepository userRepository;

    public Page<SongSummaryDto> searchSongs(
            String search, String genre, String artist, int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return songRepository.search(search, genre, artist, pageable)
                .map(this::toSummaryDto);
    }

    @Transactional
    public SongDetailDto getSongById(Long id) {
        Song song = findSongOrThrow(id);
        songRepository.incrementViewCount(id);
        return toDetailDto(song);
    }

    @Transactional
    public List<SongSummaryDto> getByArtist(String artist) {
        return songRepository.findAllByArtist(artist)
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    public List<SongSummaryDto> getFeaturedSongs(int count) {
        return songRepository.findFeatured(PageRequest.of(0, count))
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    public List<String> getAllGenres() {
        return songRepository.findAllGenres();
    }

    public List<SongSummaryDto> getMySongs() {
        User user = getLoggedInUser();
        return songRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Transactional
    public SongSummaryDto createSong(CreateSongRequest request) {
        User user = getLoggedInUser();

        Song song = Song.builder()
                .title(request.title())
                .artist(request.artist())
                .genre(request.genre())
                .keySignature(request.keySignature())
                .capo(request.capo())
                .lyrics(request.lyrics())
                .isPrivate(request.isPrivate())
                .user(user)
                .build();

        return toSummaryDto(songRepository.save(song));
    }

    @Transactional
    public SongSummaryDto updateSong(Long id, UpdateSongRequest request) {
        Song song = findSongOrThrow(id);
        checkOwnership(song);

        song.setTitle(request.title());
        song.setArtist(request.artist());
        song.setGenre(request.genre());
        song.setKeySignature(request.keySignature());
        song.setCapo(request.capo());
        song.setLyrics(request.lyrics());

        return toSummaryDto(song);
    }

    @Transactional
    public void deleteSong(Long id) {
        Song song = findSongOrThrow(id);
        checkOwnership(song);
        songRepository.delete(song);
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    private Song findSongOrThrow(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Song not found: " + id));
    }

    private void checkOwnership(Song song) {
        User user = getLoggedInUser();
        boolean isOwner = song.getUser() != null && song.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new SecurityException("You don't have permission for this action");
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
                song.getUser() != null ? song.getUser().getUsername() : "Anonymous",
                song.getCreatedAt()
        );
    }

    private SongDetailDto toDetailDto(Song song) {
        List<SongDetailDto.CommentDto> comments = song.getComments().stream()
                .map(c -> new SongDetailDto.CommentDto(
                        c.getId(),
                        c.getComment(),
                        c.getUser() != null ? c.getUser().getUsername() : "Anonymous",
                        c.getCreatedAt()
                ))
                .toList();

        return new SongDetailDto(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getGenre(),
                song.getKeySignature(),
                song.getCapo(),
                song.getLyrics(),
                song.getLikeCount(),
                song.getViewCount(),
                song.getUser() != null ? song.getUser().getUsername() : "Anonymous",
                song.getCreatedAt(),
                comments
        );
    }
}