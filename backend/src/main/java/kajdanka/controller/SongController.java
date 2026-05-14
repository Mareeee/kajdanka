package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import kajdanka.dto.request.CreateSongRequest;
import kajdanka.dto.response.SongDetailDto;
import kajdanka.dto.response.SongSummaryDto;
import kajdanka.service.SongService;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@Tag(name = "Pesme", description = "Upravljanje pesmama i akordima")
public class SongController {

    private final SongService songService;

    @GetMapping
    @Operation(summary = "Lista pesama sa pretragom i paginacijom")
    public Page<SongSummaryDto> searchSongs(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String genre,
            @RequestParam(defaultValue = "") String artist,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return songService.searchSongs(search, genre, artist, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalji pesme sa akordima")
    public ResponseEntity<SongDetailDto> getSong(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(songService.getSongById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/featured")
    @Operation(summary = "Istaknute pesme za početnu stranu")
    public List<SongSummaryDto> getFeatured(
            @RequestParam(defaultValue = "8") int count
    ) {
        return songService.getFeaturedSongs(count);
    }

    @GetMapping("/genres")
    @Operation(summary = "Lista svih žanrova")
    public List<String> getGenres() {
        return songService.getAllGenres();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Dodaj novu pesmu")
    public SongSummaryDto createSong(@Valid @RequestBody CreateSongRequest request) {
        return songService.createSong(request);
    }
}
