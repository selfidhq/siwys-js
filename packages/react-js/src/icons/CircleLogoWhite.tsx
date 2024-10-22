import * as React from "react";
import type { SVGProps } from "react";
const SvgCircleLogoWhite = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 64 63"
    {...props}
  >
    <g filter="url(#circle_logo_white_svg__a)">
      <circle
        cx={32}
        cy={31.5}
        r={19.191}
        stroke="#fff"
        strokeWidth={9.62}
        shapeRendering="crispEdges"
      />
    </g>
    <g filter="url(#circle_logo_white_svg__b)">
      <circle
        cx={31.998}
        cy={31.5}
        r={15.341}
        stroke="#fff"
        strokeWidth={0.495}
      />
    </g>
    <defs>
      <filter
        id="circle_logo_white_svg__a"
        width={62.85}
        height={62.85}
        x={0.575}
        y={0.075}
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
        <feGaussianBlur stdDeviation={3.712} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1266_38" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1266_38"
          result="shape"
        />
      </filter>
      <filter
        id="circle_logo_white_svg__b"
        width={48.993}
        height={48.993}
        x={7.501}
        y={7.003}
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
          radius={3.959}
          result="effect1_dropShadow_1266_38"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={2.474} />
        <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.18 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1266_38" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1266_38"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default SvgCircleLogoWhite;
