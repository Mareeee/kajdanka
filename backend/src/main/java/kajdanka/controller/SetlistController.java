package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kajdanka.dto.request.CreateSetlistRequest;
import kajdanka.dto.response.SetlistDetailDto;
import kajdanka.dto.response.SetlistSummaryDto;
import kajdanka.service.SetlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/setlists")
@RequiredArgsConstructor
@Tag(name = "Setlists", description = "Managing setlists")
public class SetlistController {

    private final SetlistService setlistService;

    @GetMapping
    @Operation(summary = "Get my setlists", security = @SecurityRequirement(name = "bearerAuth"))
    public List<SetlistSummaryDto> getMySetlists() {
        return setlistService.getMySetlists();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create setlist", security = @SecurityRequirement(name = "bearerAuth"))
    public SetlistSummaryDto createSetlist(@Valid @RequestBody CreateSetlistRequest request) {
        return setlistService.createSetlist(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get setlist by id", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SetlistDetailDto> getSetlist(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(setlistService.getSetlist(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update setlist", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SetlistSummaryDto> updateSetlist(
            @PathVariable Long id,
            @Valid @RequestBody CreateSetlistRequest request
    ) {
        try {
            return ResponseEntity.ok(setlistService.updateSetlist(id, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/songs/{songId}")
    @Operation(summary = "Add song to setlist", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SetlistDetailDto> addSong(
            @PathVariable Long id,
            @PathVariable Long songId
    ) {
        try {
            return ResponseEntity.ok(setlistService.addSong(id, songId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/songs/{songId}")
    @Operation(summary = "Remove song from setlist", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<SetlistDetailDto> removeSong(
            @PathVariable Long id,
            @PathVariable Long songId
    ) {
        try {
            return ResponseEntity.ok(setlistService.removeSong(id, songId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}