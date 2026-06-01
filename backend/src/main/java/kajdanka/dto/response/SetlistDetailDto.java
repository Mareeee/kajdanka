package kajdanka.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record SetlistDetailDto(
        Long id,
        String name,
        String description,
        List<SongSummaryDto> songs,
        LocalDateTime createdAt
) {}