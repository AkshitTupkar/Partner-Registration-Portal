import { Card } from "@atomberg/ui";
import { useState, ViewTransition } from "react";
import { REGISTER_ANCHOR } from "@/lib/scroll";
import { CardHeader, MastersError, MastersLoading, SuccessPanel } from "./RegistrationCard.parts";
import { RegistrationForm } from "./RegistrationForm";
import { useMasters } from "./use-masters";
import type { Registered } from "./use-registration-form";

/** Self-registration (FR-01): details → mobile OTP → lead created. */
export function RegistrationCard() {
  const [registered, setRegistered] = useState<Registered | null>(null);

  return (
    <Card className="po-reg" id={REGISTER_ANCHOR}>
      {registered ? (
        <ViewTransition key="done" enter="po-vt-fade-in" default="none">
          <SuccessPanel registered={registered} />
        </ViewTransition>
      ) : (
        <ViewTransition key="form" exit="po-vt-fade-out" default="none">
          <RegistrationStart onRegistered={setRegistered} />
        </ViewTransition>
      )}
    </Card>
  );
}

/** The card's title, then the form once the masters have loaded. */
function RegistrationStart({ onRegistered }: { onRegistered: (result: Registered) => void }) {
  const [masters, retry] = useMasters();

  return (
    <>
      <CardHeader />
      {masters.status === "ready" ? (
        <ViewTransition enter="po-vt-fade-in" default="none">
          <RegistrationForm masters={masters.masters} onRegistered={onRegistered} />
        </ViewTransition>
      ) : masters.status === "error" ? (
        <MastersError onRetry={retry} />
      ) : (
        <MastersLoading />
      )}
    </>
  );
}
