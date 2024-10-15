import * as React from "react";
import type { SVGProps } from "react";
const SvgCircleLogoWhite = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 33 32"
    {...props}
  >
    <g filter="url(#circle_logo_white_svg__a)">
      <circle
        cx={16.501}
        cy={16.001}
        r={9.596}
        stroke="#fff"
        strokeWidth={4.81}
        shapeRendering="crispEdges"
      />
    </g>
    <g filter="url(#circle_logo_white_svg__b)">
      <circle
        cx={16.5}
        cy={16.001}
        r={7.671}
        stroke="#fff"
        strokeWidth={0.247}
      />
    </g>
    <defs>
      <filter
        id="circle_logo_white_svg__a"
        width={31.425}
        height={31.425}
        x={0.788}
        y={0.289}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={1.856} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1128_10268"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1128_10268"
          result="shape"
        />
      </filter>
      <filter
        id="circle_logo_white_svg__b"
        width={24.498}
        height={24.497}
        x={4.251}
        y={3.753}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feMorphology
          in="SourceAlpha"
          operator="dilate"
          radius={1.98}
          result="effect1_dropShadow_1128_10268"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={1.237} />
        <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.18 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1128_10268"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1128_10268"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default SvgCircleLogoWhite;
