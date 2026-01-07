declare module "react-pageflip" {
  import * as React from "react";

  export interface FlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    style?: React.CSSProperties;
    className?: string;
    startPage?: number;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: unknown }) => void;
    onUpdate?: (e: { data: unknown }) => void;
    children?: React.ReactNode;
  }

  export interface PageFlip {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    flip: (pageNum: number, corner?: "top" | "bottom") => void;
    turnToPage: (pageNum: number) => void;
    turnToNextPage: () => void;
    turnToPrevPage: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
    getOrientation: () => "portrait" | "landscape";
    getBoundsRect: () => DOMRect;
    getPageFlip: () => unknown;
  }

  export interface HTMLFlipBookRef {
    pageFlip: () => PageFlip;
  }

  const HTMLFlipBook: React.ForwardRefExoticComponent<
    FlipBookProps & React.RefAttributes<HTMLFlipBookRef>
  >;

  export default HTMLFlipBook;
}
