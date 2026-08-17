import { useEffect, useState } from "react";

type FadeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "onLoad"> & {
  /** Real image URL. While empty/unloaded, a neutral placeholder is shown. */
  src?: string | null;
  alt: string;
  /** Tailwind classes for the neutral placeholder fill (defaults to a warm cream tone). */
  placeholderClassName?: string;
  imgRef?: React.Ref<HTMLImageElement>;
  onImageLoad?: () => void;
};

/**
 * Renders a neutral placeholder that fills the parent (which must establish a
 * positioning context) and fades the real image in once it has finished loading.
 * The image keeps its own sizing classes, so no layout shift occurs.
 */
export const FadeImage = ({
  src,
  alt,
  className,
  placeholderClassName = "bg-[#EADFD1]",
  imgRef,
  onImageLoad,
  ...rest
}: FadeImageProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 animate-pulse ${placeholderClassName}`}
        />
      )}
      <img
          ref={imgRef}
          src={src || undefined}
          alt={alt}
          className={`${className ?? ""} transition-opacity duration-300 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => {
            setLoaded(true);
            onImageLoad?.();
          }}
          {...rest}
        />
    </>
  );
};
