import { Flex } from "~/components/ui/flex";
import { ReservationForm } from "~/components/ui/reservation-form";

function ReservationAdd() {
  return (
    <Flex class="min-h-screen items-center justify-center p-4">
      <ReservationForm mode="create" />
    </Flex>
  );
}

export default ReservationAdd;
