import { useNavigate } from "@solidjs/router";
import { Flex } from "~/components/ui/flex";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Line } from "~/components/ui/line";
import { getCurrentUser } from "~/services/authService";
import { Show } from "solid-js";

function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const steps = [
    { title: "Submit Reservation", description: "Fill in reservation details" },
    {
      title: "Confirm Reservation",
      description: "Wait for merchant confirmation",
    },
    {
      title: "Complete Reservation",
      description: "Reservation successful, arrive on time",
    },
  ];

  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl">Welcome to Hilton</CardTitle>
          <CardDescription>Restaurant reservation system</CardDescription>
        </CardHeader>

        <CardContent class="grid gap-6">
          <Line />
          <div class="space-y-4">
            <p class="text-base font-semibold text-foreground">
              Reservation Process
            </p>
            <div class="grid gap-4">
              {steps.map((step, index) => (
                <div class="flex items-start gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div class="space-y-1  text-left">
                    <p class="font-medium">{step.title}</p>
                    <p class="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Line />
        </CardContent>

        <CardFooter class="flex flex-col gap-3">
          <Show
            when={user?.role !== "admin"}
            fallback={
              <Button class="w-full" onClick={() => navigate("/admin")}>
                Go to Dashboard
              </Button>
            }
          >
            <Button class="w-full" onClick={() => navigate("/reservation")}>
              Start Reservation
            </Button>
            <Button
              class="w-full"
              variant="outline"
              onClick={() => navigate("/reservation/list")}
            >
              View My Reservations
            </Button>
          </Show>
        </CardFooter>
      </Card>
    </Flex>
  );
}

export default Home;
