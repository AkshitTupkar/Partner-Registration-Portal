import { AtProvider } from "@atomberg/ui";
import { I18nProvider } from "@/i18n/I18nProvider";
import { DemoGate } from "@/components/demo-gate/DemoGate";
import { HomePage } from "@/pages/HomePage";

export function App() {
  return (
    <I18nProvider>
      <AtProvider pigment="atomberg">
        <DemoGate>
          <HomePage />
        </DemoGate>
      </AtProvider>
    </I18nProvider>
  );
}
