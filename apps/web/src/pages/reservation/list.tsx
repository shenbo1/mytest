import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Flex } from "~/components/ui/flex";
import { createSignal, createMemo, For, Show, createEffect } from "solid-js";

import { ReservationItem } from "~/components/ui/reservation-item";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { showToast } from "~/components/ui/toast";
import {
  getReservations,
  cancelReservationApi,
} from "~/services/reservationService";
import { useNavigate } from "@solidjs/router";
import type { Reservation } from "~/services/reservationService";

dayjs.extend(isSameOrAfter);

function ReservationList() {
  const navigate = useNavigate();
  const [total, setTotal] = createSignal(0);
  const [reservations, setReservations] = createSignal<Reservation[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [currentPage, setCurrentPage] = createSignal(1);
  const itemsPerPage = 3;

  const totalPages = createMemo(() => {
    return Math.ceil(total() / itemsPerPage);
  });

  const goToPrevious = () => {
    if (currentPage() > 1) {
      setCurrentPage(currentPage() - 1);
    }
  };

  const goToNext = () => {
    if (currentPage() < totalPages()) {
      setCurrentPage(currentPage() + 1);
    }
  };

  createEffect(async () => {
    await loadReservations();
  });

  const loadReservations = async () => {
    setLoading(true);
    const result = await getReservations(
      itemsPerPage,
      (currentPage() - 1) * itemsPerPage,
    );
    if (result) {
      setReservations(result.data);
      setTotal(result.total);
    }
    setLoading(false);
  };

  const handleCancel = async (id: string, reason: string) => {
    await cancelReservationApi(id, reason);
    showToast({
      title: "Success",
      description: "Reservation cancelled",
      duration: 3000,
    });
    await loadReservations();
  };

  const handleEdit = (id: string) => {
    navigate(`/reservation/edit/${id}`);
  };

  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <Card class="w-full max-w-lg">
        <CardHeader>
          <CardTitle class="text-2xl font-bold text-center">
            My Reservations
          </CardTitle>
          <CardDescription class="space-y-3 text-center">
            <p class="text-sm text-muted-foreground">
              View and manage your reservations
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Show
            when={!loading()}
            fallback={<div class="text-center py-8">Loading...</div>}
          >
            <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
              <div class="flex gap-4 px-2">
                <For each={reservations()}>
                  {(item) => (
                    <div class="flex flex-col gap-2">
                      <ReservationItem
                        reservation={item}
                        onCancel={(reason: string) => {
                          handleCancel(item.id, reason);
                        }}
                        onEdit={() => {
                          handleEdit(item.id);
                        }}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>

            <Show when={reservations().length === 0}>
              <div class="text-center py-8 text-muted-foreground">
                No reservations found
              </div>
            </Show>
          </Show>

          <Show when={reservations().length > 0 && !loading()}>
            <div class="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={currentPage() === 1}
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </Button>

              <span class="text-sm text-muted-foreground">
                {currentPage()} of {totalPages()}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={currentPage() === totalPages()}
              >
                Next
                <svg
                  class="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </Show>
        </CardContent>
        <CardFooter class="flex justify-center">
          <Button onClick={() => navigate("/reservation")}>
            New Reservation
          </Button>
        </CardFooter>
      </Card>
    </Flex>
  );
}
export default ReservationList;
