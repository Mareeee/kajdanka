package kajdanka.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record SongDetailDto(
        Long id,
        String title,
        String artist,
        String genre,
        String keySignature,
        int capo,
        String lyrics,
        int likeCount,
        int viewCount,
        String authorUsername,
        LocalDateTime createdAt,
        List<CommentDto> comments
) {
    public record CommentDto(
            Long id,
            String comment,
            String username,
            LocalDateTime createdAt
    ) {}
}