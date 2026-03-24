import { ReservationForm } from "~/components/ui/reservation-form";
import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import {
  getReservationApi,
  type Reservation,
} from "~/services/reservationService";
import { Flex } from "~/components/ui/flex";

function ReservationEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = createSignal<Reservation | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    setLoading(true);
    const data = await getReservationApi(params.id!);
    if (data) {
      setReservation(data as Reservation);
    }
    setLoading(false);
  });

  const handleSuccess = () => {
    navigate("/reservation/list");
  };

  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <Show
        when={!loading()}
        fallback={<div class="text-center py-8">Loading...</div>}
      >
        <Show
          when={reservation()}
          fallback={
            <div class="text-center py-8 text-muted-foreground">
              Reservation not found
            </div>
          }
        >
          <ReservationForm
            mode="edit"
            initialData={reservation()!}
            onSuccess={handleSuccess}
          />
        </Show>
      </Show>
    </Flex>
  );
}

export default ReservationEdit;
