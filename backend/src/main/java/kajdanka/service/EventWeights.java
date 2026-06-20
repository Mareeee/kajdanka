package kajdanka.service;

import kajdanka.entity.EventType;

public final class EventWeights {

    public static final double VIEW_ANON = 1.0;
    public static final double VIEW_AUTH = 2.0;
    public static final double LIKE = 5.0;
    public static final double COMMENT = 4.0;
    public static final double SEARCH_CLICK = 2.0;

    private EventWeights() {}

    public static double weightFor(EventType eventType, boolean authenticated) {
        return switch (eventType) {
            case VIEW -> authenticated ? VIEW_AUTH : VIEW_ANON;
            case LIKE -> LIKE;
            case COMMENT -> COMMENT;
            case SEARCH_CLICK -> SEARCH_CLICK;
        };
    }
}