import { cn } from "@/lib/utils";
import emblem from "@/assets/pho-empire-emblem.png";

interface WordmarkProps {
  className?: string;
  ringColor?: string;
  style?: React.CSSProperties;
}

/**
 * "PHO EMPIRE" wordmark matching the Irving storefront sign.
 * The "O" in PHO contains a small bowl-and-chopsticks icon.
 */
export const Wordmark = ({ className, ringColor = "#7a1a1a", style }: WordmarkProps) => {
  return (
    <span
      style={style}
      className={cn(
        "font-display tracking-[0.04em] leading-none inline-flex items-center whitespace-nowrap",
        className
      )}
    >
      <span className="inline-flex items-center">
        <span>PH</span>
        <span
        aria-label="O"
        className="inline-flex items-center justify-center overflow-hidden bg-current ml-[0.04em]"
        style={{
          width: "0.86em",
          height: "0.78em",
          borderRadius: "50%",
          transform: "translateY(-0.03em)",
          boxShadow: `inset 0 0 0 0.04em currentColor, inset 0 0 0 0.075em ${ringColor}`,
        }}
      >
        <span
          aria-hidden
          className="block"
          style={{
            width: "92%",
            height: "92%",
            backgroundColor: ringColor,
            WebkitMaskImage: `url(${emblem})`,
            maskImage: `url(${emblem})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
        </span>
      </span>
      <span className="ml-[0.3em]">EMPIRE</span>
    </span>
  );
};

export default Wordmark;