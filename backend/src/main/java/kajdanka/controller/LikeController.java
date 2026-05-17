package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kajdanka.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@Tag(name = "Likes", description = "Managing songs likes")
public class LikeController {
    private final LikeService likeService;

    @GetMapping("/like/{id}")
    @Operation(summary = "Like song")
    public ResponseEntity<Boolean> likeSong(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(likeService.likeSong(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/liked/{id}")
    @Operation(summary = "Is song liked")
    public ResponseEntity<Boolean> getIsLiked(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(likeService.getIsLiked(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
