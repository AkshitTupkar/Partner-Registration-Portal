import { Icon } from "@atomberg/ui";
import { errorId } from "@/components/common/field-a11y";
import { FieldError } from "@/components/common/FormField";
import { productImage } from "@/content/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/registration";

/**
 * Product interest (F-04) as square image tiles. Each tile is a <label> around a
 * visually hidden native checkbox, so clicking anywhere on the tile toggles it and
 * keyboard (Tab, Space) and screen-reader behaviour comes for free.
 */
export function ProductPicker({ id, legend, products, selected, onChange, error }: {
  id: string;
  legend: string;
  products: Product[];
  selected: string[];
  onChange: (codes: string[]) => void;
  error?: string;
}) {
  const toggle = (code: string) =>
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);

  return (
    <fieldset id={id} className="at-field po-fieldset" aria-describedby={error ? errorId(id) : undefined}>
      <legend className="at-label">{legend}</legend>
      <div className="po-products">
        {products.map((p) => {
          const checked = selected.includes(p.code);
          return (
            <label key={p.code} className={cn("po-product", checked && "po-product--checked")}>
              <input type="checkbox" className="po-product__input" checked={checked} onChange={() => toggle(p.code)} />
              <span className="po-product__media">
                <img src={productImage(p.code)} alt="" width={160} height={160} />
                <span className="po-product__check" aria-hidden="true">
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
              </span>
              <span className="po-product__name">{p.name}</span>
            </label>
          );
        })}
      </div>
      {error && <FieldError id={id}>{error}</FieldError>}
    </fieldset>
  );
}
