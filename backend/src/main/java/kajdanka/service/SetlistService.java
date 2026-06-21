package kajdanka.service;

import kajdanka.dto.request.CreateSetlistRequest;
import kajdanka.dto.response.SetlistDetailDto;
import kajdanka.dto.response.SetlistSummaryDto;
import kajdanka.dto.response.SongSummaryDto;
import kajdanka.entity.Playlist;
import kajdanka.entity.Song;
import kajdanka.entity.User;
import kajdanka.repository.PlaylistRepository;
import kajdanka.repository.SongRepository;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SetlistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;

    public List<SetlistSummaryDto> getMySetlists() {
        User user = getCurrentUser();
        return playlistRepository.findByUserId(user.getId())
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Transactional
    public SetlistSummaryDto createSetlist(CreateSetlistRequest request) {
        User user = getCurrentUser();
        Playlist playlist = Playlist.builder()
                .name(request.name())
                .description(request.description())
                .user(user)
                .build();
        return toSummaryDto(playlistRepository.save(playlist));
    }

    public SetlistDetailDto getSetlist(Long setlistId) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUserId(setlistId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Setlista nije pronađena"));
        return toDetailDto(playlist);
    }

    @Transactional
    public SetlistSummaryDto updateSetlist(Long setlistId, CreateSetlistRequest request) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUserId(setlistId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Setlista nije pronađena"));
        playlist.setName(request.name());
        playlist.setDescription(request.description());
        return toSummaryDto(playlistRepository.save(playlist));
    }

    @Transactional
    public SetlistDetailDto addSong(Long setlistId, Long songId) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUserId(setlistId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Setlista nije pronađena"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new NoSuchElementException("Pesma nije pronađena"));
        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
        }
        return toDetailDto(playlistRepository.save(playlist));
    }

    @Transactional
    public SetlistDetailDto removeSong(Long setlistId, Long songId) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUserId(setlistId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Setlista nije pronađena"));
        playlist.getSongs().removeIf(s -> s.getId().equals(songId));
        return toDetailDto(playlistRepository.save(playlist));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Korisnik nije pronađen"));
    }

    private SetlistSummaryDto toSummaryDto(Playlist playlist) {
        return new SetlistSummaryDto(
                playlist.getId(),
                playlist.getName(),
                playlist.getDescription(),
                playlist.getSongs().size(),
                playlist.getCreatedAt()
        );
    }

    private SetlistDetailDto toDetailDto(Playlist playlist) {
        List<SongSummaryDto> songs = playlist.getSongs().stream()
                .map(song -> new SongSummaryDto(
                        song.getId(),
                        song.getTitle(),
                        song.getArtist(),
                        song.getGenre(),
                        song.getKeySignature(),
                        song.getCapo(),
                        song.getLikeCount(),
                        song.getViewCount(),
                        song.getUser() != null ? song.getUser().getUsername() : null,
                        song.getCreatedAt(),
                        song.getLyrics()
                ))
                .toList();
        return new SetlistDetailDto(
                playlist.getId(),
                playlist.getName(),
                playlist.getDescription(),
                songs,
                playlist.getCreatedAt()
        );
    }
}