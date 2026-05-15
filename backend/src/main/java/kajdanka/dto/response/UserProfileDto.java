package kajdanka.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record UserProfileDto(
        Long id,
        String username,
        String email,
        String role,
        LocalDateTime createdAt,
        List<SongSummaryDto> songs
) {}