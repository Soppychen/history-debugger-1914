import { useState } from "react";
import { getVisualFallback, type VisualAsset } from "../assets/visualAssetManifest";

const warnedAssets = new Set<string>();

export function VisualAssetImage({
  asset,
  className,
  fallbackLabel,
  showCaption = false,
  ariaHidden = false,
}: {
  asset: VisualAsset;
  className: string;
  fallbackLabel?: string;
  showCaption?: boolean;
  ariaHidden?: boolean;
}) {
  const [failed, setFailed] = useState(!asset.src);
  const label = fallbackLabel ?? asset.alt;
  const fallback = asset.fallback ?? getVisualFallback(asset.kind);

  function onError() {
    if (!warnedAssets.has(asset.id)) {
      warnedAssets.add(asset.id);
      console.warn(`[visual-asset] missing or failed image: ${asset.id} (${asset.src || "no src"})`);
    }
    setFailed(true);
  }

  const media = failed ? (
    <div className={`${className} asset-fallback visual-fallback`} data-kind={asset.kind} data-fallback={fallback} aria-hidden={ariaHidden}>
      <span>{label}</span>
    </div>
  ) : (
    <img
      className={className}
      src={asset.src}
      alt={ariaHidden ? "" : asset.alt}
      aria-hidden={ariaHidden}
      loading="lazy"
      onError={onError}
    />
  );

  if (!showCaption || !asset.caption) return media;

  return (
    <figure className="visual-asset-figure">
      {media}
      <figcaption>{asset.caption}</figcaption>
    </figure>
  );
}
