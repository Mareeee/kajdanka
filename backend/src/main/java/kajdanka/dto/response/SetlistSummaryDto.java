package kajdanka.dto.response;

import java.time.LocalDateTime;

public record SetlistSummaryDto(
        Long id,
        String name,
        String description,
        int songCount,
        LocalDateTime createdAt
) {}