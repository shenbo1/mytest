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

function NotFount() {
  const navigate = useNavigate();

  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl">Page not found</CardTitle>
        </CardHeader>

        <CardFooter class="flex flex-col gap-3">
          <Button class="w-full" onClick={() => navigate("/")}>
            Back To Index
          </Button>
        </CardFooter>
      </Card>
    </Flex>
  );
}

export default NotFount;
