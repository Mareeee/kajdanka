package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kajdanka.entity.Comment;
import kajdanka.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<List<Comment>> getSongComments(@PathVariable Long songId) {
        try {
            return ResponseEntity.ok(commentService.getComments(songId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
