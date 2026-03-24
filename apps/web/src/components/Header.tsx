import { createSignal, onMount, onCleanup } from "solid-js";
import { Button } from "~/components/ui/button";
import { Show } from "solid-js";
import { getCurrentUser, logout } from "~/services/authService";

export default function Header() {
  const [user, setUser] = createSignal<any>(null);

  onMount(() => {
    setUser(getCurrentUser());

    // 监听登录事件
    const handleLoginEvent = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener("user-login", handleLoginEvent as EventListener);

    // 清理函数
    onCleanup(() => {
      window.removeEventListener(
        "user-login",
        handleLoginEvent as EventListener,
      );
    });
  });

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = "/login";
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold tracking-tight">Hilton Restaurant</h2>
        </div>

        <Show
          when={user() !== null}
          fallback={
            <Button
              variant="default"
              size="sm"
              onClick={() => navigateTo("/login")}
            >
              Login
            </Button>
          }
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{user()?.nickname}</span>

            {user()?.role === "admin" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo("/admin")}
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo("/reservation/list")}
              >
                My Reservations
              </Button>
            )}

            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Show>
      </div>
    </header>
  );
}
