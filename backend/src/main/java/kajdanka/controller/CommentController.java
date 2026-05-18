package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kajdanka.dto.response.SongDetailDto;
import kajdanka.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Managing songs comments")
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/{songId}")
    @Operation(summary = "Get Comments")
    public ResponseEntity<List<SongDetailDto.CommentDto>> getSongComments(@PathVariable Long songId) {
        try {
            return ResponseEntity.ok(commentService.getComments(songId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{songId}")
    @Operation(summary = "Send Comment")
    public ResponseEntity<List<SongDetailDto.CommentDto>> addComment(@PathVariable Long songId, @RequestBody String comment) {
        try {
            return ResponseEntity.ok(commentService.sendComment(songId, comment));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{songId}/{commentId}")
    @Operation(summary = "Delete Comment")
    public ResponseEntity<List<SongDetailDto.CommentDto>> deleteComment(@PathVariable Long songId, @PathVariable Long commentId) {
        try {
            return ResponseEntity.ok(commentService.deleteComment(songId, commentId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
