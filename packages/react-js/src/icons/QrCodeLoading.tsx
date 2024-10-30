import * as React from "react";
import type { SVGProps } from "react";
const SvgQrCodeLoading = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="#83A1F1"
      d="M29.334 16c1.472 0 2.689-1.202 2.444-2.654a16 16 0 1 0-6.498 15.688c1.2-.854 1.19-2.564.148-3.606-1.041-1.041-2.72-1.005-3.986-.254A10.668 10.668 0 0 1 6.145 11.918a10.667 10.667 0 0 1 20.19 1.443C26.7 14.788 27.862 16 29.335 16"
    />
  </svg>
);
export default SvgQrCodeLoading;
