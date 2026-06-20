package kajdanka.security;

public final class CurrentActor {

    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> ANON_TOKEN = new ThreadLocal<>();

    private CurrentActor() {}

    public static void setUserId(Long userId) {
        USER_ID.set(userId);
        ANON_TOKEN.remove();
    }

    public static void setAnonToken(String anonToken) {
        ANON_TOKEN.set(anonToken);
        USER_ID.remove();
    }

    public static Long getUserId() {
        return USER_ID.get();
    }

    public static String getAnonToken() {
        return ANON_TOKEN.get();
    }

    public static void clear() {
        USER_ID.remove();
        ANON_TOKEN.remove();
    }
}