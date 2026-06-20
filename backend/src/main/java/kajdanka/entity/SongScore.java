package kajdanka.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "song_scores")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongScore {

    @Id
    @Column(name = "song_id")
    private Long songId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "song_id")
    private Song song;

    @Column(name = "trending_score", nullable = false)
    @Builder.Default
    private double trendingScore = 0.0;

    @Column(name = "all_time_score", nullable = false)
    @Builder.Default
    private double allTimeScore = 0.0;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}