package kajdanka.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSongRequest(

        @NotBlank(message = "Title required")
        @Size(max = 200)
        String title,

        @NotBlank(message = "Artist required")
        @Size(max = 200)
        String artist,

        @Size(max = 100)
        String genre,

        @Size(max = 10)
        String keySignature,

        int capo,

        String lyrics
) {}