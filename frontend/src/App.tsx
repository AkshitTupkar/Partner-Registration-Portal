import { AtProvider } from "@atomberg/ui";
import { I18nProvider } from "@/i18n/I18nProvider";
import { HomePage } from "@/pages/HomePage";

export function App() {
  return (
    <I18nProvider>
      <AtProvider pigment="atomberg">
        <HomePage />
      </AtProvider>
    </I18nProvider>
  );
}
