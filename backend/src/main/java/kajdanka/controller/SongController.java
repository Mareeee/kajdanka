package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kajdanka.dto.request.CreateSongRequest;
import kajdanka.dto.request.UpdateSongRequest;
import kajdanka.dto.response.SongDetailDto;
import kajdanka.dto.response.SongSummaryDto;
import kajdanka.entity.EventType;
import kajdanka.entity.SongViewHistory;
import kajdanka.repository.SongScoreRepository;
import kajdanka.repository.SongViewHistoryRepository;
import kajdanka.security.CurrentActor;
import kajdanka.service.EventService;
import kajdanka.service.RecommendationService;
import kajdanka.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@Tag(name = "Songs", description = "Managing songs and chords")
public class SongController {

    private final SongService songService;
    private final EventService eventService;
    private final RecommendationService recommendationService;
    private final SongScoreRepository songScoreRepository;
    private final SongViewHistoryRepository songViewHistoryRepository;

    @GetMapping
    @Operation(summary = "List of songs with search and pagination")
    public Page<SongSummaryDto> searchSongs(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String genre,
            @RequestParam(defaultValue = "") String artist,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return songService.searchSongs(search, genre, artist, page, size);
    }

    @GetMapping("/featured")
    @Operation(summary = "Featured songs")
    public List<SongSummaryDto> getFeatured(
            @RequestParam(defaultValue = "8") int count
    ) {
        return songService.getFeaturedSongs(count);
    }

    @GetMapping("/genres")
    @Operation(summary = "Genres list")
    public List<String> getGenres() {
        return songService.getAllGenres();
    }

    @GetMapping("/my")
    @Operation(summary = "My songs", security = @SecurityRequirement(name = "bearerAuth"))
    public List<SongSummaryDto> getMySongs() {
        return songService.getMySongs();
    }

    @GetMapping("/trending")
    @Operation(summary = "Trending songs sorted by trending score")
    public List<SongSummaryDto> getTrending(
            @RequestParam(defaultValue = "9") int count
    ) {
        return songScoreRepository.findTrending(PageRequest.of(0, count))
                .stream()
                .map(score -> {
                    var s = score.getSong();
                    return new SongSummaryDto(
                            s.getId(), s.getTitle(), s.getArtist(), s.getGenre(),
                            s.getKeySignature(), s.getCapo(), s.getLikeCount(),
                            s.getViewCount(),
                            s.getUser() != null ? s.getUser().getUsername() : null,
                            s.getCreatedAt()
                    );
                })
                .toList();
    }

    @GetMapping("/all-time")
    @Operation(summary = "All-time top songs sorted by all-time score")
    public List<SongSummaryDto> getAllTimeTop(
            @RequestParam(defaultValue = "9") int count
    ) {
        return songScoreRepository.findAllTimeTop(PageRequest.of(0, count))
                .stream()
                .map(score -> {
                    var s = score.getSong();
                    return new SongSummaryDto(
                            s.getId(), s.getTitle(), s.getArtist(), s.getGenre(),
                            s.getKeySignature(), s.getCapo(), s.getLikeCount(),
                            s.getViewCount(),
                            s.getUser() != null ? s.getUser().getUsername() : null,
                            s.getCreatedAt()
                    );
                })
                .toList();
    }

    @GetMapping("/recommended")
    @Operation(summary = "Personalized recommendations for the current actor")
    public List<SongSummaryDto> getRecommended() {
        return recommendationService.recommend();
    }

    @GetMapping("/recently-viewed")
    @Operation(summary = "Last 9 songs viewed by the current actor")
    public List<SongSummaryDto> getRecentlyViewed() {
        Long userId = CurrentActor.getUserId();
        String anonToken = CurrentActor.getAnonToken();

        List<SongViewHistory> history;
        if (userId != null) {
            history = songViewHistoryRepository.findRecentByUserId(userId);
        } else if (anonToken != null) {
            history = songViewHistoryRepository.findRecentByAnonToken(anonToken);
        } else {
            return List.of();
        }

        return history.stream()
                .limit(9)
                .map(h -> {
                    var s = h.getSong();
                    return new SongSummaryDto(
                            s.getId(), s.getTitle(), s.getArtist(), s.getGenre(),
                            s.getKeySignature(), s.getCapo(), s.getLikeCount(),
                            s.getViewCount(),
                            s.getUser() != null ? s.getUser().getUsername() : null,
                            s.getCreatedAt()
                    );
                })
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Song details")
    public ResponseEntity<SongDetailDto> getSong(@PathVariable Long id) {
        try {
            SongDetailDto dto = songService.getSongById(id);
            eventService.recordEvent(id, EventType.VIEW);
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create new song", security = @SecurityRequirement(name = "bearerAuth"))
    public SongSummaryDto createSong(@Valid @RequestBody CreateSongRequest request) {
        return songService.createSong(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update song", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SongSummaryDto> updateSong(@PathVariable Long id, @Valid @RequestBody UpdateSongRequest request) {
        try {
            return ResponseEntity.ok(songService.updateSong(id, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete song", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        try {
            songService.deleteSong(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/artist/{artist}")
    @Operation(summary = "Songs by artist")
    public List<SongSummaryDto> getSongsByArtist(@PathVariable String artist) {
        return songService.getByArtist(artist);
    }
}