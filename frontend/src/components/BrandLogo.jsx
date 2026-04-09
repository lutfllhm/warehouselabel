export default function BrandLogo({
  src = "/img/rbm.png",
  alt = "RBM",
  className = "h-10 w-10 object-contain",
  imgClassName = "",
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${imgClassName}`.trim()}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

