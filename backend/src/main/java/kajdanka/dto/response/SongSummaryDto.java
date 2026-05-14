package kajdanka.dto.response;

import java.time.LocalDateTime;

public record SongSummaryDto(
        Long id,
        String title,
        String artist,
        String genre,
        String keySignature,
        int capo,
        int likeCount,
        int viewCount,
        String authorUsername,
        LocalDateTime createdAt
) {}
