import { createSignal } from "solid-js";
import { AsyncButton, Button } from "~/components/ui/button";
import { Flex } from "~/components/ui/flex";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import { login } from "~/services/authService";
import { useNavigate } from "@solidjs/router";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("admin@hilton.com");
  const [password, setPassword] = createSignal("Admin@123");

  const handleLogin = async () => {
    if (!email() || !password()) {
      showToast({
        title: "Validation Error",
        description: "Please enter both email and password",
        duration: 3000,
      });
      return;
    }
    const result = await login({ email: email(), password: password() });
    showToast({
      title: "Login successful",
      description: "Welcome back!",
      duration: 3000,
    });
    if (result.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/reservation/list");
    }
  };

  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl">Login to your account</CardTitle>
          <CardDescription>
            Enter your email address and password
          </CardDescription>
        </CardHeader>

        <CardContent class="grid gap-4">
          <TextField class="grid gap-2 text-left">
            <TextFieldLabel>Email</TextFieldLabel>
            <TextFieldInput
              type="email"
              placeholder="please enter your email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
            />
          </TextField>
          <TextField class="grid gap-2 text-left">
            <TextFieldLabel>Password</TextFieldLabel>
            <TextFieldInput
              type="password"
              placeholder="please enter your password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
          </TextField>
        </CardContent>
        <CardFooter>
          <AsyncButton class="w-full" onClick={handleLogin}>
            Login
          </AsyncButton>
        </CardFooter>
      </Card>
    </Flex>
  );
}
export default LoginPage;
